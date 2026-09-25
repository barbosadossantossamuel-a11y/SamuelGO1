CREATE TABLE `business_hours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`isOpen` int NOT NULL DEFAULT 1,
	`openTime` varchar(5) NOT NULL DEFAULT '11:00',
	`closeTime` varchar(5) NOT NULL DEFAULT '22:00',
	CONSTRAINT `business_hours_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(12) DEFAULT '•',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`deliveryEnabled` int NOT NULL DEFAULT 1,
	`pickupEnabled` int NOT NULL DEFAULT 1,
	`fixedFee` int NOT NULL DEFAULT 500,
	`minimumOrder` int NOT NULL DEFAULT 0,
	`estimatedMinutes` int NOT NULL DEFAULT 35,
	`address` text,
	CONSTRAINT `delivery_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `establishments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`businessType` varchar(80) NOT NULL DEFAULT 'Outro',
	`logoUrl` text,
	`bannerUrl` text,
	`description` text,
	`phone` varchar(40),
	`whatsapp` varchar(40),
	`instagram` varchar(120),
	`address` text,
	`cnpj` varchar(32),
	`isPublished` int NOT NULL DEFAULT 0,
	`views` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `establishments_id` PRIMARY KEY(`id`),
	CONSTRAINT `establishments_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `modifier_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`required` int NOT NULL DEFAULT 0,
	`minQuantity` int NOT NULL DEFAULT 0,
	`maxQuantity` int NOT NULL DEFAULT 1,
	CONSTRAINT `modifier_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modifiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `modifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_item_modifiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderItemId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	CONSTRAINT `order_item_modifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`productName` varchar(160) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` int NOT NULL DEFAULT 0,
	`modifiersJson` text,
	`notes` text,
	`lineTotal` int NOT NULL DEFAULT 0,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`orderNumber` int NOT NULL,
	`customerName` varchar(120) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`fulfillmentType` enum('delivery','pickup') NOT NULL,
	`address` text,
	`paymentMethod` enum('pix','cash','debit','credit') NOT NULL,
	`changeFor` int,
	`notes` text,
	`subtotal` int NOT NULL DEFAULT 0,
	`deliveryFee` int NOT NULL DEFAULT 0,
	`total` int NOT NULL DEFAULT 0,
	`status` enum('new','confirmed','preparing','out_for_delivery','completed','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_modifier_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`groupId` int NOT NULL,
	CONSTRAINT `product_modifier_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`imageUrl` text,
	`price` int NOT NULL DEFAULT 0,
	`promoPrice` int,
	`isFeatured` int NOT NULL DEFAULT 0,
	`isAvailable` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`plan` enum('free','essential','professional','premium') NOT NULL DEFAULT 'free',
	`status` enum('active','trialing','past_due','cancelled') NOT NULL DEFAULT 'trialing',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`renewsAt` timestamp,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`templateId` varchar(80) NOT NULL DEFAULT 'burger-dark',
	`primaryColor` varchar(20) NOT NULL DEFAULT '#ee5c3b',
	`secondaryColor` varchar(20) NOT NULL DEFAULT '#161616',
	`backgroundColor` varchar(20) NOT NULL DEFAULT '#f8f7f3',
	`font` varchar(80) NOT NULL DEFAULT 'DM Sans',
	`cardStyle` varchar(30) NOT NULL DEFAULT 'rounded',
	`borderRadius` int NOT NULL DEFAULT 18,
	CONSTRAINT `themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `categories_establishment_idx` ON `categories` (`establishmentId`);--> statement-breakpoint
CREATE INDEX `establishments_owner_idx` ON `establishments` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `orders_establishment_idx` ON `orders` (`establishmentId`);--> statement-breakpoint
CREATE INDEX `products_establishment_idx` ON `products` (`establishmentId`);