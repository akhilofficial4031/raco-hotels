CREATE TABLE `attraction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_attraction_hotel` ON `attraction` (`hotel_id`);--> statement-breakpoint
CREATE INDEX `idx_attraction_slug` ON `attraction` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_attraction_name` ON `attraction` (`name`);