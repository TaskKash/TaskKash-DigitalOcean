CREATE TABLE `advertisers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`logo` varchar(500),
	`coverImage` varchar(500),
	`category` varchar(100),
	`verified` int unsigned NOT NULL DEFAULT 0,
	`followers` int unsigned NOT NULL DEFAULT 0,
	`totalCampaigns` int unsigned NOT NULL DEFAULT 0,
	`activeUsers` int unsigned NOT NULL DEFAULT 0,
	`paymentRate` int unsigned NOT NULL DEFAULT 100,
	`rating` int unsigned NOT NULL DEFAULT 0,
	`reviewCount` int unsigned NOT NULL DEFAULT 0,
	`countryId` int NOT NULL,
	`isActive` int unsigned NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advertisers_id` PRIMARY KEY(`id`),
	CONSTRAINT `advertisers_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(2) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`currencySymbol` varchar(10) NOT NULL,
	`isActive` int unsigned NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advertiserId` int NOT NULL,
	`titleAr` varchar(300) NOT NULL,
	`titleEn` varchar(300) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`type` enum('survey','app','visit','review','social','other') NOT NULL,
	`reward` int unsigned NOT NULL,
	`duration` int unsigned NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
	`requiredProfileStrength` int unsigned NOT NULL DEFAULT 0,
	`maxCompletions` int unsigned,
	`currentCompletions` int unsigned NOT NULL DEFAULT 0,
	`image` varchar(500),
	`rating` int unsigned NOT NULL DEFAULT 0,
	`status` enum('available','completed','upcoming') NOT NULL DEFAULT 'available',
	`launchDate` timestamp,
	`expiryDate` timestamp,
	`countryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('earning','withdrawal','bonus','refund') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`taskId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int NOT NULL,
	`status` enum('pending','in_progress','completed','rejected') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userTasks_id` PRIMARY KEY(`id`)
);
