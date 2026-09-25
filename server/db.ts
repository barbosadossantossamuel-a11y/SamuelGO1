import { and, asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  businessHours,
  categories,
  deliverySettings,
  deliveryZones,
  establishments,
  modifierGroups,
  modifiers,
  orderItems,
  orders,
  products,
  subscriptions,
  themes,
  users,
  type InsertUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) {
    values.role = user.role ?? "admin";
    updateSet.role = values.role;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "meu-cardapio";
}

export function normalizeNeighborhood(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function resolveDeliveryZone(zones: Array<{ neighborhood: string; fee: number; estimatedMinutes: number }>, neighborhood?: string) {
  if (!neighborhood) return undefined;
  const normalized = normalizeNeighborhood(neighborhood);
  return zones.find(zone => normalizeNeighborhood(zone.neighborhood) === normalized);
}

export function getTrialEndDate(createdAt: Date) {
  return new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
}

const image = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

async function seedEstablishment(establishmentId: number, type = "Hamburgueria") {
  const db = await getDb();
  if (!db) return;
  const existingCategories = await db.select().from(categories).where(eq(categories.establishmentId, establishmentId)).limit(1);
  if (existingCategories.length) return;

  const categoryNames = type === "Pizzaria"
    ? [["Pizzas", "◒"], ["Combos", "✦"], ["Bebidas", "◌"], ["Sobremesas", "✿"]]
    : type === "Açaíteria"
      ? [["Açaí", "✺"], ["Adicionais", "＋"], ["Combos", "✦"], ["Bebidas", "◌"]]
      : [["Favoritos da casa", "★"], ["Combos", "✦"], ["Porções", "◒"], ["Bebidas", "◌"], ["Sobremesas", "✿"]];
  for (let index = 0; index < categoryNames.length; index += 1) {
    await db.insert(categories).values({ establishmentId, name: categoryNames[index][0], icon: categoryNames[index][1], sortOrder: index });
  }
  const seededCategories = await db.select().from(categories).where(eq(categories.establishmentId, establishmentId)).orderBy(asc(categories.sortOrder));
  const first = seededCategories[0]?.id;
  const second = seededCategories[1]?.id ?? first;
  const third = seededCategories[2]?.id ?? first;
  const productsForType = type === "Pizzaria"
    ? [
        { categoryId: first, name: "Margherita clássica", description: "Molho artesanal, fior di latte, manjericão fresco e azeite.", price: 4290, imageUrl: image("photo-1574071318508-1cdbab80d002") },
        { categoryId: first, name: "Calabresa da casa", description: "Calabresa defumada, cebola roxa e orégano.", price: 4690, promoPrice: 4290, imageUrl: image("photo-1579751626657-72bc17010498") },
        { categoryId: second, name: "Pizza + refri", description: "Uma pizza grande e refrigerante 1,5L.", price: 5290, imageUrl: image("photo-1574071318508-1cdbab80d002") },
      ]
    : type === "Açaíteria"
      ? [
          { categoryId: first, name: "Açaí tropical 500ml", description: "Açaí cremoso, banana, morango e granola crocante.", price: 2890, imageUrl: image("photo-1590301157890-4810ed352733") },
          { categoryId: first, name: "Açaí com leite ninho", description: "Açaí, leite em pó, morango e leite condensado.", price: 3290, promoPrice: 2990, imageUrl: image("photo-1517093157656-b9eccef91cb1") },
          { categoryId: second, name: "Granola premium", description: "Porção extra para deixar seu bowl ainda mais crocante.", price: 490, imageUrl: image("photo-1590301157890-4810ed352733") },
        ]
      : [
          { categoryId: first, name: "X-Bacon da casa", description: "Blend bovino 180g, cheddar cremoso, bacon crocante e molho especial.", price: 2890, promoPrice: 2490, imageUrl: image("photo-1568901346375-23c9450c58cd") },
          { categoryId: first, name: "X-Salada artesanal", description: "Blend bovino, queijo, alface, tomate e maionese da casa.", price: 2490, imageUrl: image("photo-1550547660-d9450f859349") },
          { categoryId: second, name: "Combo Burger + fritas", description: "Seu burger favorito com batata rústica e bebida gelada.", price: 3590, imageUrl: image("photo-1573080496219-bb080dd4f877") },
          { categoryId: third, name: "Batata rústica", description: "Porção generosa com páprica defumada e molho da casa.", price: 1590, imageUrl: image("photo-1573080496219-bb080dd4f877") },
          { categoryId: seededCategories[3]?.id ?? third, name: "Refrigerante lata", description: "Lata bem gelada para acompanhar.", price: 690, imageUrl: image("photo-1544145945-f90425340c7e") },
        ];
  for (let index = 0; index < productsForType.length; index += 1) {
    const product = productsForType[index];
    if (!product.categoryId) continue;
    await db.insert(products).values({ ...product, establishmentId, sortOrder: index, isFeatured: index < 2 ? 1 : 0 });
  }
  await db.insert(themes).values({ establishmentId, templateId: type === "Açaíteria" ? "acai-tropical" : type === "Pizzaria" ? "pizza-italiana" : "burger-dark" });
  await db.insert(deliverySettings).values({ establishmentId, address: "Rua das Palmeiras, 240 — Centro" });
  for (let day = 0; day < 7; day += 1) {
    await db.insert(businessHours).values({ establishmentId, dayOfWeek: day, isOpen: day !== 0 ? 1 : 0 });
  }
  await db.insert(subscriptions).values({ establishmentId, plan: "free", status: "trialing" });
};

async function ensureDefaultDeliveryZones(establishmentId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: deliveryZones.id }).from(deliveryZones).where(eq(deliveryZones.establishmentId, establishmentId)).limit(1);
  if (existing.length) return;
  await db.insert(deliveryZones).values([
    { establishmentId, neighborhood: "Centro", fee: 500, estimatedMinutes: 30 },
    { establishmentId, neighborhood: "Jardim América", fee: 800, estimatedMinutes: 40 },
    { establishmentId, neighborhood: "Vila Nova", fee: 1000, estimatedMinutes: 50 },
  ]);
}

