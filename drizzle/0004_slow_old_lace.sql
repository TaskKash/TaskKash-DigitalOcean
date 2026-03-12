ALTER TABLE `tasks` MODIFY COLUMN `status` enum('available','completed','upcoming','active','published') NOT NULL DEFAULT 'available';--> statement-breakpoint
ALTER TABLE `advertisers` ADD `logoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `advertisers` DROP COLUMN `logo`;