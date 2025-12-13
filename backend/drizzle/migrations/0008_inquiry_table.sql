CREATE TABLE `inquiry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`date` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`remarks` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inquiry_status` ON `inquiry` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_inquiry_date` ON `inquiry` (`date`);
--> statement-breakpoint
CREATE INDEX `idx_inquiry_created` ON `inquiry` (`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_inquiry_phone` ON `inquiry` (`phone`);