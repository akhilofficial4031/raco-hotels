DROP INDEX IF EXISTS `idx_user_customer`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_customer_has_user_account`;--> statement-breakpoint
/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `customer_id`;--> statement-breakpoint
ALTER TABLE `customer` DROP COLUMN `has_user_account`;