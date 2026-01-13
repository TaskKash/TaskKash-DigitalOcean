-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: taskkash
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `advertisers`
--

DROP TABLE IF EXISTS `advertisers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advertisers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nameEn` text,
  `nameAr` text,
  `slug` varchar(255) DEFAULT NULL,
  `logoUrl` text,
  `websiteUrl` text,
  `descriptionEn` text,
  `descriptionAr` text,
  `isActive` tinyint(1) DEFAULT '1',
  `balance` decimal(10,2) DEFAULT '0.00',
  `totalSpent` decimal(10,2) DEFAULT '0.00',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openId` (`openId`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('tasks','earnings','referrals','streaks','special') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'tasks',
  `requirement` json DEFAULT NULL,
  `rewardAmount` decimal(10,2) DEFAULT '0.00',
  `rarity` enum('common','rare','epic','legendary') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'common',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nameAr` varchar(255) DEFAULT NULL,
  `nameEn` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `currencySymbol` varchar(10) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_logins`
--

DROP TABLE IF EXISTS `daily_logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_logins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `loginDate` date NOT NULL,
  `reward` decimal(10,2) DEFAULT '0.00',
  `streakDay` int DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`userId`,`loginDate`),
  KEY `idx_user_date` (`userId`,`loginDate`),
  CONSTRAINT `daily_logins_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_bounties`
--

