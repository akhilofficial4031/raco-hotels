ALTER TABLE `room_type` ADD `extra_adult_charge_cents` integer NOT NULL DEFAULT 100000;--> statement-breakpoint
CREATE TABLE `booking_children` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`age` integer NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `idx_booking_children_booking` ON `booking_children` (`booking_id`);
