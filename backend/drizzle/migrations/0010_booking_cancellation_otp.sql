CREATE TABLE `booking_cancellation_otp` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`booking_reference` text NOT NULL,
	`otp_code` text NOT NULL,
	`customer_email` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `idx_booking_cancellation_otp_reference` ON `booking_cancellation_otp` (`booking_reference`);
CREATE INDEX `idx_booking_cancellation_otp_expires` ON `booking_cancellation_otp` (`expires_at`);
