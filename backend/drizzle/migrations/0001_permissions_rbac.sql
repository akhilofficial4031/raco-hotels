CREATE TABLE `role` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `display_name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_role_name` ON `role` (`name`);
--> statement-breakpoint
CREATE INDEX `idx_role_name` ON `role` (`name`);
--> statement-breakpoint
CREATE TABLE `permission` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `key` text NOT NULL,
  `description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_permission_key` ON `permission` (`key`);
--> statement-breakpoint
CREATE INDEX `idx_permission_key` ON `permission` (`key`);
--> statement-breakpoint
CREATE TABLE `role_permission` (
  `role_id` integer NOT NULL,
  `permission_id` integer NOT NULL,
  PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_role_permission` ON `role_permission` (`role_id`,`permission_id`);

