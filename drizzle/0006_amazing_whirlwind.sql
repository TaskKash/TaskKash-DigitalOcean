CREATE TABLE `escrow_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advertiserId` int NOT NULL,
	`campaignId` int,
	`taskId` int,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`status` enum('held','released','refunded') NOT NULL DEFAULT 'held',
	`reason` varchar(255),
	`releaseDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escrow_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_kyc_vault` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`idNumber` varchar(100) NOT NULL,
	`dateOfBirth` timestamp,
	`fullAddress` text,
	`livenessToken` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_kyc_vault_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_kyc_vault_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `userConsents` MODIFY COLUMN `eventType` enum('granted','revoked','updated','refreshed','exported') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `tier` enum('vip','prestige','elite') NOT NULL DEFAULT 'vip';--> statement-breakpoint
ALTER TABLE `advertisers` ADD `tier` enum('basic','pro','premium','enterprise') DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE `advertisers` ADD `totalSpend` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `vehicleModel` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `isPhoneVerified` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tierRank` int;--> statement-breakpoint
ALTER TABLE `users` ADD `district` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `pendingDeletion` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `deletionRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `user_kyc_vault` ADD CONSTRAINT `user_kyc_vault_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;