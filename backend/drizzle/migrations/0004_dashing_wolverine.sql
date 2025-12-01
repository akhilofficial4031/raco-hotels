/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
CREATE TABLE `homepage_content_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`is_published` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `homepage_content_new` (`id`, `content`, `version`, `is_published`, `created_at`, `updated_at`) SELECT `id`, `content`, `version`, `is_published`, `created_at`, `updated_at` FROM `homepage_content`;
--> statement-breakpoint
DROP TABLE `homepage_content`;
--> statement-breakpoint
ALTER TABLE `homepage_content_new` RENAME TO `homepage_content`;
--> statement-breakpoint
DROP INDEX IF EXISTS `idx_homepage_hotel`;
--> statement-breakpoint
CREATE INDEX `idx_homepage_published` ON `homepage_content` (`is_published`);