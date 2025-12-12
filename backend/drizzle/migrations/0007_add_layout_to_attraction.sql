-- Add layout field to attraction table
ALTER TABLE `attraction` ADD COLUMN `layout` text DEFAULT 'layout_1' NOT NULL;