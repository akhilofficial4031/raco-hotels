CREATE TABLE `customer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text,
	`alternate_phone` text,
	`date_of_birth` text,
	`gender` text,
	`nationality` text,
	`id_type` text,
	`id_number` text,
	`address_line1` text,
	`address_line2` text,
	`city` text,
	`state` text,
	`country` text,
	`postal_code` text,
	`dietary_preferences` text,
	`special_requests` text,
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`loyalty_number` text,
	`marketing_opt_in` integer DEFAULT 0 NOT NULL,
	`source` text DEFAULT 'web' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_booking_at` text
);
--> statement-breakpoint
/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `booking` ADD `customer_id` integer REFERENCES customer(id);--> statement-breakpoint
ALTER TABLE `booking` ADD `admin_id` integer REFERENCES user(id);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_customer_email` ON `customer` (`email`);--> statement-breakpoint
CREATE INDEX `idx_customer_email` ON `customer` (`email`);--> statement-breakpoint
CREATE INDEX `idx_customer_phone` ON `customer` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_customer_name` ON `customer` (`full_name`);--> statement-breakpoint
CREATE INDEX `idx_customer_status` ON `customer` (`status`);--> statement-breakpoint
CREATE INDEX `idx_customer_source` ON `customer` (`source`);--> statement-breakpoint
CREATE INDEX `idx_customer_last_booking` ON `customer` (`last_booking_at`);--> statement-breakpoint
CREATE INDEX `idx_booking_customer` ON `booking` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_admin` ON `booking` (`admin_id`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/