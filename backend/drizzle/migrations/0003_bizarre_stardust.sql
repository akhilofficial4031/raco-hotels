CREATE TABLE `homepage_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`is_published` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_homepage_hotel` ON `homepage_content` (`hotel_id`);--> statement-breakpoint
CREATE INDEX `idx_homepage_published` ON `homepage_content` (`is_published`);