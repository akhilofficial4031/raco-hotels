ALTER TABLE `booking` ADD `payment_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `booking` ADD `payment_method` text;--> statement-breakpoint
ALTER TABLE `booking` ADD `payment_processor` text;--> statement-breakpoint
ALTER TABLE `booking_item` ADD `status` text DEFAULT 'active' NOT NULL;