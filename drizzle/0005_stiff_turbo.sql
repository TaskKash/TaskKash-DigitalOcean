CREATE TABLE `userConsents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentType` varchar(100) NOT NULL,
	`consentVersion` varchar(50) NOT NULL,
	`eventType` enum('granted','revoked','updated','refreshed') NOT NULL,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userConsents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceModel` varchar(100),
	`deviceOs` varchar(50),
	`deviceOsVersion` varchar(50),
	`deviceTier` enum('A','B','C'),
	`networkCarrier` varchar(100),
	`connectionType` varchar(50),
	`interests` json,
	`brandAffinity` json,
	`lifeStage` enum('single','engaged','married','parent'),
	`nextPurchaseIntent` json,
	`shoppingFrequency` enum('daily','weekly','monthly','rarely'),
	`preferredStores` json,
	`householdSize` int,
	`values` json,
	`industry` varchar(100),
	`jobTitle` varchar(100),
	`workType` enum('remote','office','hybrid'),
	`hasVehicle` int unsigned NOT NULL DEFAULT 0,
	`vehicleBrand` varchar(100),
	`homeOwnership` enum('owner','renter'),
	`urgencyScore` int DEFAULT 0,
	`impulseScore` int DEFAULT 0,
	`influenceScore` int DEFAULT 0,
	`activityPattern` enum('night_owl','commuter','daytime'),
	`profileUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `kycStatus` enum('pending','submitted','verified','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `kycVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `kycProvider` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `kycRejectionReason` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `deviceTierLastUpdated` timestamp;