export async function getOrCreateEstablishment(userId: number, userName?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const rows = await db.select().from(establishments).where(eq(establishments.ownerUserId, userId)).limit(1);
  if (rows[0]) {
    await seedEstablishment(rows[0].id, rows[0].businessType);
    await ensureDefaultDeliveryZones(rows[0].id);
    return rows[0];
  }
  const name = userName ? `${userName.split(" ")[0]}'s Kitchen` : "Meu estabelecimento";
  const slugBase = slugify(name);
  const slug = `${slugBase}-${String(userId).slice(-4)}`;
  await db.insert(establishments).values({ ownerUserId: userId, name, slug, businessType: "Hamburgueria", description: "Sabor de verdade, feito para pedir sem complicação." });
  const created = await db.select().from(establishments).where(eq(establishments.ownerUserId, userId)).limit(1);
  if (!created[0]) throw new Error("Não foi possível criar o estabelecimento");
  await seedEstablishment(created[0].id, created[0].businessType);
  await ensureDefaultDeliveryZones(created[0].id);
  return created[0];
}

export async function getSubscriptionStatus(establishmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  let rows = await db.select().from(subscriptions).where(eq(subscriptions.establishmentId, establishmentId)).limit(1);
  if (!rows[0]) {
    await db.insert(subscriptions).values({ establishmentId, plan: "free", status: "trialing" });
    rows = await db.select().from(subscriptions).where(eq(subscriptions.establishmentId, establishmentId)).limit(1);
  }
  const subscription = rows[0];
  if (!subscription) throw new Error("Não foi possível carregar a assinatura");
  const now = Date.now();
  const trialEndsAt = subscription.status === "trialing" ? getTrialEndDate(subscription.createdAt) : null;
  const trialExpired = Boolean(trialEndsAt && now >= trialEndsAt.getTime());
  const renewalExpired = subscription.status === "active" && subscription.renewsAt && now >= subscription.renewsAt.getTime();
  if ((trialExpired || renewalExpired) && subscription.status !== "past_due") {
    await db.update(subscriptions).set({ status: "past_due" }).where(eq(subscriptions.id, subscription.id));
    subscription.status = "past_due";
  }
  const isActive = subscription.status === "active" || (subscription.status === "trialing" && !trialExpired);
  const expiry = subscription.status === "active" ? subscription.renewsAt : trialEndsAt;
  return { subscription, trialEndsAt, isActive, requiresPlan: !isActive, daysRemaining: expiry ? Math.max(0, Math.ceil((expiry.getTime() - now) / (24 * 60 * 60 * 1000))) : 0 };
}

export async function getSubscriptionForUser(userId: number) {
  const establishment = await getOrCreateEstablishment(userId);
  return getSubscriptionStatus(establishment.id);
}

