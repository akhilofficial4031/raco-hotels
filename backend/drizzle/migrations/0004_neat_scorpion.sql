DROP TABLE `booking_draft`;--> statement-breakpoint
DROP TABLE `booking_draft_item`;--> statement-breakpoint
DROP TABLE `booking_draft_addon`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
DROP INDEX IF EXISTS `uq_booking_item`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_booking_item_date`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_booking_addon_total`;--> statement-breakpoint
ALTER TABLE `booking_item` ADD `room_id` integer NOT NULL REFERENCES room(id);--> statement-breakpoint
ALTER TABLE `booking_addon` ADD `price_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `booking_item` DROP COLUMN `date`;--> statement-breakpoint
ALTER TABLE `booking_item` DROP COLUMN `price_cents`;--> statement-breakpoint
ALTER TABLE `booking_item` DROP COLUMN `tax_amount_cents`;--> statement-breakpoint
ALTER TABLE `booking_item` DROP COLUMN `fee_amount_cents`;--> statement-breakpoint
ALTER TABLE `booking_item` DROP COLUMN `created_at`;--> statement-breakpoint
ALTER TABLE `booking_addon` DROP COLUMN `unit_price_cents`;--> statement-breakpoint
ALTER TABLE `booking_addon` DROP COLUMN `total_price_cents`;--> statement-breakpoint
ALTER TABLE `booking_addon` DROP COLUMN `currency_code`;--> statement-breakpoint
ALTER TABLE `booking_addon` DROP COLUMN `tax_amount_cents`;--> statement-breakpoint
ALTER TABLE `booking_addon` DROP COLUMN `discount_amount_cents`;