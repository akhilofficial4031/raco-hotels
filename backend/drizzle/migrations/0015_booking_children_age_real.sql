PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `booking_children_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`age` real NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `booking_children_new` SELECT * FROM `booking_children`;--> statement-breakpoint
DROP TABLE `booking_children`;--> statement-breakpoint
ALTER TABLE `booking_children_new` RENAME TO `booking_children`;--> statement-breakpoint
CREATE INDEX `idx_booking_children_booking` ON `booking_children` (`booking_id`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