export async function renewSubscription(userId: number, plan: "essential" | "professional" | "premium") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.update(subscriptions).set({ plan, status: "active", renewsAt }).where(eq(subscriptions.establishmentId, establishment.id));
  return getSubscriptionStatus(establishment.id);
}

export async function getDashboardData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  const [productCount, categoryCount, orderCount, revenue, recentOrders] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.establishmentId, establishment.id)),
    db.select({ count: sql<number>`count(*)` }).from(categories).where(eq(categories.establishmentId, establishment.id)),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.establishmentId, establishment.id)),
    db.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` }).from(orders).where(and(eq(orders.establishmentId, establishment.id), sql`${orders.status} <> 'cancelled'`)),
    db.select().from(orders).where(eq(orders.establishmentId, establishment.id)).orderBy(desc(orders.createdAt)).limit(5),
  ]);
  const subscription = await getSubscriptionStatus(establishment.id);
  return { establishment, subscription, counts: { products: Number(productCount[0]?.count ?? 0), categories: Number(categoryCount[0]?.count ?? 0), orders: Number(orderCount[0]?.count ?? 0), revenue: Number(revenue[0]?.total ?? 0) }, recentOrders };
}

export async function getPublicMenu(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const found = await db.select().from(establishments).where(and(eq(establishments.slug, slug), eq(establishments.isPublished, 1))).limit(1);
  const establishment = found[0];
  if (!establishment) return null;
  const subscription = await getSubscriptionStatus(establishment.id);
  if (!subscription.isActive) return null;
  await db.update(establishments).set({ views: sql`${establishments.views} + 1` }).where(eq(establishments.id, establishment.id));
  const [menuCategories, menuProducts, theme, delivery, hours, zones] = await Promise.all([
    db.select().from(categories).where(and(eq(categories.establishmentId, establishment.id), eq(categories.isActive, 1))).orderBy(asc(categories.sortOrder)),
    db.select().from(products).where(and(eq(products.establishmentId, establishment.id), eq(products.isAvailable, 1))).orderBy(asc(products.sortOrder)),
    db.select().from(themes).where(eq(themes.establishmentId, establishment.id)).limit(1),
    db.select().from(deliverySettings).where(eq(deliverySettings.establishmentId, establishment.id)).limit(1),
    db.select().from(businessHours).where(eq(businessHours.establishmentId, establishment.id)).orderBy(asc(businessHours.dayOfWeek)),
    db.select().from(deliveryZones).where(and(eq(deliveryZones.establishmentId, establishment.id), eq(deliveryZones.isActive, 1))).orderBy(asc(deliveryZones.neighborhood)),
  ]);
  return { establishment, categories: menuCategories, products: menuProducts, theme: theme[0] ?? null, delivery: delivery[0] ?? null, hours, deliveryZones: zones };
}

export async function getDeliveryZonesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const establishment = await getOrCreateEstablishment(userId);
  return db.select().from(deliveryZones).where(eq(deliveryZones.establishmentId, establishment.id)).orderBy(asc(deliveryZones.neighborhood));
}

export async function createDeliveryZone(userId: number, input: { neighborhood: string; fee: number; estimatedMinutes: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  const neighborhood = input.neighborhood.trim().replace(/\s+/g, " ");
  if (!neighborhood) throw new Error("Informe o bairro");
  await db.insert(deliveryZones).values({ establishmentId: establishment.id, neighborhood, fee: input.fee, estimatedMinutes: input.estimatedMinutes });
  return { success: true };
}

export async function updateDeliveryZone(userId: number, input: { id: number; neighborhood?: string; fee?: number; estimatedMinutes?: number; isActive?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  const { id, isActive, neighborhood, ...rest } = input;
  await db.update(deliveryZones).set({ ...rest, ...(neighborhood === undefined ? {} : { neighborhood: neighborhood.trim().replace(/\s+/g, " ") }), ...(isActive === undefined ? {} : { isActive: isActive ? 1 : 0 }) }).where(and(eq(deliveryZones.id, id), eq(deliveryZones.establishmentId, establishment.id)));
  return { success: true };
}

export async function deleteDeliveryZone(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  await db.delete(deliveryZones).where(and(eq(deliveryZones.id, id), eq(deliveryZones.establishmentId, establishment.id)));
  return { success: true };
}

export async function getProductsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const establishment = await getOrCreateEstablishment(userId);
  return db.select({ product: products, categoryName: categories.name }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.establishmentId, establishment.id)).orderBy(asc(products.sortOrder));
}

export async function getOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const establishment = await getOrCreateEstablishment(userId);
  return db.select().from(orders).where(eq(orders.establishmentId, establishment.id)).orderBy(desc(orders.createdAt)).limit(50);
}

export async function setOrderStatus(userId: number, orderId: number, status: "new" | "confirmed" | "preparing" | "out_for_delivery" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  await db.update(orders).set({ status }).where(and(eq(orders.id, orderId), eq(orders.establishmentId, establishment.id)));
  return { success: true };
}

export async function createOrder(input: {
  establishmentId: number;
  customerName: string;
  phone: string;
  fulfillmentType: "delivery" | "pickup";
  address?: string;
  neighborhood?: string;
  paymentMethod: "pix" | "cash" | "debit" | "credit";
  changeFor?: number;
  notes?: string;
  deliveryFee?: number;
  items: Array<{ productId: number; quantity: number; modifiers?: Array<{ name: string; price: number }>; notes?: string }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const validProducts = await db.select().from(products).where(eq(products.establishmentId, input.establishmentId));
  const lineItems = input.items.map(item => {
    const product = validProducts.find(candidate => candidate.id === item.productId);
    if (!product) throw new Error("Produto inválido");
    const modifiersTotal = (item.modifiers ?? []).reduce((sum, modifier) => sum + modifier.price, 0);
    const unitPrice = product.promoPrice ?? product.price;
    return { ...item, product, unitPrice, lineTotal: (unitPrice + modifiersTotal) * item.quantity };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const activeZones = input.fulfillmentType === "delivery"
    ? await db.select().from(deliveryZones).where(and(eq(deliveryZones.establishmentId, input.establishmentId), eq(deliveryZones.isActive, 1)))
    : [];
  const selectedZone = resolveDeliveryZone(activeZones, input.neighborhood);
  if (input.fulfillmentType === "delivery" && !selectedZone) throw new Error("Bairro fora da área de entrega");
  const deliveryFee = input.fulfillmentType === "pickup" ? 0 : (selectedZone?.fee ?? input.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;
  const latest = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.establishmentId, input.establishmentId)).orderBy(desc(orders.orderNumber)).limit(1);
  const orderNumber = (latest[0]?.orderNumber ?? 1000) + 1;
  await db.insert(orders).values({ establishmentId: input.establishmentId, orderNumber, customerName: input.customerName, phone: input.phone, fulfillmentType: input.fulfillmentType, address: input.address ?? null, paymentMethod: input.paymentMethod, changeFor: input.changeFor ?? null, notes: input.notes ?? null, subtotal, deliveryFee, total });
  const created = await db.select().from(orders).where(and(eq(orders.establishmentId, input.establishmentId), eq(orders.orderNumber, orderNumber))).limit(1);
  const order = created[0];
  if (!order) throw new Error("Não foi possível criar o pedido");
  for (const item of lineItems) {
    await db.insert(orderItems).values({ orderId: order.id, productId: item.product.id, productName: item.product.name, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal, modifiersJson: JSON.stringify(item.modifiers ?? []), notes: item.notes ?? null });
  }
  return { order, lineItems };
}

export async function updateEstablishment(userId: number, input: { name?: string; description?: string; whatsapp?: string; instagram?: string; phone?: string; address?: string; businessType?: string; logoUrl?: string; bannerUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  await db.update(establishments).set(input).where(and(eq(establishments.id, establishment.id), eq(establishments.ownerUserId, userId)));
  return db.select().from(establishments).where(eq(establishments.id, establishment.id)).limit(1).then(rows => rows[0]);
}

export async function updateTheme(userId: number, input: { templateId: string; primaryColor?: string; secondaryColor?: string; backgroundColor?: string; font?: string; cardStyle?: string; borderRadius?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  const existing = await db.select().from(themes).where(eq(themes.establishmentId, establishment.id)).limit(1);
  if (existing[0]) await db.update(themes).set(input).where(eq(themes.id, existing[0].id));
  else await db.insert(themes).values({ establishmentId: establishment.id, ...input });
  return { success: true };
}

export async function publishEstablishment(userId: number, isPublished: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const establishment = await getOrCreateEstablishment(userId);
  await db.update(establishments).set({ isPublished: isPublished ? 1 : 0 }).where(and(eq(establishments.id, establishment.id), eq(establishments.ownerUserId, userId)));
  return { slug: establishment.slug, isPublished };
}

export { businessHours, categories, deliverySettings, establishments, modifierGroups, modifiers, products, themes, orders, orderItems, subscriptions };
