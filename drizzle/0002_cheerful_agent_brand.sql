ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `balance` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `completedTasks` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalEarnings` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `profileStrength` int unsigned DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `countryId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` int unsigned DEFAULT 0 NOT NULL;