/*
  Fix booking_item table structure and remove rate_plan foreign key constraint
  
  The booking_item table was created with a foreign key to rate_plan table,
  but rate_plan was dropped in migration 0005. This migration recreates
  booking_item with the correct structure matching our current schema.
*/--> statement-breakpoint

-- Step 1: Drop the existing booking_item table (with old structure and FK constraints)
DROP TABLE `booking_item`;--> statement-breakpoint

-- Step 2: Recreate booking_item table with new structure (no rate_plan_id)
CREATE TABLE `booking_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`room_type_id` integer NOT NULL,
	`room_id` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE cascade ON DELETE restrict
);--> statement-breakpoint

-- Step 3: Recreate the indexes
CREATE INDEX `idx_booking_item_booking` ON `booking_item` (`booking_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_item_room` ON `booking_item` (`room_id`);
