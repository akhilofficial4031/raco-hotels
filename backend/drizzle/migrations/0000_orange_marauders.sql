CREATE TABLE `hotel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text,
	`description` text,
	`email` text,
	`phone` text,
	`address_line1` text,
	`address_line2` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country_code` text,
	`latitude` real,
	`longitude` real,
	`timezone` text,
	`star_rating` integer,
	`check_in_time` text,
	`check_out_time` text,
	`location_info` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hotel_image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`full_name` text,
	`phone` text,
	`role` text DEFAULT 'guest' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`customer_id` integer,
	`last_login_at` text,
	`password_reset_token` text,
	`password_reset_expires_at` text,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`email_verification_token` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
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
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`has_user_account` integer DEFAULT 0 NOT NULL,
	`first_booking_source` text DEFAULT 'web' NOT NULL,
	`total_bookings` integer DEFAULT 0 NOT NULL,
	`total_spent_cents` integer DEFAULT 0 NOT NULL,
	`preferred_payment_method` text,
	`vip_status` text DEFAULT 'regular',
	`preferred_contact_method` text DEFAULT 'email',
	`language_preference` text DEFAULT 'en',
	`time_zone` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_booking_at` text,
	`last_contact_at` text
);
--> statement-breakpoint
CREATE TABLE `amenity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hotel_amenity` (
	`hotel_id` integer NOT NULL,
	`amenity_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`hotel_id`, `amenity_id`),
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`amenity_id`) REFERENCES `amenity`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`base_occupancy` integer DEFAULT 2 NOT NULL,
	`max_occupancy` integer DEFAULT 2 NOT NULL,
	`base_price_cents` integer DEFAULT 0 NOT NULL,
	`currency_code` text DEFAULT 'INR' NOT NULL,
	`size_sqft` integer,
	`bed_type` text,
	`smoking_allowed` integer DEFAULT 0 NOT NULL,
	`total_rooms` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_type_amenity` (
	`room_type_id` integer NOT NULL,
	`amenity_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`room_type_id`, `amenity_id`),
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`amenity_id`) REFERENCES `amenity`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_type_image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_type_id` integer NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
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
CREATE TABLE `tax_fee` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`scope` text NOT NULL,
	`included_in_price` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `booking` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference_code` text NOT NULL,
	`hotel_id` integer NOT NULL,
	`user_id` integer,
	`customer_id` integer,
	`admin_id` integer,
	`status` text DEFAULT 'checkedin' NOT NULL,
	`source` text DEFAULT 'web' NOT NULL,
	`check_in_date` text NOT NULL,
	`check_out_date` text NOT NULL,
	`num_adults` integer DEFAULT 1 NOT NULL,
	`num_children` integer DEFAULT 0 NOT NULL,
	`total_amount_cents` integer DEFAULT 0 NOT NULL,
	`currency_code` text DEFAULT 'INR' NOT NULL,
	`tax_amount_cents` integer DEFAULT 0 NOT NULL,
	`fee_amount_cents` integer DEFAULT 0 NOT NULL,
	`discount_amount_cents` integer DEFAULT 0 NOT NULL,
	`amount_paid_cents` integer DEFAULT 0 NOT NULL,
	`balance_due_cents` integer DEFAULT 0 NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`payment_processor` text,
	`notes` text,
	`cancelled_at` text,
	`cancellation_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`admin_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `review` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer NOT NULL,
	`user_id` integer,
	`booking_id` integer,
	`rating` integer NOT NULL,
	`title` text,
	`body` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`published_at` text,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_user_id` integer,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`action` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `content_block` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer,
	`page` text NOT NULL,
	`section` text NOT NULL,
	`title` text,
	`body` text,
	`media_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `feature` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hotel_feature` (
	`hotel_id` integer NOT NULL,
	`feature_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`hotel_id`, `feature_id`),
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`feature_id`) REFERENCES `feature`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `permission` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`display_name` text
);
--> statement-breakpoint
CREATE TABLE `role_permission` (
	`role_id` integer NOT NULL,
	`permission_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `promo_code` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hotel_id` integer NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`start_date` text,
	`end_date` text,
	`min_nights` integer,
	`min_amount_cents` integer,
	`max_discount_cents` integer,
	`usage_limit` integer,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotel`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `booking_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`room_type_id` integer NOT NULL,
	`room_id` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `booking_promotion` (
	`booking_id` integer NOT NULL,
	`promo_code_id` integer NOT NULL,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`promo_code_id`) REFERENCES `promo_code`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`currency_code` text DEFAULT 'INR' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`method` text DEFAULT 'card' NOT NULL,
	`processor` text DEFAULT 'manual' NOT NULL,
	`processor_payment_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `refund` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payment_id` integer NOT NULL,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`processor_refund_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `addon` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
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
	`price_cents` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_type`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`addon_id`) REFERENCES `addon`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_hotel_name` ON `hotel` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_hotel_slug` ON `hotel` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_hotel_city` ON `hotel` (`city`);--> statement-breakpoint
CREATE INDEX `idx_hotel_country` ON `hotel` (`country_code`);--> statement-breakpoint
CREATE INDEX `idx_hotel_active` ON `hotel` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_hotel_image_hotel` ON `hotel_image` (`hotel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_email` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_user_email` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_user_role` ON `user` (`role`);--> statement-breakpoint
CREATE INDEX `idx_user_customer` ON `user` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_user_last_login` ON `user` (`last_login_at`);--> statement-breakpoint
CREATE INDEX `idx_customer_email` ON `customer` (`email`);--> statement-breakpoint
CREATE INDEX `idx_customer_phone` ON `customer` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_customer_name` ON `customer` (`full_name`);--> statement-breakpoint
CREATE INDEX `idx_customer_status` ON `customer` (`status`);--> statement-breakpoint
CREATE INDEX `idx_customer_first_booking_source` ON `customer` (`first_booking_source`);--> statement-breakpoint
CREATE INDEX `idx_customer_last_booking` ON `customer` (`last_booking_at`);--> statement-breakpoint
CREATE INDEX `idx_customer_vip_status` ON `customer` (`vip_status`);--> statement-breakpoint
CREATE INDEX `idx_customer_has_user_account` ON `customer` (`has_user_account`);--> statement-breakpoint
CREATE INDEX `idx_customer_total_bookings` ON `customer` (`total_bookings`);--> statement-breakpoint
CREATE INDEX `idx_customer_total_spent` ON `customer` (`total_spent_cents`);--> statement-breakpoint
CREATE INDEX `idx_customer_email_phone` ON `customer` (`email`,`phone`);--> statement-breakpoint
CREATE INDEX `idx_customer_status_first_booking_source` ON `customer` (`status`,`first_booking_source`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_amenity_code` ON `amenity` (`code`);--> statement-breakpoint
CREATE INDEX `idx_amenity_name` ON `amenity` (`name`);--> statement-breakpoint
CREATE INDEX `idx_room_type_hotel` ON `room_type` (`hotel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_room_type_slug` ON `room_type` (`hotel_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_room_type_price` ON `room_type` (`base_price_cents`);--> statement-breakpoint
CREATE INDEX `idx_room_type_active` ON `room_type` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_room_image_room` ON `room_type_image` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `idx_room_hotel` ON `room` (`hotel_id`);--> statement-breakpoint
CREATE INDEX `idx_room_type` ON `room` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `idx_room_status` ON `room` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_room_hotel_number` ON `room` (`hotel_id`,`room_number`);--> statement-breakpoint
CREATE INDEX `idx_tax_fee_hotel` ON `tax_fee` (`hotel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_booking_reference_code` ON `booking` (`reference_code`);--> statement-breakpoint
CREATE INDEX `idx_booking_hotel` ON `booking` (`hotel_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_user` ON `booking` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_customer` ON `booking` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_admin` ON `booking` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_status` ON `booking` (`status`);--> statement-breakpoint
CREATE INDEX `idx_booking_dates` ON `booking` (`check_in_date`,`check_out_date`);--> statement-breakpoint
CREATE INDEX `idx_booking_total_amount` ON `booking` (`total_amount_cents`);--> statement-breakpoint
CREATE INDEX `idx_review_hotel` ON `review` (`hotel_id`);--> statement-breakpoint
CREATE INDEX `idx_review_status` ON `review` (`status`);--> statement-breakpoint
CREATE INDEX `idx_review_rating` ON `review` (`rating`);--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_actor` ON `audit_log` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_action` ON `audit_log` (`action`);--> statement-breakpoint
CREATE INDEX `idx_content_page` ON `content_block` (`page`);--> statement-breakpoint
CREATE INDEX `idx_content_section` ON `content_block` (`section`);--> statement-breakpoint
CREATE INDEX `idx_content_hotel` ON `content_block` (`hotel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_feature_code` ON `feature` (`code`);--> statement-breakpoint
CREATE INDEX `idx_feature_name` ON `feature` (`name`);--> statement-breakpoint
CREATE INDEX `idx_feature_visible` ON `feature` (`is_visible`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_permission_key` ON `permission` (`key`);--> statement-breakpoint
CREATE INDEX `idx_permission_key` ON `permission` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_role_name` ON `role` (`name`);--> statement-breakpoint
CREATE INDEX `idx_role_name` ON `role` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_role_permission` ON `role_permission` (`role_id`,`permission_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_promo_code` ON `promo_code` (`hotel_id`,`code`);--> statement-breakpoint
CREATE INDEX `idx_promo_active` ON `promo_code` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_promo_date` ON `promo_code` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `idx_booking_item_booking` ON `booking_item` (`booking_id`);--> statement-breakpoint
CREATE INDEX `idx_booking_item_room` ON `booking_item` (`room_id`);--> statement-breakpoint
CREATE INDEX `idx_payment_booking` ON `payment` (`booking_id`);--> statement-breakpoint
CREATE INDEX `idx_payment_status` ON `payment` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_payment_processor_id` ON `payment` (`processor`,`processor_payment_id`);--> statement-breakpoint
CREATE INDEX `idx_refund_payment` ON `refund` (`payment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_refund_processor_id` ON `refund` (`processor_refund_id`);--> statement-breakpoint
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
CREATE INDEX `idx_booking_addon_addon` ON `booking_addon` (`addon_id`);