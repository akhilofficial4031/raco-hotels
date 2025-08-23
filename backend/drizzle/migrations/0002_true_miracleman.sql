CREATE TABLE `addon` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`category` text,
	`unit_type` text DEFAULT 'item' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `room_type_addon` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_type_id` integer NOT NULL,
	`addon_id` integer NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`currency_code` text DEFAULT 'INR' NOT NULL,
	`max_quantity` integer,
	`min_quantity` integer DEFAULT 0 NOT NULL,
	`is_available` integer DEFAULT 1 NOT NULL,
	`special_instructions` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`addon_id`) REFERENCES `addon`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `booking_addon` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`room_type_id` integer NOT NULL,
	`addon_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price_cents` integer DEFAULT 0 NOT NULL,
	`total_price_cents` integer DEFAULT 0 NOT NULL,
	`currency_code` text DEFAULT 'INR' NOT NULL,
	`tax_amount_cents` integer DEFAULT 0 NOT NULL,
	`discount_amount_cents` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`addon_id`) REFERENCES `addon`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `booking_draft_addon` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_draft_id` integer NOT NULL,
	`room_type_id` integer NOT NULL,
	`addon_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price_cents` integer DEFAULT 0 NOT NULL,
	`total_price_cents` integer DEFAULT 0 NOT NULL,
	`currency_code` text DEFAULT 'INR' NOT NULL,
	`tax_amount_cents` integer DEFAULT 0 NOT NULL,
	`discount_amount_cents` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_draft_id`) REFERENCES `booking_draft`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`addon_id`) REFERENCES `addon`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_addon_slug` ON `addon` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_addon_active` ON `addon` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_addon_category` ON `addon` (`category`);--> statement-breakpoint
CREATE INDEX `idx_addon_sort` ON `addon` (`sort_order`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_room_type_addon` ON `room_type_addon` (`room_type_id`,`addon_id`);--> statement-breakpoint
CREATE INDEX `idx_room_type_addon_room` ON `room_type_addon` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `idx_room_type_addon_addon` ON `room_type_addon` (`addon_id`);--> statement-breakpoint
CREATE INDEX `idx_room_type_addon_available` ON `room_type_addon` (`is_available`);--> statement-breakpoint
CREATE INDEX `idx_room_type_addon_price` ON `room_type_addon` (`price_cents`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_booking_addon` ON `booking_addon` (`booking_id`,`room_type_id`,`addon_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_addon_booking` ON `booking_addon` (`booking_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_addon_room_type` ON `booking_addon` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_addon_addon` ON `booking_addon` (`addon_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_addon_total` ON `booking_addon` (`total_price_cents`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_booking_draft_addon` ON `booking_draft_addon` (`booking_draft_id`,`room_type_id`,`addon_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_draft_addon_booking` ON `booking_draft_addon` (`booking_draft_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_draft_addon_room_type` ON `booking_draft_addon` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_draft_addon_addon` ON `booking_draft_addon` (`addon_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_draft_addon_total` ON `booking_draft_addon` (`total_price_cents`);