CREATE TABLE `campaignKpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`kpiName` varchar(100) NOT NULL,
	`targetValue` int unsigned,
	`actualValue` int unsigned NOT NULL DEFAULT 0,
	`lastCalculatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignKpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignPersonas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`videoUrl` varchar(500),
	`adHeadlineAr` varchar(255),
	`adHeadlineEn` varchar(255),
	`adBodyAr` text,
	`adBodyEn` text,
	`targetCriteria` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignPersonas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignQualifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`criteriaType` enum('demographic','behavioral','interest','exclusion') NOT NULL,
	`criteriaKey` varchar(100) NOT NULL,
	`operator` enum('=','!=','>','<','>=','<=','in','not_in') NOT NULL,
	`value` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignQualifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`taskId` int NOT NULL,
	`sequence` int unsigned NOT NULL,
	`gatingRules` json,
	`isRequired` int unsigned NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advertiserId` int NOT NULL,
	`nameAr` varchar(300) NOT NULL,
	`nameEn` varchar(300) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`image` varchar(500),
	`budget` int unsigned NOT NULL,
	`reward` int unsigned NOT NULL,
	`status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
	`videoCompletionThreshold` int unsigned NOT NULL DEFAULT 70,
	`visitDurationThreshold` int unsigned NOT NULL DEFAULT 30,
	`countryId` int NOT NULL,
	`targetAgeMin` int,
	`targetAgeMax` int,
	`targetGender` varchar(10),
	`targetLocations` text,
	`targetIncomeLevel` varchar(50),
	`targetVideoCompletionRate` int unsigned,
	`targetFilterPassRate` int unsigned,
	`targetSurveyCompletionRate` int unsigned,
	`targetVisitAttendanceRate` int unsigned,
	`targetCostPerVisit` int unsigned,
	`totalParticipants` int unsigned NOT NULL DEFAULT 0,
	`completedParticipants` int unsigned NOT NULL DEFAULT 0,
	`disqualifiedParticipants` int unsigned NOT NULL DEFAULT 0,
	`launchDate` timestamp,
	`expiryDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('task','payment','system','promotion','campaign') NOT NULL,
	`titleAr` varchar(300) NOT NULL,
	`titleEn` varchar(300) NOT NULL,
	`messageAr` text NOT NULL,
	`messageEn` text NOT NULL,
	`actionUrl` varchar(500),
	`isRead` int unsigned NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userCampaignProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int NOT NULL,
	`personaId` int,
	`currentTaskId` int,
	`currentSequence` int unsigned NOT NULL DEFAULT 1,
	`status` enum('in_progress','completed','disqualified','abandoned') NOT NULL DEFAULT 'in_progress',
	`disqualificationReason` text,
	`tasksCompleted` int unsigned NOT NULL DEFAULT 0,
	`totalTasks` int unsigned NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userCampaignProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userJourneyLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int NOT NULL,
	`taskId` int,
	`eventType` varchar(100) NOT NULL,
	`eventData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userJourneyLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visitVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int NOT NULL,
	`taskId` int NOT NULL,
	`bookingDate` timestamp,
	`bookingTimeSlot` varchar(50),
	`checkInTime` timestamp,
	`checkOutTime` timestamp,
	`visitDuration` int unsigned,
	`verificationMethod` enum('gps','qr_code','manual'),
	`gpsLatitude` varchar(20),
	`gpsLongitude` varchar(20),
	`qrCodeScanned` varchar(100),
	`status` enum('booked','checked_in','verified','cancelled','no_show') NOT NULL DEFAULT 'booked',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visitVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `type` enum('survey','app','visit','review','social','video','quiz','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `targetTiers` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `requiredTiers` json;--> statement-breakpoint
ALTER TABLE `tasks` ADD `requiresMinimumTier` varchar(10);--> statement-breakpoint
ALTER TABLE `tasks` ADD `targetAgeMin` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `targetAgeMax` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `targetGender` varchar(10);--> statement-breakpoint
ALTER TABLE `tasks` ADD `targetLocations` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `config` json;--> statement-breakpoint
ALTER TABLE `transactions` ADD `campaignId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `age` int;--> statement-breakpoint
ALTER TABLE `users` ADD `gender` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `incomeLevel` varchar(50);