DROP TABLE IF EXISTS `data_bounties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_bounties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bountyKey` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleEn` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleAr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descriptionEn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `descriptionAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `questionEn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The question to ask users',
  `questionAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `answerType` enum('text','single_choice','multiple_choice','boolean','number') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `answerOptions` json DEFAULT NULL COMMENT 'For choice-based questions',
  `rewardAmount` decimal(10,2) NOT NULL COMMENT 'Reward for completing bounty',
  `targetResponses` int NOT NULL DEFAULT '1000' COMMENT 'Target number of responses',
  `currentResponses` int NOT NULL DEFAULT '0',
  `startTime` timestamp NOT NULL,
  `endTime` timestamp NOT NULL,
  `status` enum('draft','active','paused','completed','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `advertiserId` int DEFAULT NULL COMMENT 'Advertiser who requested this bounty',
  `createdBy` int NOT NULL COMMENT 'Admin who created bounty',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bountyKey` (`bountyKey`),
  KEY `idx_status_time` (`status`,`startTime`,`endTime`),
  KEY `idx_advertiser` (`advertiserId`),
  CONSTRAINT `data_bounties_ibfk_1` FOREIGN KEY (`advertiserId`) REFERENCES `advertisers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profile_sections`
--

DROP TABLE IF EXISTS `profile_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sectionKey` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique identifier for section (e.g., basic_info, demographics)',
  `nameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Section name in English',
  `nameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Section name in Arabic',
  `descriptionEn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Description in English',
  `descriptionAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Description in Arabic',
  `bonusAmount` decimal(10,2) NOT NULL DEFAULT '5.00' COMMENT 'Cash bonus for completing this section',
  `multiplierBonus` decimal(5,2) NOT NULL DEFAULT '0.05' COMMENT 'Multiplier increase (e.g., 0.05 = +5%)',
  `requiredFields` json NOT NULL COMMENT 'List of required fields to complete section',
  `displayOrder` int NOT NULL DEFAULT '0' COMMENT 'Display order in UI',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sectionKey` (`sectionKey`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `push_subscriptions`
--

DROP TABLE IF EXISTS `push_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `endpoint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `p256dh` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `auth` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_endpoint` (`endpoint`(255)),
  KEY `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `referrals`
--

DROP TABLE IF EXISTS `referrals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referrals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `referrerId` int NOT NULL,
  `refereeId` int NOT NULL,
  `referralCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','rewarded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `referrerReward` decimal(10,2) DEFAULT '0.00',
  `refereeReward` decimal(10,2) DEFAULT '0.00',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_referrer` (`referrerId`),
  KEY `idx_referee` (`refereeId`),
  KEY `idx_code` (`referralCode`),
  CONSTRAINT `referrals_ibfk_1` FOREIGN KEY (`referrerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `referrals_ibfk_2` FOREIGN KEY (`refereeId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `targeting_tiers`
--

DROP TABLE IF EXISTS `targeting_tiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `targeting_tiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tierKey` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique identifier (e.g., verified_car_owner)',
  `nameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descriptionEn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `descriptionAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `iconUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Icon/badge for this tier',
  `requiredData` json NOT NULL COMMENT 'Required data points to unlock (e.g., ["carOwnership", "carBrand"])',
  `verificationMethod` enum('self_reported','document_upload','third_party_api') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'self_reported',
  `minTaskReward` decimal(10,2) DEFAULT '0.00' COMMENT 'Minimum reward for tasks in this tier',
  `displayOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tierKey` (`tierKey`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_questions`
--

DROP TABLE IF EXISTS `task_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL,
  `questionText` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionTextAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `questionOrder` int NOT NULL,
  `questionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'multiple_choice',
  `optionA` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `optionAAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `optionB` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `optionBAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `optionC` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `optionCAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `optionD` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `optionDAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `correctAnswer` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `explanation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `explanationAr` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `imageUrl` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_task` (`taskId`),
  CONSTRAINT `task_questions_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_submissions`
--

DROP TABLE IF EXISTS `task_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL,
  `userId` int NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `submissionData` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `score` int DEFAULT NULL,
  `watchTime` int DEFAULT NULL,
  `correctAnswers` int DEFAULT NULL,
  `totalQuestions` int DEFAULT NULL,
  `uploadedFiles` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `gpsLocation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reviewedBy` int DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `reviewNotes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rejectionReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rewardAmount` decimal(10,2) DEFAULT NULL,
  `rewardCredited` tinyint(1) DEFAULT '0',
  `creditedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_submission` (`taskId`,`userId`,`createdAt`),
  KEY `idx_submissions_task` (`taskId`),
  KEY `idx_submissions_user` (`userId`),
  KEY `idx_submissions_status` (`status`),
  CONSTRAINT `task_submissions_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_submissions_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advertiserId` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `titleEn` text NOT NULL,
  `titleAr` text,
  `descriptionEn` text NOT NULL,
  `descriptionAr` text,
  `reward` decimal(10,2) NOT NULL,
  `totalBudget` decimal(10,2) NOT NULL,
  `completionsNeeded` int NOT NULL,
  `completionsCount` int DEFAULT '0',
  `minimumBudget` decimal(10,2) NOT NULL,
  `difficulty` varchar(20) DEFAULT 'medium',
  `duration` int NOT NULL,
  `status` varchar(20) DEFAULT 'draft',
  `targetAgeMin` int DEFAULT NULL,
  `targetAgeMax` int DEFAULT NULL,
  `targetGender` varchar(10) DEFAULT NULL,
  `targetLocations` text,
  `targetTiers` text,
  `allowMultipleCompletions` tinyint(1) DEFAULT '0',
  `dailyLimitPerUser` int DEFAULT '0',
  `requiresMinimumTier` varchar(10) DEFAULT NULL,
  `verificationMethod` varchar(50) DEFAULT 'automatic',
  `passingScore` int DEFAULT '80',
  `minWatchPercentage` int DEFAULT '80',
  `taskData` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `publishedAt` timestamp NULL DEFAULT NULL,
  `expiresAt` timestamp NULL DEFAULT NULL,
  `requiredTiers` json DEFAULT NULL COMMENT 'Array of tier keys required to access this task',
  `isExclusive` tinyint(1) DEFAULT '0' COMMENT 'Is this an exclusive tier-locked task',
  PRIMARY KEY (`id`),
  KEY `advertiserId` (`advertiserId`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`advertiserId`) REFERENCES `advertisers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balanceBefore` decimal(10,2) NOT NULL,
  `balanceAfter` decimal(10,2) NOT NULL,
  `description` text,
  `relatedTaskId` int DEFAULT NULL,
  `relatedUserTaskId` int DEFAULT NULL,
  `status` varchar(20) DEFAULT 'completed',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `relatedTaskId` (`relatedTaskId`),
  KEY `relatedUserTaskId` (`relatedUserTaskId`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`relatedTaskId`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`relatedUserTaskId`) REFERENCES `userTasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userTasks`
--

DROP TABLE IF EXISTS `userTasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userTasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `taskId` int NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `submittedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  `verifiedAt` timestamp NULL DEFAULT NULL,
  `rejectedAt` timestamp NULL DEFAULT NULL,
  `submissionData` text,
  `verificationNotes` text,
  `reward` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `taskId` (`taskId`),
  CONSTRAINT `userTasks_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userTasks_ibfk_2` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `badgeId` int NOT NULL,
  `earnedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_badge` (`userId`,`badgeId`),
  KEY `badgeId` (`badgeId`),
  KEY `idx_user` (`userId`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badgeId`) REFERENCES `badges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_bounty_responses`
--

DROP TABLE IF EXISTS `user_bounty_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_bounty_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bountyId` int NOT NULL,
  `userId` int NOT NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rewardAwarded` decimal(10,2) NOT NULL,
  `respondedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_bounty` (`userId`,`bountyId`),
  KEY `idx_bounty_responses` (`bountyId`),
  KEY `idx_user_responses` (`userId`),
  CONSTRAINT `user_bounty_responses_ibfk_1` FOREIGN KEY (`bountyId`) REFERENCES `data_bounties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_bounty_responses_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_challenges`
--

DROP TABLE IF EXISTS `user_challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_challenges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `challengeId` int NOT NULL,
  `progress` int DEFAULT '0',
  `completed` tinyint(1) DEFAULT '0',
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_challenge` (`userId`,`challengeId`),
  KEY `challengeId` (`challengeId`),
  CONSTRAINT `user_challenges_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_challenges_ibfk_2` FOREIGN KEY (`challengeId`) REFERENCES `weekly_challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_levels`
--

DROP TABLE IF EXISTS `user_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_levels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `minTasks` int NOT NULL,
  `minEarnings` decimal(10,2) NOT NULL,
  `rewardMultiplier` decimal(3,2) DEFAULT '1.00',
  `benefits` json DEFAULT NULL,
  `badgeIcon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profile_completions`
--

DROP TABLE IF EXISTS `user_profile_completions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile_completions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `sectionKey` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `completedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `bonusAwarded` decimal(10,2) NOT NULL,
  `multiplierAwarded` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_section` (`userId`,`sectionKey`),
  KEY `idx_user_completions` (`userId`),
  CONSTRAINT `user_profile_completions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profile_data`
--

DROP TABLE IF EXISTS `user_profile_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `questionKey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answerValue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_question` (`userId`,`questionKey`),
  CONSTRAINT `user_profile_data_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_tier_unlocks`
--

DROP TABLE IF EXISTS `user_tier_unlocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tier_unlocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `tierKey` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unlockedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verificationStatus` enum('pending','verified','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `verificationData` json DEFAULT NULL COMMENT 'Data submitted for verification',
  `verifiedAt` timestamp NULL DEFAULT NULL,
  `verifiedBy` int DEFAULT NULL COMMENT 'Admin user who verified',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_tier` (`userId`,`tierKey`),
  KEY `idx_user_tiers` (`userId`),
  KEY `idx_verification_status` (`verificationStatus`),
  CONSTRAINT `user_tier_unlocks_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `loginMethod` varchar(64) DEFAULT NULL,
  `role` enum('user','admin','advertiser') NOT NULL DEFAULT 'user',
  `phone` varchar(20) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `completedTasks` int DEFAULT '0',
  `totalEarnings` decimal(10,2) DEFAULT '0.00',
  `tier` varchar(20) DEFAULT 'tier1',
  `profileStrength` int DEFAULT '0',
  `countryId` int DEFAULT NULL,
  `avatar` text,
  `isVerified` tinyint(1) DEFAULT '0',
  `averageRating` decimal(3,2) DEFAULT '0.00',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `referralCode` varchar(20) DEFAULT NULL,
  `referredBy` int DEFAULT NULL,
  `totalReferrals` int DEFAULT '0',
  `referralEarnings` decimal(10,2) DEFAULT '0.00',
  `levelId` int DEFAULT '1',
  `levelProgress` decimal(5,2) DEFAULT '0.00',
  `currentStreak` int DEFAULT '0',
  `longestStreak` int DEFAULT '0',
  `lastLoginDate` date DEFAULT NULL,
  `totalDailyRewards` decimal(10,2) DEFAULT '0.00',
  `profileCompletionBonus` decimal(10,2) DEFAULT '0.00' COMMENT 'Total bonus earned from profile completion',
  `earningsMultiplier` decimal(5,2) DEFAULT '1.00' COMMENT 'Earnings multiplier based on profile completeness (1.00 = 100%)',
  `profileSections` json DEFAULT NULL COMMENT 'Tracks which profile sections are completed',
  PRIMARY KEY (`id`),
  UNIQUE KEY `openId` (`openId`),
  UNIQUE KEY `referralCode` (`referralCode`),
  KEY `countryId` (`countryId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`countryId`) REFERENCES `countries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=843 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `weekly_challenges`
--

DROP TABLE IF EXISTS `weekly_challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weekly_challenges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `requirement` json DEFAULT NULL,
  `reward` decimal(10,2) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `withdrawal_requests`
--

DROP TABLE IF EXISTS `withdrawal_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawal_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountDetails` json NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `transactionId` int DEFAULT NULL,
  `requestedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `processedAt` datetime DEFAULT NULL,
  `processedBy` int DEFAULT NULL,
  `rejectionReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `transactionId` (`transactionId`),
  KEY `idx_user_status` (`userId`,`status`),
  KEY `idx_status` (`status`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `withdrawal_requests_ibfk_2` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-15 21:04:09
