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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
-- Table structure for table `task_questions`
--

DROP TABLE IF EXISTS `task_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL,
  `questionText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionTextAr` text COLLATE utf8mb4_unicode_ci,
  `questionOrder` int NOT NULL,
  `questionType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'multiple_choice',
  `optionA` text COLLATE utf8mb4_unicode_ci,
  `optionAAr` text COLLATE utf8mb4_unicode_ci,
  `optionB` text COLLATE utf8mb4_unicode_ci,
  `optionBAr` text COLLATE utf8mb4_unicode_ci,
  `optionC` text COLLATE utf8mb4_unicode_ci,
  `optionCAr` text COLLATE utf8mb4_unicode_ci,
  `optionD` text COLLATE utf8mb4_unicode_ci,
  `optionDAr` text COLLATE utf8mb4_unicode_ci,
  `correctAnswer` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `explanationAr` text COLLATE utf8mb4_unicode_ci,
  `imageUrl` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_task` (`taskId`),
  CONSTRAINT `task_questions_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `submissionData` text COLLATE utf8mb4_unicode_ci,
  `score` int DEFAULT NULL,
  `watchTime` int DEFAULT NULL,
  `correctAnswers` int DEFAULT NULL,
  `totalQuestions` int DEFAULT NULL,
  `uploadedFiles` text COLLATE utf8mb4_unicode_ci,
  `gpsLocation` text COLLATE utf8mb4_unicode_ci,
  `reviewedBy` int DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `reviewNotes` text COLLATE utf8mb4_unicode_ci,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  PRIMARY KEY (`id`),
  KEY `advertiserId` (`advertiserId`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`advertiserId`) REFERENCES `advertisers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `openId` (`openId`),
  KEY `countryId` (`countryId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`countryId`) REFERENCES `countries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=263 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-06 16:25:52
