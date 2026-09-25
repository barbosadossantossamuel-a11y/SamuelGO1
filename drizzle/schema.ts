import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const establishments = mysqlTable(
  "establishments",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    businessType: varchar("businessType", { length: 80 }).notNull().default("Outro"),
    logoUrl: text("logoUrl"),
    bannerUrl: text("bannerUrl"),
    description: text("description"),
    phone: varchar("phone", { length: 40 }),
    whatsapp: varchar("whatsapp", { length: 40 }),
    instagram: varchar("instagram", { length: 120 }),
    address: text("address"),
    cnpj: varchar("cnpj", { length: 32 }),
    isPublished: int("isPublished").notNull().default(0),
    views: int("views").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    ownerIdx: index("establishments_owner_idx").on(table.ownerUserId),
    slugUnique: uniqueIndex("establishments_slug_unique").on(table.slug),
  }),
);

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    establishmentId: int("establishmentId").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 12 }).default("•"),
    sortOrder: int("sortOrder").notNull().default(0),
    isActive: int("isActive").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ establishmentIdx: index("categories_establishment_idx").on(table.establishmentId) }),
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    establishmentId: int("establishmentId").notNull(),
    categoryId: int("categoryId").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    price: int("price").notNull().default(0),
    promoPrice: int("promoPrice"),
    isFeatured: int("isFeatured").notNull().default(0),
    isAvailable: int("isAvailable").notNull().default(1),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ establishmentIdx: index("products_establishment_idx").on(table.establishmentId) }),
);

export const modifierGroups = mysqlTable("modifier_groups", {
  id: int("id").autoincrement().primaryKey(),
  establishmentId: int("establishmentId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  required: int("required").notNull().default(0),
  minQuantity: int("minQuantity").notNull().default(0),
  maxQuantity: int("maxQuantity").notNull().default(1),
});

export const modifiers = mysqlTable("modifiers", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  price: int("price").notNull().default(0),
  isActive: int("isActive").notNull().default(1),
});

export const productModifierGroups = mysqlTable("product_modifier_groups", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  groupId: int("groupId").notNull(),
});

export const businessHours = mysqlTable("business_hours", {
  id: int("id").autoincrement().primaryKey(),
  establishmentId: int("establishmentId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(),
  isOpen: int("isOpen").notNull().default(1),
  openTime: varchar("openTime", { length: 5 }).notNull().default("11:00"),
  closeTime: varchar("closeTime", { length: 5 }).notNull().default("22:00"),
});

export const deliverySettings = mysqlTable("delivery_settings", {
  id: int("id").autoincrement().primaryKey(),
  establishmentId: int("establishmentId").notNull(),
  deliveryEnabled: int("deliveryEnabled").notNull().default(1),
  pickupEnabled: int("pickupEnabled").notNull().default(1),
  fixedFee: int("fixedFee").notNull().default(500),
  minimumOrder: int("minimumOrder").notNull().default(0),
  estimatedMinutes: int("estimatedMinutes").notNull().default(35),
  address: text("address"),
});

export const themes = mysqlTable("themes", {
  id: int("id").autoincrement().primaryKey(),
  establishmentId: int("establishmentId").notNull(),
  templateId: varchar("templateId", { length: 80 }).notNull().default("burger-dark"),
  primaryColor: varchar("primaryColor", { length: 20 }).notNull().default("#ee5c3b"),
  secondaryColor: varchar("secondaryColor", { length: 20 }).notNull().default("#161616"),
  backgroundColor: varchar("backgroundColor", { length: 20 }).notNull().default("#f8f7f3"),
  font: varchar("font", { length: 80 }).notNull().default("DM Sans"),
  cardStyle: varchar("cardStyle", { length: 30 }).notNull().default("rounded"),
  borderRadius: int("borderRadius").notNull().default(18),
});

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    establishmentId: int("establishmentId").notNull(),
    orderNumber: int("orderNumber").notNull(),
    customerName: varchar("customerName", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    fulfillmentType: mysqlEnum("fulfillmentType", ["delivery", "pickup"]).notNull(),
    address: text("address"),
    paymentMethod: mysqlEnum("paymentMethod", ["pix", "cash", "debit", "credit"]).notNull(),
    changeFor: int("changeFor"),
    notes: text("notes"),
    subtotal: int("subtotal").notNull().default(0),
    deliveryFee: int("deliveryFee").notNull().default(0),
    total: int("total").notNull().default(0),
    status: mysqlEnum("status", ["new", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"]).notNull().default("new"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ establishmentIdx: index("orders_establishment_idx").on(table.establishmentId) }),
);

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 160 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  unitPrice: int("unitPrice").notNull().default(0),
  modifiersJson: text("modifiersJson"),
  notes: text("notes"),
  lineTotal: int("lineTotal").notNull().default(0),
});

export const orderItemModifiers = mysqlTable("order_item_modifiers", {
  id: int("id").autoincrement().primaryKey(),
  orderItemId: int("orderItemId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  price: int("price").notNull().default(0),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  establishmentId: int("establishmentId").notNull(),
  plan: mysqlEnum("plan", ["free", "essential", "professional", "premium"]).notNull().default("free"),
  status: mysqlEnum("status", ["active", "trialing", "past_due", "cancelled"]).notNull().default("trialing"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  renewsAt: timestamp("renewsAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Establishment = typeof establishments.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Theme = typeof themes.$inferSelect;
