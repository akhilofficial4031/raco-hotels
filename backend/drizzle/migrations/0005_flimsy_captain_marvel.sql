DROP TABLE `rate_plan`;--> statement-breakpoint
DROP TABLE `room_rate`;--> statement-breakpoint
ALTER TABLE `room_inventory` ADD `price_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `room_inventory` ADD `currency_code` text DEFAULT 'INR' NOT NULL;