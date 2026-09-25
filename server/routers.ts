import { COOKIE_NAME } from "@shared/const";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  categories,
  createDeliveryZone,
  createOrder,
  deleteDeliveryZone,
  establishments,
  getDeliveryZonesForUser,
  getDashboardData,
  getDb,
  getOrdersForUser,
  getOrCreateEstablishment,
  getProductsForUser,
  getPublicMenu,
  orders,
  products,
  publishEstablishment,
  setOrderStatus,
  slugify,
  updateDeliveryZone,
  updateEstablishment,
  updateTheme,
} from "./db";

const orderStatus = z.enum(["new", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"]);
const money = z.number().int().nonnegative().max(1000000);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    overview: protectedProcedure.query(({ ctx }) => getDashboardData(ctx.user.id)),
  }),
  establishment: router({
    mine: protectedProcedure.query(({ ctx }) => getOrCreateEstablishment(ctx.user.id, ctx.user.name)),
    update: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(160).optional(),
      description: z.string().trim().max(500).optional(),
      whatsapp: z.string().trim().max(40).optional(),
      instagram: z.string().trim().max(120).optional(),
      phone: z.string().trim().max(40).optional(),
      address: z.string().trim().max(500).optional(),
      businessType: z.string().trim().max(80).optional(),
      logoUrl: z.string().url().optional(),
      bannerUrl: z.string().url().optional(),
    })).mutation(({ ctx, input }) => updateEstablishment(ctx.user.id, input)),
    publish: protectedProcedure.input(z.object({ isPublished: z.boolean() })).mutation(({ ctx, input }) => publishEstablishment(ctx.user.id, input.isPublished)),
  }),
  delivery: router({
    zones: protectedProcedure.query(({ ctx }) => getDeliveryZonesForUser(ctx.user.id)),
    createZone: protectedProcedure.input(z.object({ neighborhood: z.string().trim().min(2).max(120), fee: money, estimatedMinutes: z.number().int().min(10).max(240) })).mutation(({ ctx, input }) => createDeliveryZone(ctx.user.id, input)),
    updateZone: protectedProcedure.input(z.object({ id: z.number().int().positive(), neighborhood: z.string().trim().min(2).max(120).optional(), fee: money.optional(), estimatedMinutes: z.number().int().min(10).max(240).optional(), isActive: z.boolean().optional() })).mutation(({ ctx, input }) => updateDeliveryZone(ctx.user.id, input)),
    deleteZone: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteDeliveryZone(ctx.user.id, input.id)),
  }),
  products: router({
    list: protectedProcedure.query(({ ctx }) => getProductsForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      categoryId: z.number().int().positive(),
      name: z.string().trim().min(2).max(160),
      description: z.string().trim().max(500).optional(),
      imageUrl: z.string().url().optional(),
      price: money,
      promoPrice: money.optional(),
      isFeatured: z.boolean().default(false),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");
      const establishment = await getOrCreateEstablishment(ctx.user.id);
      await db.insert(products).values({ ...input, establishmentId: establishment.id, isFeatured: input.isFeatured ? 1 : 0, imageUrl: input.imageUrl ?? null, description: input.description ?? null, promoPrice: input.promoPrice ?? null });
      return { success: true };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      categoryId: z.number().int().positive().optional(),
      name: z.string().trim().min(2).max(160).optional(),
      description: z.string().trim().max(500).optional(),
      price: money.optional(),
      promoPrice: money.nullable().optional(),
      isAvailable: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");
      const establishment = await getOrCreateEstablishment(ctx.user.id);
      const { id, isAvailable, isFeatured, ...rest } = input;
      await db.update(products).set({ ...rest, ...(isAvailable === undefined ? {} : { isAvailable: isAvailable ? 1 : 0 }), ...(isFeatured === undefined ? {} : { isFeatured: isFeatured ? 1 : 0 }) }).where(and(eq(products.id, id), eq(products.establishmentId, establishment.id)));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");
      const establishment = await getOrCreateEstablishment(ctx.user.id);
      await db.delete(products).where(and(eq(products.id, input.id), eq(products.establishmentId, establishment.id)));
      return { success: true };
    }),
  }),
  orders: router({
    list: protectedProcedure.query(({ ctx }) => getOrdersForUser(ctx.user.id)),
    updateStatus: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: orderStatus })).mutation(({ ctx, input }) => setOrderStatus(ctx.user.id, input.id, input.status)),
    create: publicProcedure.input(z.object({
      establishmentId: z.number().int().positive(),
      customerName: z.string().trim().min(2).max(120),
      phone: z.string().trim().min(8).max(40),
      fulfillmentType: z.enum(["delivery", "pickup"]),
      address: z.string().trim().max(500).optional(),
      neighborhood: z.string().trim().max(120).optional(),
      paymentMethod: z.enum(["pix", "cash", "debit", "credit"]),
      changeFor: money.optional(),
      notes: z.string().trim().max(500).optional(),
      deliveryFee: money.optional(),
      items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20), modifiers: z.array(z.object({ name: z.string(), price: money })).optional(), notes: z.string().max(300).optional() })).min(1),
    })).mutation(({ input }) => createOrder(input)),
  }),
  theme: router({
    update: protectedProcedure.input(z.object({ templateId: z.string().min(2).max(80), primaryColor: z.string().optional(), secondaryColor: z.string().optional(), backgroundColor: z.string().optional(), font: z.string().optional(), cardStyle: z.string().optional(), borderRadius: z.number().int().min(0).max(40).optional() })).mutation(({ ctx, input }) => updateTheme(ctx.user.id, input)),
  }),
  publicMenu: router({
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(2).max(160) })).query(({ input }) => getPublicMenu(input.slug)),
  }),
});

export type AppRouter = typeof appRouter;
