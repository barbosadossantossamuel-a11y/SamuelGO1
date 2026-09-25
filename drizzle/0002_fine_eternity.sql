CREATE TABLE `delivery_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`establishmentId` int NOT NULL,
	`neighborhood` varchar(120) NOT NULL,
	`fee` int NOT NULL DEFAULT 500,
	`estimatedMinutes` int NOT NULL DEFAULT 35,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_zones_neighborhood_unique` UNIQUE(`establishmentId`,`neighborhood`)
);
--> statement-breakpoint
CREATE INDEX `delivery_zones_establishment_idx` ON `delivery_zones` (`establishmentId`);