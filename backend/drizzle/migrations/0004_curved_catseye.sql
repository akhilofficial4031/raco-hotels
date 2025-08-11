CREATE TABLE `room` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer NOT NULL,
	`room_type_id` integer NOT NULL,
	`room_number` text NOT NULL,
	`floor` text,
	`description` text,
	`status` text DEFAULT 'available' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_room_hotel` ON `room` (`hotel_id`);--> statement-breakpoint
CREATE INDEX `idx_room_type` ON `room` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `idx_room_status` ON `room` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_room_hotel_number` ON `room` (`hotel_id`,`room_number`);