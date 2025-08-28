DROP INDEX IF EXISTS `uq_customer_email`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_customer_source`;--> statement-breakpoint
ALTER TABLE `user` ADD `customer_id` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `last_login_at` text;--> statement-breakpoint
ALTER TABLE `user` ADD `password_reset_token` text;--> statement-breakpoint
ALTER TABLE `user` ADD `password_reset_expires_at` text;--> statement-breakpoint
ALTER TABLE `user` ADD `email_verified` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `email_verification_token` text;--> statement-breakpoint
ALTER TABLE `customer` ADD `has_user_account` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `customer` ADD `first_booking_source` text DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE `customer` ADD `total_bookings` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `customer` ADD `total_spent_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `customer` ADD `preferred_payment_method` text;--> statement-breakpoint
ALTER TABLE `customer` ADD `vip_status` text DEFAULT 'regular';--> statement-breakpoint
ALTER TABLE `customer` ADD `preferred_contact_method` text DEFAULT 'email';--> statement-breakpoint
ALTER TABLE `customer` ADD `language_preference` text DEFAULT 'en';--> statement-breakpoint
ALTER TABLE `customer` ADD `time_zone` text;--> statement-breakpoint
ALTER TABLE `customer` ADD `last_contact_at` text;--> statement-breakpoint
CREATE INDEX `idx_user_role` ON `user` (`role`);--> statement-breakpoint
CREATE INDEX `idx_user_customer` ON `user` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_user_last_login` ON `user` (`last_login_at`);--> statement-breakpoint
CREATE INDEX `idx_customer_first_booking_source` ON `customer` (`first_booking_source`);--> statement-breakpoint
CREATE INDEX `idx_customer_vip_status` ON `customer` (`vip_status`);--> statement-breakpoint
CREATE INDEX `idx_customer_has_user_account` ON `customer` (`has_user_account`);--> statement-breakpoint
CREATE INDEX `idx_customer_total_bookings` ON `customer` (`total_bookings`);--> statement-breakpoint
CREATE INDEX `idx_customer_total_spent` ON `customer` (`total_spent_cents`);--> statement-breakpoint
CREATE INDEX `idx_customer_email_phone` ON `customer` (`email`,`phone`);--> statement-breakpoint
CREATE INDEX `idx_customer_status_first_booking_source` ON `customer` (`status`,`first_booking_source`);--> statement-breakpoint
ALTER TABLE `customer` DROP COLUMN `source`;