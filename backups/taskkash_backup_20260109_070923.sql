-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: taskkash
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.22.04.2

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
-- Table structure for table `advertiser_subscriptions`
--

DROP TABLE IF EXISTS `advertiser_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advertiser_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advertiserId` int NOT NULL,
  `tier` enum('basic','pro','enterprise') NOT NULL,
  `startDate` timestamp NOT NULL,
  `endDate` timestamp NULL DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','cancelled','expired') DEFAULT 'active',
  `paymentMethod` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `advertiserId` (`advertiserId`),
  CONSTRAINT `advertiser_subscriptions_ibfk_1` FOREIGN KEY (`advertiserId`) REFERENCES `advertisers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advertiser_subscriptions`
--

LOCK TABLES `advertiser_subscriptions` WRITE;
/*!40000 ALTER TABLE `advertiser_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `advertiser_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

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
  `tier` enum('basic','standard','premium','enterprise') DEFAULT 'basic',
  PRIMARY KEY (`id`),
  UNIQUE KEY `openId` (`openId`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advertisers`
--

LOCK TABLES `advertisers` WRITE;
/*!40000 ALTER TABLE `advertisers` DISABLE KEYS */;
INSERT INTO `advertisers` VALUES (1,'adv_samsung_001','contact@samsung-egypt.com','$2b$10$8UWSzz6.LTPkkAeOo.QcoOo4ZN6ycTt.nxA8n.9QrSn.kNBCbpFj2','Samsung Egypt','سامسونج مصر','samsung-egypt','/covers/samsung.png','https://www.samsung.com/eg/','Leading electronics manufacturer','الشركة الرائدة في تصنيع الإلكترونيات',1,50000.00,0.00,'2025-12-11 20:33:12','2025-12-18 00:39:22','enterprise'),(2,'adv_vodafone_001','info@vodafone.com.eg','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Vodafone Egypt','فودافون مصر','vodafone-egypt','/covers/vodafone.jpg','https://www.vodafone.com.eg/','Leading telecom provider','مزود الاتصالات الرائد',1,40000.00,0.00,'2025-12-11 20:33:12','2026-01-09 03:11:33','premium'),(3,'adv_cocacola_001','contact@coca-cola-egypt.com','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Coca-Cola Egypt','كوكاكولا مصر','cocacola-egypt','/covers/cocacola.jpg','https://www.coca-cola.com/','World-famous beverage company','شركة المشروبات العالمية الشهيرة',1,30000.00,0.00,'2025-12-11 20:33:12','2026-01-09 03:11:33','premium'),(12,'adv_orange_001','info@orange.eg','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Orange Egypt','أورانج مصر','orange-egypt','/logos/orange.png','https://www.orange.eg/','Leading mobile network operator','مشغل الشبكة المحمولة الرائد',1,35000.00,0.00,'2025-11-11 21:32:29','2026-01-09 04:24:52','standard'),(13,'adv_mansour_001','contact@mansourgroup.com','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Mansour Group','مجموعة منصور','mansour-group','/logos/mansour.jpg','https://www.mansourgroup.com/','Leading automotive and consumer goods distributor','الموزع الرائد للسيارات والسلع الاستهلاكية',1,44887.20,112.80,'2025-11-11 21:32:29','2026-01-09 06:37:59','standard'),(18,'adv_talabat_001','contact@talabat.com','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Talabat Egypt','طلبات مصر','talabat-egypt','/logos/talabat.png','https://www.talabat.com/egypt','Leading food delivery platform in Egypt','منصة توصيل الطعام الرائدة في مصر',1,60000.00,0.00,'2026-01-09 03:11:33','2026-01-09 04:24:52','premium'),(19,'adv_cib_001','contact@cibeg.com','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','CIB Bank','البنك التجاري الدولي','cib-bank','/logos/cib.png','https://www.cibeg.com','Largest private bank in Egypt','أكبر بنك خاص في مصر',1,80000.00,0.00,'2026-01-09 03:11:33','2026-01-09 04:24:52','enterprise'),(20,'adv_etisalat_001','contact@etisalat.eg','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Etisalat Egypt','اتصالات مصر','etisalat-egypt','/logos/etisalat.png','https://www.etisalat.eg','Leading telecom operator in Egypt','مشغل اتصالات رائد في مصر',1,55000.00,0.00,'2026-01-09 03:11:33','2026-01-09 04:24:52','premium'),(21,'adv_we_001','contact@te.eg','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','WE Egypt','وي مصر','we-egypt','/logos/we.png','https://www.te.eg','National telecom operator','مشغل الاتصالات الوطني',1,45000.00,0.00,'2026-01-09 03:11:33','2026-01-09 04:24:52','standard'),(22,'adv_juhayna_001','contact@juhayna.com','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Juhayna','جهينة','juhayna','/logos/juhayna.png','https://www.juhayna.com','Leading dairy and juice company','شركة الألبان والعصائر الرائدة',1,34982.00,18.00,'2026-01-09 03:11:33','2026-01-09 05:22:35','standard'),(23,'adv_pepsi_001','contact@pepsico.com','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','PepsiCo Egypt','بيبسيكو مصر','pepsico-egypt','/logos/pepsi.png','https://www.pepsico.com','Global food and beverage company','شركة الأغذية والمشروبات العالمية',1,50000.00,0.00,'2026-01-09 03:11:33','2026-01-09 04:24:52','premium'),(24,'adv_carrefour_001','contact@carrefouregypt.com','$2b$10$BL7vTo7ml5yx/6Ca9F.kgeIAB0Lxn.gg/A56.1pI9kbB8aJZ9MMsG','Carrefour Egypt','كارفور مصر','carrefour-egypt','/logos/carrefour.png','https://www.carrefouregypt.com','Leading hypermarket chain','سلسلة الهايبر ماركت الرائدة',1,40000.00,0.00,'2026-01-09 03:11:33','2026-01-09 04:24:52','standard');
/*!40000 ALTER TABLE `advertisers` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `badges`
--

LOCK TABLES `badges` WRITE;
/*!40000 ALTER TABLE `badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_analytics`
--

DROP TABLE IF EXISTS `campaign_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL,
  `date` date NOT NULL,
  `impressions` int DEFAULT '0',
  `clicks` int DEFAULT '0',
  `completions` int DEFAULT '0',
  `uniqueUsers` int DEFAULT '0',
  `totalSpent` decimal(10,2) DEFAULT '0.00',
  `avgCompletionTime` int DEFAULT '0',
  `demographicsData` json DEFAULT NULL,
  `deviceData` json DEFAULT NULL,
  `locationData` json DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_task_date` (`taskId`,`date`),
  CONSTRAINT `campaign_analytics_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_analytics`
--

LOCK TABLES `campaign_analytics` WRITE;
/*!40000 ALTER TABLE `campaign_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `campaign_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_targeting`
--

DROP TABLE IF EXISTS `campaign_targeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_targeting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL,
  `targetAgeMin` int DEFAULT NULL,
  `targetAgeMax` int DEFAULT NULL,
  `targetGender` enum('male','female','all') DEFAULT 'all',
  `targetNationalities` json DEFAULT NULL,
  `targetIncomeMin` decimal(10,2) DEFAULT NULL,
  `targetIncomeMax` decimal(10,2) DEFAULT NULL,
  `targetCountries` json DEFAULT NULL,
  `targetCities` json DEFAULT NULL,
  `targetRadius` int DEFAULT NULL,
  `targetDeviceBrands` json DEFAULT NULL,
  `targetDeviceModels` json DEFAULT NULL,
  `targetOS` json DEFAULT NULL,
  `targetCarriers` json DEFAULT NULL,
  `targetShoppingFrequency` json DEFAULT NULL,
  `targetInterests` json DEFAULT NULL,
  `targetHobbies` json DEFAULT NULL,
  `targetFavoriteBrands` json DEFAULT NULL,
  `requirePhoneVerified` tinyint(1) DEFAULT '0',
  `requireEmailVerified` tinyint(1) DEFAULT '0',
  `requireKYCVerified` tinyint(1) DEFAULT '0',
  `requireSocialConnected` tinyint(1) DEFAULT '0',
  `minKYCLevel` int DEFAULT '0',
  `targetPurchaseIntent` json DEFAULT NULL,
  `targetLifeEvents` json DEFAULT NULL,
  `targetUserTiers` json DEFAULT NULL,
  `minProfileStrength` int DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `taskId` (`taskId`),
  CONSTRAINT `campaign_targeting_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_targeting`
--

LOCK TABLES `campaign_targeting` WRITE;
/*!40000 ALTER TABLE `campaign_targeting` DISABLE KEYS */;
/*!40000 ALTER TABLE `campaign_targeting` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'مصر','Egypt','EG','EGP','ج.م',1,'2025-12-11 20:33:12'),(2,'السعودية','Saudi Arabia','SA','SAR','ر.س',1,'2025-12-11 20:33:12'),(3,'الإمارات','United Arab Emirates','AE','AED','د.إ',1,'2025-12-11 20:33:12');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `daily_logins`
--

LOCK TABLES `daily_logins` WRITE;
/*!40000 ALTER TABLE `daily_logins` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_logins` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `data_bounties`
--

LOCK TABLES `data_bounties` WRITE;
/*!40000 ALTER TABLE `data_bounties` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_bounties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` enum('task','payment','system','promotion') NOT NULL,
  `titleAr` varchar(300) NOT NULL,
  `titleEn` varchar(300) NOT NULL,
  `messageAr` text NOT NULL,
  `messageEn` text NOT NULL,
  `actionUrl` varchar(500) DEFAULT NULL,
  `isRead` tinyint unsigned NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'task','مهمة جديدة متاحة!','New Task Available!','مهمة \"استبيان Samsung\" متاحة الآن - اربح 30 ج.م','Samsung Customer Survey is now available - Earn 30 EGP','/tasks/1',0,'2026-01-08 23:57:11'),(2,1,'payment','تم قبول طلب السحب','Withdrawal Approved','تم تحويل 500 ج.م إلى حسابك في Vodafone Cash','500 EGP has been transferred to your Vodafone Cash account','/wallet',0,'2026-01-07 23:57:11'),(3,1,'promotion','مكافأة الإحالة!','Referral Bonus!','حصلت على 100 ج.م لإحالة صديق جديد','You earned 100 EGP for referring a new friend','/referrals',1,'2026-01-06 23:57:11'),(4,1,'system','تحديث النظام','System Update','تم تحديث التطبيق إلى الإصدار الجديد','App has been updated to the new version',NULL,1,'2026-01-05 23:57:11');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_codes`
--

DROP TABLE IF EXISTS `otp_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `attempts` int DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_codes`
--

LOCK TABLES `otp_codes` WRITE;
/*!40000 ALTER TABLE `otp_codes` DISABLE KEYS */;
INSERT INTO `otp_codes` VALUES (1,'+201001234567','821086','2025-12-17 23:09:41',1,1,'2025-12-17 22:59:41'),(2,'+201001581287','867377','2025-12-17 23:22:34',1,1,'2025-12-17 23:12:33'),(3,'+201001681287','870256','2025-12-18 01:00:26',1,1,'2025-12-18 00:50:25');
/*!40000 ALTER TABLE `otp_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_commissions`
--

DROP TABLE IF EXISTS `platform_commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commissionType` enum('advertiser','user_withdrawal') NOT NULL,
  `tierName` varchar(50) NOT NULL,
  `commissionRate` decimal(5,2) NOT NULL,
  `description` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_commission` (`commissionType`,`tierName`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_commissions`
--

LOCK TABLES `platform_commissions` WRITE;
/*!40000 ALTER TABLE `platform_commissions` DISABLE KEYS */;
INSERT INTO `platform_commissions` VALUES (1,'advertiser','basic',25.00,'Basic tier advertisers - 25% commission',1,'2026-01-09 03:02:12','2026-01-09 03:02:12'),(2,'advertiser','standard',20.00,'Standard tier advertisers - 20% commission',1,'2026-01-09 03:02:12','2026-01-09 03:02:12'),(3,'advertiser','premium',15.00,'Premium tier advertisers - 15% commission',1,'2026-01-09 03:02:12','2026-01-09 03:02:12'),(4,'advertiser','enterprise',10.00,'Enterprise tier advertisers - 10% commission',1,'2026-01-09 03:02:12','2026-01-09 03:02:12'),(5,'user_withdrawal','tier1',20.00,'Tier 1 users - 20% withdrawal commission',1,'2026-01-09 03:02:12','2026-01-09 03:02:12'),(6,'user_withdrawal','tier2',10.00,'Tier 2 users - 10% withdrawal commission',1,'2026-01-09 03:02:12','2026-01-09 03:02:12'),(7,'user_withdrawal','tier3',5.00,'Tier 3 users - 5% withdrawal commission',1,'2026-01-09 03:02:12','2026-01-09 03:02:12');
/*!40000 ALTER TABLE `platform_commissions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `profile_sections`
--

LOCK TABLES `profile_sections` WRITE;
/*!40000 ALTER TABLE `profile_sections` DISABLE KEYS */;
/*!40000 ALTER TABLE `profile_sections` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `push_subscriptions`
--

LOCK TABLES `push_subscriptions` WRITE;
/*!40000 ALTER TABLE `push_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `push_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `referrals`
--

LOCK TABLES `referrals` WRITE;
/*!40000 ALTER TABLE `referrals` DISABLE KEYS */;
/*!40000 ALTER TABLE `referrals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_audiences`
--

DROP TABLE IF EXISTS `saved_audiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_audiences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advertiserId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `targetingCriteria` json NOT NULL,
  `estimatedReach` int DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `advertiserId` (`advertiserId`),
  CONSTRAINT `saved_audiences_ibfk_1` FOREIGN KEY (`advertiserId`) REFERENCES `advertisers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_audiences`
--

LOCK TABLES `saved_audiences` WRITE;
/*!40000 ALTER TABLE `saved_audiences` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_audiences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_questions`
--

DROP TABLE IF EXISTS `survey_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL,
  `questionText` text NOT NULL,
  `questionTextAr` text,
  `questionOrder` int NOT NULL,
  `questionType` varchar(50) DEFAULT 'single_choice',
  `options` json DEFAULT NULL,
  `optionsAr` json DEFAULT NULL,
  `maxSelections` int DEFAULT '1',
  `isRequired` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `taskId` (`taskId`),
  CONSTRAINT `survey_questions_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_questions`
--

LOCK TABLES `survey_questions` WRITE;
/*!40000 ALTER TABLE `survey_questions` DISABLE KEYS */;
INSERT INTO `survey_questions` VALUES (1,60,'What smartphone brand do you own? If you have 2 or more devices, please select the most recently purchased brand.','ما علامة الهاتف الذكي التجارية التي تمتلكها؟ إذا كان لديك (2) جهازان أو أكثر، يرجى تحديد آخر علامة تجارية اشتريتها حديثًا.',1,'single_choice','[\"Xiaomi\", \"Motorola\", \"Samsung\", \"Google\", \"Huawei\", \"Apple\", \"Other\", \"None\"]','[\"Xiaomi\", \"Motorola\", \"Samsung\", \"Google\", \"Huawei\", \"Apple\", \"أخرى\", \"لا شيء\"]',1,1,'2025-12-17 13:53:18'),(2,60,'On a scale of 1-10, please indicate how attached you are to your smartphone brand, where 1 means not attached at all and 10 means extremely attached.','على مقياس من عشر درجات يرجى تحديد مدى تعلقك بهاتفك الذكي حيث تشير الدرجة 1 إلى مستوى التعلق الأقل على الإطلاق، والدرجة 10 إلى أعلى شدة تعلق بالهاتف.',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\"]','[\"1\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\"]',1,1,'2025-12-17 13:53:18'),(3,60,'What TV brand do you own? If you have 2 or more devices, please select the most recently purchased brand.','ما العلامة التجارية لجهاز التلفاز الذي تمتلكه؟ إذا كان لديك (2) جهازان أو أكثر، يرجى تحديد آخر علامة تجارية اشتريتها حديثًا.',3,'single_choice','[\"Samsung\", \"Hisense\", \"Toshiba\", \"Panasonic\", \"LG\", \"TCL\", \"Sony\", \"Philips\", \"Other\", \"None\"]','[\"Samsung\", \"Hisense\", \"Toshiba\", \"Panasonic\", \"LG\", \"TCL\", \"Sony\", \"Philips\", \"أخرى\", \"لا شيء\"]',1,1,'2025-12-17 13:53:18'),(4,60,'On a scale of 1-10, please indicate how attached you are to your TV brand, where 1 means not attached at all and 10 means extremely attached.','على مقياس من عشر درجات يرجى تحديد مدى تعلقك بجهاز التلفاز الذي لديك حيث تشير الدرجة 1 إلى مستوى التعلق الأقل على الإطلاق، والدرجة 10 إلى أعلى شدة تعلق بالتلفاز.',4,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\"]','[\"1\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\"]',1,1,'2025-12-17 13:53:18'),(5,60,'Are any of the following events planned in the next 6 months? Please select the closest event.','هل تم التخطيط لأي من الأحداث التالية خلال الأشهر الستة القادمة؟ يرجى تحديد الحدث الأقرب.',5,'single_choice','[\"Children\'s wedding\", \"Birth\", \"Starting school/Graduation\", \"Marriage\", \"Children starting school/graduation\", \"Employment/Starting a business\", \"Promotion\", \"Retirement\", \"Buying/Moving/Renovating home\", \"None\"]','[\"زواج أبناء\", \"الولادة\", \"بدء المدرسة/التخرج\", \"الزواج\", \"بدء المدرسة/تخرج أبناء\", \"التوظيف (بدء مشروع تجاري)\", \"الترقية\", \"التقاعد\", \"شراء منزل / الانتقال/ تجديد المنزل\", \"لا يوجد\"]',1,1,'2025-12-17 13:53:18'),(6,60,'Which marketing campaign would most likely influence you to consider purchasing Samsung products?','أي من الحملات التسويقية التالية من المحتمل أن تؤثر عليك للتفكير في شراء منتجات Samsung Electronics؟',6,'single_choice','[\"Holiday/celebration campaigns (Eid Al-Fitr, Eid Al-Adha)\", \"Special promotional campaigns for home appliances/IT products\", \"Special promotional campaigns for product categories of interest (gaming, health, music)\", \"Back to school/academic preparation campaign\", \"New product launch campaigns (Galaxy Unpacked)\", \"Family anniversary campaigns (birthdays, Mother\'s Day, Father\'s Day)\"]','[\"حملات العطلات/الاحتفالات (عيد الفطر، عيد الأضحى)\", \"حملات ترويجية خاصة للأجهزة المنزلية/منتجات تكنولوجيا المعلومات\", \"حملات ترويجية خاصة لفئات المنتجات ذات الاهتمام (الألعاب، الصحة، الموسيقى)\", \"حملة العودة إلى المدرسة/التحضير الأكاديمي\", \"حملات إطلاق المنتجات الجديدة (Galaxy Unpacked)\", \"حملات الذكرى السنوية للعائلة (أعياد الميلاد، عيد الأم، عيد الأب)\"]',1,1,'2025-12-17 13:53:18'),(7,60,'What Samsung product would you most like to purchase? Please select only one product.','ما هو منتج Samsung الذي ترغب بشدة في شرائه؟ يرجى اختيار المنتج الوحيد الذي تفكر في شرائه أكثر من غيره.',7,'single_choice','[\"Air conditioner\", \"Dishwasher\", \"Wireless earbuds\", \"Dryer\", \"Oven/Microwave\", \"Washing machine\", \"Laptop\", \"Smartwatch\", \"Television\", \"Air purifier\", \"Refrigerator\", \"Tablet\", \"Headphones\", \"Clothes sanitizer\", \"Monitor\", \"Vacuum cleaner\", \"Smartphone\"]','[\"مكيف هواء\", \"غسالة الأواني\", \"سماعات الأذن اللاسلكية\", \"مجفف\", \"فرن/ميكروويف\", \"غسالة\", \"كمبيوتر محمول\", \"ساعة ذكية\", \"تلفزيون\", \"جهاز تنقية الهواء\", \"ثلاجة\", \"جهاز لوحي\", \"سماعات\", \"معقم الملابس\", \"شاشة\", \"مكنسة كهربائية\", \"الهاتف الذكي\"]',1,1,'2025-12-17 13:53:18'),(8,60,'What is your estimated budget for the product you selected?','ما هي ميزانيتك المقدرة للمنتج الذي قمت بتحديده؟',8,'single_choice','[\"Less than 5,000 EGP\", \"5,000 to 10,000 EGP\", \"10,000 to 20,000 EGP\", \"20,000 to 30,000 EGP\", \"More than 30,000 EGP\"]','[\"أقل من 5,000 جنيه\", \"من 5,000 إلى 10,000 جنيه\", \"من 10,000 إلى 20,000 جنيه\", \"من 20,000 إلى 30,000 جنيه\", \"أكثر من 30,000 جنيه\"]',1,1,'2025-12-17 13:53:18'),(9,60,'Which channel do you prefer to purchase the product?','في أي قناة تفضل شراء المنتج؟',9,'single_choice','[\"Online (Website/App)\", \"Physical store\"]','[\"عبر الإنترنت (الموقع الإلكتروني/التطبيق)\", \"متجر فعلي\"]',1,1,'2025-12-17 13:53:18'),(10,60,'Please select the main online channel you are considering purchasing from.','يرجى تحديد القناة الرئيسية الوحيدة التي تفكر في شراء المنتج منها.',10,'single_choice','[\"Consumer electronics store website/app\", \"Online marketplace (Amazon, Noon)\", \"Department store website/app\", \"Mobile operator website/app\", \"Hypermarket website/app\", \"Other online shopping site\", \"Samsung brand website/app (Samsung.com)\"]','[\"موقع/تطبيق متجر الإلكترونيات الاستهلاكية\", \"السوق عبر الإنترنت (أمازون، نون)\", \"موقع/تطبيق المتجر متعدد الأقسام\", \"موقع/تطبيق مشغل الهاتف المحمول\", \"موقع/تطبيق الهايبر ماركت\", \"موقع آخر للتسوق عبر الإنترنت\", \"موقع/تطبيق Samsung (Samsung.com)\"]',1,1,'2025-12-17 13:53:18'),(11,60,'What are the reasons that drive you to purchase from this channel? Please select up to three main reasons.','ما هي الأسباب التي تدفعك لشراء المنتج من هذه القناة؟ يرجى اختيار ما يصل إلى ثلاثة أسباب رئيسية.',11,'multi_choice','[\"Reasonable prices\", \"Different/convenient payment methods\", \"Fast/convenient delivery\", \"Easy returns/exchanges\", \"Friendly and professional staff\", \"Reliable products\", \"Can try products directly\", \"Compare with other brand products\", \"Wide range of products\", \"Easy to access location\", \"Exclusive to that store\", \"Different promotional offers\"]','[\"أسعار معقولة\", \"طرق دفع مختلفة/مريحة\", \"توصيل سريع/مريح\", \"سهولة الترجيع/الاستبدال\", \"فريق عمل ودود ومحترف\", \"منتجات موثوقة\", \"يمكن تجربة المنتجات مباشرة\", \"مقارنة بمنتجات العلامات التجارية الأخرى\", \"مجموعة واسعة من المنتجات\", \"موقع يسهل الوصول إليه\", \"حصريًا لذلك المتجر\", \"عروض ترويجية مختلفة\"]',3,1,'2025-12-17 13:53:18'),(12,60,'What are the reasons that drive you to buy Samsung products? Please select up to three main reasons.','ما الأسباب التي تدعوك لشراء منتجات Samsung؟ يرجى تحديد ما يصل إلى ثلاثة أسباب رئيسية.',12,'multi_choice','[\"Product specifications and performance\", \"Design and finish\", \"Sales staff recommendations\", \"Product reviews\", \"Customer service (after-sales support)\", \"Brand preference\", \"Durability\", \"Operating system/User interface\", \"Energy efficiency\", \"Price/Promotions\", \"Eco-friendly and sustainable products\", \"Connectivity with other products\", \"Recommendations from friends/family\", \"Smart features and AI\"]','[\"مواصفات المنتج وأداؤه\", \"التصميم والملمس النهائي\", \"توصيات موظفي المبيعات\", \"مراجعات المنتج\", \"خدمة العملاء (خدمات الدعم بعد البيع)\", \"أفضلية العلامة التجارية\", \"المتانة\", \"نظام التشغيل/ واجهة المستخدم\", \"كفاءة استهلاك الطاقة\", \"السعر/ العروض الترويجية\", \"منتجات صديقة للبيئة ومستدامة\", \"القدرة على الاتصال بالمنتجات الأخرى\", \"توصيات أحد الأصدقاء/ أفراد العائلة\", \"المميزات الذكية والذكاء الاصطناعي\"]',3,1,'2025-12-17 13:53:18'),(13,60,'What promotional offers do you usually prefer when buying electronics? Please select up to three.','ما هي العروض الترويجية التي تفضلها عادة عند شراء المنتجات الإلكترونية؟ يرجى اختيار ما يصل إلى ثلاث عروض.',13,'multi_choice','[\"Free or discounted repair cost insurance (Samsung CarePlus)\", \"Trade in your old device/product\", \"Price discounts/subsidies/cashback\", \"Reward points/discount\", \"Free or discounted accessories\", \"Extended warranty\", \"Bundle upgrades\", \"Discounts for streaming services (YouTube, Netflix, Anghami)\"]','[\"تعويض/تأمين تكاليف الإصلاح مجانًا أو مخفضة (Samsung CarePlus)\", \"استبدل جهازك/منتجك القديم\", \"خصومات الأسعار / الإعانات / الاسترداد النقدي\", \"نقاط المكافأة/خصم\", \"ملحقات مجانية أو مخفضة\", \"ضمان ممتد\", \"ترقيات الحزمة\", \"خصومات للوصول إلى خدمات البث المباشر (YouTube، Netflix، Anghami)\"]',3,1,'2025-12-17 13:53:18'),(14,60,'Please select the family type that suits you.','يرجى تحديد نوع الأسرة المناسب لك.',14,'single_choice','[\"Single-person household\", \"Two-person household\", \"Family with infant/toddler\", \"Family with school-age children\", \"Family with adult children\", \"Family with elderly parents or guardians\"]','[\"أسرة مكونة من شخص واحد\", \"أسرة مكونة من شخصين\", \"أسرة تضم رضيع/طفل صغير\", \"أسرة تضم أطفال في سن المدرسة\", \"أسرة تضم أطفال بالغين\", \"أسرة تضم الوالدين أو الأوصياء المسنين\"]',1,1,'2025-12-17 13:53:18'),(15,60,'What is the average annual income of your household?','ما متوسط الدخل السنوي لأفراد أسرتك؟',15,'single_choice','[\"Less than 50,000 EGP\", \"50,000 to 100,000 EGP\", \"100,000 to 200,000 EGP\", \"200,000 to 400,000 EGP\", \"400,000 to 600,000 EGP\", \"More than 600,000 EGP\", \"Prefer not to answer\"]','[\"أقل من 50,000 جنيه\", \"من 50,000 إلى 100,000 جنيه\", \"من 100,000 إلى 200,000 جنيه\", \"من 200,000 إلى 400,000 جنيه\", \"من 400,000 إلى 600,000 جنيه\", \"أكثر من 600,000 جنيه\", \"أُفضِّل عدم الإجابة\"]',1,1,'2025-12-17 13:53:18'),(16,60,'Please select all channels you use to get information related to IT products.','يُرجى تحديد جميع القنوات التي تستخدمها للحصول على المعلومات المتعلقة بتكنولوجيا المعلومات.',16,'multi_choice','[\"TV programs\", \"Family members (siblings, parents)\", \"Search engines (Google, Bing)\", \"Magazines/Newspapers\", \"Social media (YouTube, Instagram, TikTok)\", \"IT-related online communities (forums, blogs)\", \"Friends and acquaintances\", \"IT company websites\"]','[\"البرامج التلفزيونية\", \"أفراد الأسرة (الأشقاء والآباء)\", \"البحث في مواقع المداخل (Google، Bing)\", \"المجلات / الصحف\", \"وسائل التواصل الاجتماعي (YouTube، Instagram، TikTok)\", \"مجتمعات الإنترنت المتعلقة بتكنولوجيا المعلومات\", \"الأصدقاء والمعارف\", \"مواقع الشركات المتعلقة بتكنولوجيا المعلومات\"]',8,1,'2025-12-17 13:53:18'),(17,64,'How satisfied are you with Samsung products?','ما مدى رضاك عن منتجات سامسونج؟',1,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(18,64,'Which Samsung product do you own?','ما منتج سامسونج الذي تمتلكه؟',2,'single_choice','[\"Smartphone\", \"TV\", \"Tablet\", \"Appliances\", \"Multiple\"]','[\"هاتف ذكي\", \"تلفزيون\", \"تابلت\", \"أجهزة منزلية\", \"متعدد\"]',1,1,'2026-01-09 04:54:14'),(19,64,'Would you recommend Samsung to others?','هل توصي الآخرين بسامسونج؟',3,'single_choice','[\"Definitely Yes\", \"Probably Yes\", \"Not Sure\", \"Probably No\", \"Definitely No\"]','[\"بالتأكيد نعم\", \"ربما نعم\", \"غير متأكد\", \"ربما لا\", \"بالتأكيد لا\"]',1,1,'2026-01-09 04:54:14'),(20,64,'What features do you value most?','ما الميزات التي تقدرها أكثر؟',4,'single_choice','[\"Camera\", \"Performance\", \"Design\", \"Battery\", \"Price\"]','[\"الكاميرا\", \"الأداء\", \"التصميم\", \"البطارية\", \"السعر\"]',1,1,'2026-01-09 04:54:14'),(21,65,'Have you used Galaxy AI features?','هل استخدمت ميزات Galaxy AI؟',1,'single_choice','[\"Yes, frequently\", \"Yes, sometimes\", \"Tried once\", \"No, never\"]','[\"نعم، كثيراً\", \"نعم، أحياناً\", \"جربت مرة\", \"لا، أبداً\"]',1,1,'2026-01-09 04:54:14'),(22,65,'Which Galaxy AI feature is most useful?','ما ميزة Galaxy AI الأكثر فائدة؟',2,'single_choice','[\"Circle to Search\", \"Live Translate\", \"Photo Assist\", \"Note Assist\", \"None\"]','[\"دائرة للبحث\", \"ترجمة مباشرة\", \"مساعد الصور\", \"مساعد الملاحظات\", \"لا شيء\"]',1,1,'2026-01-09 04:54:14'),(23,65,'Rate Galaxy AI overall','قيم Galaxy AI بشكل عام',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(24,65,'Would you upgrade for better AI?','هل ستقوم بالترقية للحصول على AI أفضل؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(25,66,'Have you visited a Samsung Service Center?','هل زرت مركز خدمة سامسونج؟',1,'single_choice','[\"Yes, recently\", \"Yes, long ago\", \"No, never\"]','[\"نعم، مؤخراً\", \"نعم، منذ فترة\", \"لا، أبداً\"]',1,1,'2026-01-09 04:54:14'),(26,66,'Rate the service quality','قيم جودة الخدمة',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(27,66,'Was your issue resolved?','هل تم حل مشكلتك؟',3,'single_choice','[\"Yes, completely\", \"Partially\", \"No\"]','[\"نعم، تماماً\", \"جزئياً\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(28,66,'How was the waiting time?','كيف كان وقت الانتظار؟',4,'single_choice','[\"Very short\", \"Acceptable\", \"Long\", \"Very long\"]','[\"قصير جداً\", \"مقبول\", \"طويل\", \"طويل جداً\"]',1,1,'2026-01-09 04:54:14'),(29,78,'Rate Vodafone network quality','قيم جودة شبكة فودافون',1,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(30,78,'Which Vodafone service do you use?','ما خدمة فودافون التي تستخدمها؟',2,'single_choice','[\"Prepaid\", \"Postpaid\", \"RED\", \"Vodafone Cash\", \"Home Internet\"]','[\"مسبق الدفع\", \"آجل الدفع\", \"RED\", \"فودافون كاش\", \"إنترنت منزلي\"]',1,1,'2026-01-09 04:54:14'),(31,78,'How is the coverage in your area?','كيف التغطية في منطقتك؟',3,'single_choice','[\"Excellent\", \"Good\", \"Average\", \"Poor\"]','[\"ممتازة\", \"جيدة\", \"متوسطة\", \"ضعيفة\"]',1,1,'2026-01-09 04:54:14'),(32,78,'Would you recommend Vodafone?','هل توصي بفودافون؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(33,79,'Do you use Vodafone Business?','هل تستخدم فودافون للأعمال؟',1,'single_choice','[\"Yes\", \"No\", \"Considering\"]','[\"نعم\", \"لا\", \"أفكر في ذلك\"]',1,1,'2026-01-09 04:54:14'),(34,79,'Which business service interests you?','ما خدمة الأعمال التي تهمك؟',2,'single_choice','[\"Mobile Plans\", \"Fixed Line\", \"Cloud Services\", \"IoT\", \"All\"]','[\"باقات موبايل\", \"خط ثابت\", \"خدمات سحابية\", \"إنترنت الأشياء\", \"الكل\"]',1,1,'2026-01-09 04:54:14'),(35,79,'Rate business customer support','قيم دعم عملاء الأعمال',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(36,79,'What improvement do you suggest?','ما التحسين الذي تقترحه؟',4,'single_choice','[\"Better prices\", \"More features\", \"Better support\", \"Faster service\"]','[\"أسعار أفضل\", \"ميزات أكثر\", \"دعم أفضل\", \"خدمة أسرع\"]',1,1,'2026-01-09 04:54:14'),(37,87,'Rate Orange network quality','قيم جودة شبكة أورانج',1,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(38,87,'Which Orange plan do you use?','ما باقة أورانج التي تستخدمها؟',2,'single_choice','[\"Prepaid\", \"Postpaid\", \"Orange Cash\", \"Home Internet\"]','[\"مسبق الدفع\", \"آجل الدفع\", \"أورانج كاش\", \"إنترنت منزلي\"]',1,1,'2026-01-09 04:54:14'),(39,87,'How satisfied are you overall?','ما مدى رضاك بشكل عام؟',3,'single_choice','[\"Very satisfied\", \"Satisfied\", \"Neutral\", \"Dissatisfied\"]','[\"راضٍ جداً\", \"راضٍ\", \"محايد\", \"غير راضٍ\"]',1,1,'2026-01-09 04:54:14'),(40,87,'Would you switch to another provider?','هل ستنتقل لمزود آخر؟',4,'single_choice','[\"Never\", \"Unlikely\", \"Maybe\", \"Likely\"]','[\"أبداً\", \"غير محتمل\", \"ربما\", \"محتمل\"]',1,1,'2026-01-09 04:54:14'),(41,88,'Are you an Orange PREMIER customer?','هل أنت عميل Orange PREMIER؟',1,'single_choice','[\"Yes\", \"No\", \"Interested\"]','[\"نعم\", \"لا\", \"مهتم\"]',1,1,'2026-01-09 04:54:14'),(42,88,'Rate PREMIER benefits','قيم مزايا PREMIER',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(43,88,'Which PREMIER benefit do you value most?','ما ميزة PREMIER التي تقدرها أكثر؟',3,'single_choice','[\"Priority support\", \"Exclusive offers\", \"Lounge access\", \"Data benefits\"]','[\"دعم أولوية\", \"عروض حصرية\", \"دخول الصالة\", \"مزايا البيانات\"]',1,1,'2026-01-09 04:54:14'),(44,88,'Is PREMIER worth the price?','هل PREMIER يستحق السعر؟',4,'single_choice','[\"Definitely\", \"Somewhat\", \"Not sure\", \"No\"]','[\"بالتأكيد\", \"إلى حد ما\", \"غير متأكد\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(45,94,'How often do you drink Coca-Cola?','كم مرة تشرب كوكاكولا؟',1,'single_choice','[\"Daily\", \"Weekly\", \"Monthly\", \"Rarely\"]','[\"يومياً\", \"أسبوعياً\", \"شهرياً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(46,94,'Which Coca-Cola variant do you prefer?','ما نوع كوكاكولا المفضل لديك؟',2,'single_choice','[\"Original\", \"Zero Sugar\", \"Diet\", \"Cherry\"]','[\"الأصلي\", \"بدون سكر\", \"دايت\", \"كرز\"]',1,1,'2026-01-09 04:54:14'),(47,94,'Rate the taste of Coca-Cola','قيم طعم كوكاكولا',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(48,94,'Where do you usually buy Coca-Cola?','أين تشتري كوكاكولا عادة؟',4,'single_choice','[\"Supermarket\", \"Convenience store\", \"Restaurant\", \"Online\"]','[\"سوبرماركت\", \"متجر صغير\", \"مطعم\", \"أونلاين\"]',1,1,'2026-01-09 04:54:14'),(49,99,'Which Coca-Cola product have you tried?','ما منتج كوكاكولا الذي جربته؟',1,'single_choice','[\"Coca-Cola\", \"Sprite\", \"Fanta\", \"Schweppes\", \"All\"]','[\"كوكاكولا\", \"سبرايت\", \"فانتا\", \"شويبس\", \"الكل\"]',1,1,'2026-01-09 04:54:14'),(50,99,'Rate product availability','قيم توفر المنتج',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(51,99,'How is the pricing?','كيف الأسعار؟',3,'single_choice','[\"Very affordable\", \"Fair\", \"Expensive\", \"Very expensive\"]','[\"معقولة جداً\", \"عادلة\", \"غالية\", \"غالية جداً\"]',1,1,'2026-01-09 04:54:14'),(52,99,'Would you try new flavors?','هل ستجرب نكهات جديدة؟',4,'single_choice','[\"Yes, definitely\", \"Maybe\", \"No\"]','[\"نعم، بالتأكيد\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(53,102,'How often do you use Talabat?','كم مرة تستخدم طلبات؟',1,'single_choice','[\"Daily\", \"Weekly\", \"Monthly\", \"Rarely\"]','[\"يومياً\", \"أسبوعياً\", \"شهرياً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(54,102,'Rate delivery speed','قيم سرعة التوصيل',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(55,102,'How is the food quality on arrival?','كيف جودة الطعام عند الوصول؟',3,'single_choice','[\"Excellent\", \"Good\", \"Average\", \"Poor\"]','[\"ممتازة\", \"جيدة\", \"متوسطة\", \"ضعيفة\"]',1,1,'2026-01-09 04:54:14'),(56,102,'Would you recommend Talabat?','هل توصي بطلبات؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(57,105,'Are you a Talabat Pro subscriber?','هل أنت مشترك في Talabat Pro؟',1,'single_choice','[\"Yes\", \"No\", \"Considering\"]','[\"نعم\", \"لا\", \"أفكر في ذلك\"]',1,1,'2026-01-09 04:54:14'),(58,105,'Rate Talabat Pro value','قيم قيمة Talabat Pro',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(59,105,'Which Pro benefit do you value most?','ما ميزة Pro التي تقدرها أكثر؟',3,'single_choice','[\"Free delivery\", \"Exclusive offers\", \"Priority support\", \"All\"]','[\"توصيل مجاني\", \"عروض حصرية\", \"دعم أولوية\", \"الكل\"]',1,1,'2026-01-09 04:54:14'),(60,105,'Is the subscription price fair?','هل سعر الاشتراك عادل؟',4,'single_choice','[\"Yes\", \"Somewhat\", \"No\"]','[\"نعم\", \"إلى حد ما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(61,108,'Do you use CIB Mobile Banking?','هل تستخدم CIB Mobile Banking؟',1,'single_choice','[\"Yes, frequently\", \"Yes, sometimes\", \"No\"]','[\"نعم، كثيراً\", \"نعم، أحياناً\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(62,108,'Rate the app experience','قيم تجربة التطبيق',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(63,108,'Which feature do you use most?','ما الميزة التي تستخدمها أكثر؟',3,'single_choice','[\"Transfers\", \"Bill payment\", \"Card management\", \"Investments\"]','[\"التحويلات\", \"دفع الفواتير\", \"إدارة البطاقات\", \"الاستثمارات\"]',1,1,'2026-01-09 04:54:14'),(64,108,'Any issues with the app?','هل هناك مشاكل مع التطبيق؟',4,'single_choice','[\"No issues\", \"Minor issues\", \"Some issues\", \"Many issues\"]','[\"لا مشاكل\", \"مشاكل بسيطة\", \"بعض المشاكل\", \"مشاكل كثيرة\"]',1,1,'2026-01-09 04:54:14'),(65,112,'Are you interested in wealth management?','هل أنت مهتم بإدارة الثروات؟',1,'single_choice','[\"Yes\", \"Somewhat\", \"No\"]','[\"نعم\", \"إلى حد ما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(66,112,'What is your investment goal?','ما هدفك الاستثماري؟',2,'single_choice','[\"Retirement\", \"Education\", \"Property\", \"General savings\"]','[\"التقاعد\", \"التعليم\", \"العقارات\", \"ادخار عام\"]',1,1,'2026-01-09 04:54:14'),(67,112,'Rate CIB investment services','قيم خدمات CIB الاستثمارية',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(68,112,'Would you use CIB for investments?','هل ستستخدم CIB للاستثمارات؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(69,115,'Which soft drink do you prefer?','ما المشروب الغازي المفضل لديك؟',1,'single_choice','[\"Pepsi\", \"Coca-Cola\", \"7UP\", \"Other\"]','[\"بيبسي\", \"كوكاكولا\", \"سفن أب\", \"أخرى\"]',1,1,'2026-01-09 04:54:14'),(70,115,'How often do you drink Pepsi?','كم مرة تشرب بيبسي؟',2,'single_choice','[\"Daily\", \"Weekly\", \"Monthly\", \"Rarely\"]','[\"يومياً\", \"أسبوعياً\", \"شهرياً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(71,115,'Rate Pepsi taste','قيم طعم بيبسي',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(72,115,'What makes you choose Pepsi?','ما الذي يجعلك تختار بيبسي؟',4,'single_choice','[\"Taste\", \"Price\", \"Availability\", \"Brand\"]','[\"الطعم\", \"السعر\", \"التوفر\", \"العلامة التجارية\"]',1,1,'2026-01-09 04:54:14'),(73,118,'Which Lays flavor is your favorite?','ما نكهة ليز المفضلة لديك؟',1,'single_choice','[\"Classic\", \"Cheese\", \"Chili\", \"Salt & Vinegar\"]','[\"كلاسيك\", \"جبنة\", \"حار\", \"ملح وخل\"]',1,1,'2026-01-09 04:54:14'),(74,118,'How often do you eat Lays?','كم مرة تأكل ليز؟',2,'single_choice','[\"Daily\", \"Weekly\", \"Monthly\", \"Rarely\"]','[\"يومياً\", \"أسبوعياً\", \"شهرياً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(75,118,'Rate Lays quality','قيم جودة ليز',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(76,118,'Would you try new flavors?','هل ستجرب نكهات جديدة؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(77,120,'How often do you shop at Carrefour?','كم مرة تتسوق في كارفور؟',1,'single_choice','[\"Weekly\", \"Monthly\", \"Occasionally\", \"Rarely\"]','[\"أسبوعياً\", \"شهرياً\", \"أحياناً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(78,120,'Rate the shopping experience','قيم تجربة التسوق',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(79,120,'What do you usually buy?','ماذا تشتري عادة؟',3,'single_choice','[\"Groceries\", \"Electronics\", \"Household\", \"All\"]','[\"بقالة\", \"إلكترونيات\", \"منزلية\", \"الكل\"]',1,1,'2026-01-09 04:54:14'),(80,120,'Would you recommend Carrefour?','هل توصي بكارفور؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(81,124,'Do you own a Mansour brand car?','هل تمتلك سيارة من علامات منصور؟',1,'single_choice','[\"Chevrolet\", \"Opel\", \"MG\", \"None\"]','[\"شيفروليه\", \"أوبل\", \"MG\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(82,124,'Rate your car ownership experience','قيم تجربة امتلاك سيارتك',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(83,124,'How is the after-sales service?','كيف خدمة ما بعد البيع؟',3,'single_choice','[\"Excellent\", \"Good\", \"Average\", \"Poor\"]','[\"ممتازة\", \"جيدة\", \"متوسطة\", \"ضعيفة\"]',1,1,'2026-01-09 04:54:14'),(84,124,'Would you buy another Mansour car?','هل ستشتري سيارة منصور أخرى؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(85,125,'How often do you shop at Metro?','كم مرة تتسوق في مترو؟',1,'single_choice','[\"Weekly\", \"Monthly\", \"Occasionally\", \"Rarely\"]','[\"أسبوعياً\", \"شهرياً\", \"أحياناً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(86,125,'Rate product quality','قيم جودة المنتجات',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(87,125,'How are the prices?','كيف الأسعار؟',3,'single_choice','[\"Very affordable\", \"Fair\", \"Expensive\"]','[\"معقولة جداً\", \"عادلة\", \"غالية\"]',1,1,'2026-01-09 04:54:14'),(88,125,'Would you recommend Metro?','هل توصي بمترو؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(89,126,'How often do you visit McDonald\'s?','كم مرة تزور ماكدونالدز؟',1,'single_choice','[\"Weekly\", \"Monthly\", \"Occasionally\", \"Rarely\"]','[\"أسبوعياً\", \"شهرياً\", \"أحياناً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(90,126,'Rate the food quality','قيم جودة الطعام',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(91,126,'What is your favorite item?','ما هو صنفك المفضل؟',3,'single_choice','[\"Big Mac\", \"McChicken\", \"Nuggets\", \"Fries\", \"Other\"]','[\"بيج ماك\", \"ماك تشيكن\", \"ناجتس\", \"بطاطس\", \"أخرى\"]',1,1,'2026-01-09 04:54:14'),(92,126,'How is the service speed?','كيف سرعة الخدمة؟',4,'single_choice','[\"Very fast\", \"Fast\", \"Average\", \"Slow\"]','[\"سريعة جداً\", \"سريعة\", \"متوسطة\", \"بطيئة\"]',1,1,'2026-01-09 04:54:14'),(93,131,'Rate Etisalat network quality','قيم جودة شبكة اتصالات',1,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(94,131,'Which Etisalat service do you use?','ما خدمة اتصالات التي تستخدمها؟',2,'single_choice','[\"Mobile\", \"Home Internet\", \"Etisalat Cash\", \"All\"]','[\"موبايل\", \"إنترنت منزلي\", \"اتصالات كاش\", \"الكل\"]',1,1,'2026-01-09 04:54:14'),(95,131,'Rate customer service quality','قيم جودة خدمة العملاء',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(96,131,'Would you recommend Etisalat?','هل توصي باتصالات؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(97,134,'Do you use WE home internet?','هل تستخدم إنترنت WE المنزلي؟',1,'single_choice','[\"Yes\", \"No\", \"Considering\"]','[\"نعم\", \"لا\", \"أفكر في ذلك\"]',1,1,'2026-01-09 04:54:14'),(98,134,'Rate internet speed','قيم سرعة الإنترنت',2,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(99,134,'How is the service reliability?','كيف موثوقية الخدمة؟',3,'single_choice','[\"Very reliable\", \"Reliable\", \"Sometimes issues\", \"Unreliable\"]','[\"موثوقة جداً\", \"موثوقة\", \"أحياناً مشاكل\", \"غير موثوقة\"]',1,1,'2026-01-09 04:54:14'),(100,134,'Would you recommend WE internet?','هل توصي بإنترنت WE؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14'),(101,139,'Which Juhayna product do you buy?','ما منتج جهينة الذي تشتريه؟',1,'single_choice','[\"Milk\", \"Juice\", \"Yogurt\", \"Cheese\", \"All\"]','[\"حليب\", \"عصير\", \"زبادي\", \"جبنة\", \"الكل\"]',1,1,'2026-01-09 04:54:14'),(102,139,'How often do you buy Juhayna?','كم مرة تشتري جهينة؟',2,'single_choice','[\"Daily\", \"Weekly\", \"Monthly\", \"Rarely\"]','[\"يومياً\", \"أسبوعياً\", \"شهرياً\", \"نادراً\"]',1,1,'2026-01-09 04:54:14'),(103,139,'Rate product quality','قيم جودة المنتج',3,'scale','[\"1\", \"2\", \"3\", \"4\", \"5\"]','[\"1\", \"2\", \"3\", \"4\", \"5\"]',1,1,'2026-01-09 04:54:14'),(104,139,'Would you recommend Juhayna?','هل توصي بجهينة؟',4,'single_choice','[\"Yes\", \"Maybe\", \"No\"]','[\"نعم\", \"ربما\", \"لا\"]',1,1,'2026-01-09 04:54:14');
/*!40000 ALTER TABLE `survey_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_responses`
--

DROP TABLE IF EXISTS `survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submissionId` int NOT NULL,
  `questionId` int NOT NULL,
  `selectedOptions` json DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `submissionId` (`submissionId`),
  KEY `questionId` (`questionId`),
  CONSTRAINT `survey_responses_ibfk_1` FOREIGN KEY (`submissionId`) REFERENCES `task_submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `survey_responses_ibfk_2` FOREIGN KEY (`questionId`) REFERENCES `survey_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_responses`
--

LOCK TABLES `survey_responses` WRITE;
/*!40000 ALTER TABLE `survey_responses` DISABLE KEYS */;
INSERT INTO `survey_responses` VALUES (33,21,1,'[\"Samsung\"]','2025-12-17 20:33:24'),(34,21,2,'[\"10\"]','2025-12-17 20:33:24'),(35,21,3,'[\"Samsung\"]','2025-12-17 20:33:24'),(36,21,4,'[\"10\"]','2025-12-17 20:33:24'),(37,21,5,'[\"الترقية\"]','2025-12-17 20:33:24'),(38,21,6,'[\"حملات إطلاق المنتجات الجديدة (Galaxy Unpacked)\"]','2025-12-17 20:33:24'),(39,21,7,'[\"الهاتف الذكي\"]','2025-12-17 20:33:24'),(40,21,8,'[\"أقل من 5,000 جنيه\"]','2025-12-17 20:33:24'),(41,21,9,'[\"عبر الإنترنت (الموقع الإلكتروني/التطبيق)\"]','2025-12-17 20:33:24'),(42,21,10,'[\"موقع/تطبيق Samsung (Samsung.com)\"]','2025-12-17 20:33:24'),(43,21,11,'[\"أسعار معقولة\", \"توصيل سريع/مريح\", \"منتجات موثوقة\"]','2025-12-17 20:33:24'),(44,21,12,'[\"التصميم والملمس النهائي\", \"السعر/ العروض الترويجية\", \"المميزات الذكية والذكاء الاصطناعي\"]','2025-12-17 20:33:24'),(45,21,13,'[\"استبدل جهازك/منتجك القديم\", \"نقاط المكافأة/خصم\", \"خصومات الأسعار / الإعانات / الاسترداد النقدي\"]','2025-12-17 20:33:24'),(46,21,14,'[\"أسرة تضم أطفال في سن المدرسة\"]','2025-12-17 20:33:24'),(47,21,15,'[\"أقل من 50,000 جنيه\"]','2025-12-17 20:33:24'),(48,21,16,'[\"وسائل التواصل الاجتماعي (YouTube، Instagram، TikTok)\"]','2025-12-17 20:33:24'),(49,26,1,'[\"Google\"]','2025-12-20 23:23:45'),(50,26,2,'[\"4\"]','2025-12-20 23:23:45'),(51,26,3,'[\"Hisense\"]','2025-12-20 23:23:45'),(52,26,4,'[\"3\"]','2025-12-20 23:23:45'),(53,26,5,'[\"Birth\"]','2025-12-20 23:23:45'),(54,26,6,'[\"Special promotional campaigns for home appliances/IT products\"]','2025-12-20 23:23:45'),(55,26,7,'[\"Wireless earbuds\"]','2025-12-20 23:23:45'),(56,26,8,'[\"10,000 to 20,000 EGP\"]','2025-12-20 23:23:45'),(57,26,9,'[\"Physical store\"]','2025-12-20 23:23:45'),(58,26,10,'[\"Online marketplace (Amazon, Noon)\"]','2025-12-20 23:23:45'),(59,26,11,'[\"Different/convenient payment methods\"]','2025-12-20 23:23:45'),(60,26,12,'[\"Sales staff recommendations\"]','2025-12-20 23:23:45'),(61,26,13,'[\"Price discounts/subsidies/cashback\"]','2025-12-20 23:23:45'),(62,26,14,'[\"Family with school-age children\"]','2025-12-20 23:23:45'),(63,26,15,'[\"200,000 to 400,000 EGP\"]','2025-12-20 23:23:45'),(64,26,16,'[\"Search engines (Google, Bing)\"]','2025-12-20 23:23:45'),(65,28,1,'[\"Huawei\"]','2025-12-21 00:22:16'),(66,28,2,'[\"4\"]','2025-12-21 00:22:16'),(67,28,3,'[\"Toshiba\"]','2025-12-21 00:22:16'),(68,28,4,'[\"5\"]','2025-12-21 00:22:16'),(69,28,5,'[\"Starting school/Graduation\"]','2025-12-21 00:22:16'),(70,28,6,'[\"Special promotional campaigns for product categories of interest (gaming, health, music)\"]','2025-12-21 00:22:16'),(71,28,7,'[\"Oven/Microwave\"]','2025-12-21 00:22:16'),(72,28,8,'[\"More than 30,000 EGP\"]','2025-12-21 00:22:16'),(73,28,9,'[\"Physical store\"]','2025-12-21 00:22:16'),(74,28,10,'[\"Department store website/app\"]','2025-12-21 00:22:16'),(75,28,11,'[\"Different/convenient payment methods\"]','2025-12-21 00:22:16'),(76,28,12,'[\"Sales staff recommendations\"]','2025-12-21 00:22:16'),(77,28,13,'[\"Price discounts/subsidies/cashback\"]','2025-12-21 00:22:16'),(78,28,14,'[\"Family with adult children\"]','2025-12-21 00:22:16'),(79,28,15,'[\"400,000 to 600,000 EGP\"]','2025-12-21 00:22:16'),(80,28,16,'[\"Social media (YouTube, Instagram, TikTok)\"]','2025-12-21 00:22:16'),(81,30,1,'[\"Samsung\"]','2025-12-21 23:55:07'),(82,30,2,'[\"10\"]','2025-12-21 23:55:07'),(83,30,3,'[\"Samsung\"]','2025-12-21 23:55:07'),(84,30,4,'[\"10\"]','2025-12-21 23:55:07'),(85,30,5,'[\"None\"]','2025-12-21 23:55:07'),(86,30,6,'[\"Holiday/celebration campaigns (Eid Al-Fitr, Eid Al-Adha)\"]','2025-12-21 23:55:07'),(87,30,7,'[\"Air conditioner\"]','2025-12-21 23:55:07'),(88,30,8,'[\"Less than 5,000 EGP\"]','2025-12-21 23:55:07'),(89,30,9,'[\"Online (Website/App)\"]','2025-12-21 23:55:07'),(90,30,10,'[\"Consumer electronics store website/app\"]','2025-12-21 23:55:07'),(91,30,11,'[\"Reasonable prices\"]','2025-12-21 23:55:07'),(92,30,12,'[\"Product specifications and performance\"]','2025-12-21 23:55:07'),(93,30,13,'[\"Free or discounted repair cost insurance (Samsung CarePlus)\"]','2025-12-21 23:55:07'),(94,30,14,'[\"Single-person household\"]','2025-12-21 23:55:07'),(95,30,15,'[\"Less than 50,000 EGP\"]','2025-12-21 23:55:07'),(96,30,16,'[\"TV programs\"]','2025-12-21 23:55:07'),(97,31,1,'[\"Samsung\"]','2025-12-22 01:11:22'),(98,31,2,'[\"8\"]','2025-12-22 01:11:22'),(99,31,3,'[\"Samsung\"]','2025-12-22 01:11:22'),(100,31,4,'[\"8\"]','2025-12-22 01:11:22'),(101,31,5,'[\"Employment/Starting a business\"]','2025-12-22 01:11:22'),(102,31,6,'[\"New product launch campaigns (Galaxy Unpacked)\"]','2025-12-22 01:11:22'),(103,31,7,'[\"Wireless earbuds\"]','2025-12-22 01:11:22'),(104,31,8,'[\"5,000 to 10,000 EGP\"]','2025-12-22 01:11:22'),(105,31,9,'[\"Online (Website/App)\"]','2025-12-22 01:11:22'),(106,31,10,'[\"Samsung brand website/app (Samsung.com)\"]','2025-12-22 01:11:22'),(107,31,11,'[\"Reasonable prices\", \"Fast/convenient delivery\", \"Friendly and professional staff\"]','2025-12-22 01:11:22'),(108,31,12,'[\"Product specifications and performance\", \"Design and finish\", \"Sales staff recommendations\"]','2025-12-22 01:11:22'),(109,31,13,'[\"Free or discounted repair cost insurance (Samsung CarePlus)\", \"Price discounts/subsidies/cashback\", \"Extended warranty\"]','2025-12-22 01:11:22'),(110,31,14,'[\"Family with infant/toddler\"]','2025-12-22 01:11:22'),(111,31,15,'[\"Prefer not to answer\"]','2025-12-22 01:11:22'),(112,31,16,'[\"TV programs\", \"Search engines (Google, Bing)\", \"Social media (YouTube, Instagram, TikTok)\"]','2025-12-22 01:11:22'),(113,34,1,'[\"Samsung\"]','2025-12-22 02:55:32'),(114,34,2,'[\"8\"]','2025-12-22 02:55:32'),(115,34,3,'[\"Samsung\"]','2025-12-22 02:55:32'),(116,34,4,'[\"7\"]','2025-12-22 02:55:32'),(117,34,5,'[\"None\"]','2025-12-22 02:55:32'),(118,34,6,'[\"Special promotional campaigns for home appliances/IT products\"]','2025-12-22 02:55:32'),(119,34,7,'[\"Television\"]','2025-12-22 02:55:32'),(120,34,8,'[\"10,000 to 20,000 EGP\"]','2025-12-22 02:55:32'),(121,34,9,'[\"Online (Website/App)\"]','2025-12-22 02:55:32'),(122,34,10,'[\"Online marketplace (Amazon, Noon)\"]','2025-12-22 02:55:32'),(123,34,11,'[\"Reasonable prices\", \"Fast/convenient delivery\", \"Wide range of products\"]','2025-12-22 02:55:32'),(124,34,12,'[\"Product specifications and performance\", \"Brand preference\", \"Price/Promotions\"]','2025-12-22 02:55:32'),(125,34,13,'[\"Price discounts/subsidies/cashback\", \"Free or discounted accessories\", \"Extended warranty\"]','2025-12-22 02:55:32'),(126,34,14,'[\"Single-person household\"]','2025-12-22 02:55:32'),(127,34,15,'[\"Prefer not to answer\"]','2025-12-22 02:55:32'),(128,34,16,'[\"Search engines (Google, Bing)\", \"Social media (YouTube, Instagram, TikTok)\", \"IT company websites\"]','2025-12-22 02:55:32'),(129,35,1,'[\"Other\"]','2025-12-23 22:24:19'),(130,35,2,'[\"10\"]','2025-12-23 22:24:19'),(131,35,3,'[\"Samsung\"]','2025-12-23 22:24:19'),(132,35,4,'[\"10\"]','2025-12-23 22:24:19'),(133,35,5,'[\"Promotion\"]','2025-12-23 22:24:19'),(134,35,6,'[\"Special promotional campaigns for home appliances/IT products\"]','2025-12-23 22:24:19'),(135,35,7,'[\"Smartphone\"]','2025-12-23 22:24:19'),(136,35,8,'[\"20,000 to 30,000 EGP\"]','2025-12-23 22:24:19'),(137,35,9,'[\"Physical store\"]','2025-12-23 22:24:19'),(138,35,10,'[\"Consumer electronics store website/app\"]','2025-12-23 22:24:19'),(139,35,11,'[\"Different/convenient payment methods\", \"Reliable products\", \"Compare with other brand products\"]','2025-12-23 22:24:19'),(140,35,12,'[\"Product specifications and performance\", \"Durability\", \"Connectivity with other products\"]','2025-12-23 22:24:19'),(141,35,13,'[\"Bundle upgrades\", \"Free or discounted accessories\"]','2025-12-23 22:24:19'),(142,35,14,'[\"Single-person household\"]','2025-12-23 22:24:19'),(143,35,15,'[\"Prefer not to answer\"]','2025-12-23 22:24:19'),(144,35,16,'[\"Search engines (Google, Bing)\", \"IT-related online communities (forums, blogs)\", \"Social media (YouTube, Instagram, TikTok)\"]','2025-12-23 22:24:19'),(145,39,1,'[\"Apple\"]','2025-12-24 18:38:38'),(146,39,2,'[\"8\"]','2025-12-24 18:38:38'),(147,39,3,'[\"Samsung\"]','2025-12-24 18:38:38'),(148,39,4,'[\"8\"]','2025-12-24 18:38:38'),(149,39,5,'[\"Starting school/Graduation\"]','2025-12-24 18:38:38'),(150,39,6,'[\"Back to school/academic preparation campaign\"]','2025-12-24 18:38:38'),(151,39,7,'[\"Dryer\"]','2025-12-24 18:38:38'),(152,39,8,'[\"20,000 to 30,000 EGP\"]','2025-12-24 18:38:38'),(153,39,9,'[\"Online (Website/App)\"]','2025-12-24 18:38:38'),(154,39,10,'[\"Online marketplace (Amazon, Noon)\"]','2025-12-24 18:38:38'),(155,39,11,'[\"Fast/convenient delivery\"]','2025-12-24 18:38:38'),(156,39,12,'[\"Sales staff recommendations\"]','2025-12-24 18:38:38'),(157,39,13,'[\"Reward points/discount\"]','2025-12-24 18:38:38'),(158,39,14,'[\"Family with infant/toddler\"]','2025-12-24 18:38:38'),(159,39,15,'[\"200,000 to 400,000 EGP\"]','2025-12-24 18:38:38'),(160,39,16,'[\"Social media (YouTube, Instagram, TikTok)\"]','2025-12-24 18:38:38'),(161,40,1,'[\"Samsung\"]','2025-12-28 02:58:28'),(162,40,2,'[\"5\"]','2025-12-28 02:58:28'),(163,40,3,'[\"Samsung\"]','2025-12-28 02:58:28'),(164,40,4,'[\"1\"]','2025-12-28 02:58:28'),(165,40,5,'[\"Starting school/Graduation\"]','2025-12-28 02:58:28'),(166,40,6,'[\"Holiday/celebration campaigns (Eid Al-Fitr, Eid Al-Adha)\"]','2025-12-28 02:58:28'),(167,40,7,'[\"Dishwasher\"]','2025-12-28 02:58:28'),(168,40,8,'[\"10,000 to 20,000 EGP\"]','2025-12-28 02:58:28'),(169,40,9,'[\"Physical store\"]','2025-12-28 02:58:28'),(170,40,10,'[\"Department store website/app\"]','2025-12-28 02:58:28'),(171,40,11,'[\"Different/convenient payment methods\"]','2025-12-28 02:58:28'),(172,40,12,'[\"Design and finish\"]','2025-12-28 02:58:28'),(173,40,13,'[\"Free or discounted repair cost insurance (Samsung CarePlus)\"]','2025-12-28 02:58:28'),(174,40,14,'[\"Two-person household\"]','2025-12-28 02:58:28'),(175,40,15,'[\"100,000 to 200,000 EGP\"]','2025-12-28 02:58:28'),(176,40,16,'[\"TV programs\"]','2025-12-28 02:58:28'),(177,44,81,'[\"Chevrolet\"]','2026-01-09 05:00:38'),(178,44,82,'[\"4\"]','2026-01-09 05:00:38'),(179,44,83,'[\"Good\"]','2026-01-09 05:00:38'),(180,44,84,'[\"Yes\"]','2026-01-09 05:00:38'),(181,46,101,'[\"All\"]','2026-01-09 05:22:35'),(182,46,102,'[\"Monthly\"]','2026-01-09 05:22:35'),(183,46,103,'[\"5\"]','2026-01-09 05:22:35'),(184,46,104,'[\"Yes\"]','2026-01-09 05:22:35'),(185,47,81,'[\"Chevrolet\"]','2026-01-09 06:34:42'),(186,47,82,'[\"5\"]','2026-01-09 06:34:42'),(187,47,83,'[\"Excellent\"]','2026-01-09 06:34:42'),(188,47,84,'[\"Yes\"]','2026-01-09 06:34:42');
/*!40000 ALTER TABLE `survey_responses` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `targeting_tiers`
--

LOCK TABLES `targeting_tiers` WRITE;
/*!40000 ALTER TABLE `targeting_tiers` DISABLE KEYS */;
/*!40000 ALTER TABLE `targeting_tiers` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_questions`
--

LOCK TABLES `task_questions` WRITE;
/*!40000 ALTER TABLE `task_questions` DISABLE KEYS */;
INSERT INTO `task_questions` VALUES (202,31,'What is the name of the phone featured in the video?','ما اسم الهاتف المعروض في الفيديو؟',1,'multiple_choice','Samsung Galaxy S24','سامسونج جالاكسي S24','Samsung Galaxy Z Fold7','سامسونج جالاكسي Z فولد7','iPhone 16','آيفون 16','Google Pixel 9','جوجل بيكسل 9','B',NULL,NULL,NULL,'2025-12-17 13:27:40'),(203,31,'What type of phone is the Galaxy Z Fold7?','ما نوع هاتف جالاكسي Z فولد7؟',2,'multiple_choice','Regular smartphone','هاتف ذكي عادي','Foldable smartphone','هاتف ذكي قابل للطي','Tablet','جهاز لوحي','Flip phone','هاتف قابل للقلب','B',NULL,NULL,NULL,'2025-12-17 13:27:40'),(204,31,'Which company manufactures the Galaxy Z Fold7?','ما الشركة المصنعة لجالاكسي Z فولد7؟',3,'multiple_choice','Apple','آبل','Samsung','سامسونج','Google','جوجل','Huawei','هواوي','B',NULL,NULL,NULL,'2025-12-17 13:27:40'),(205,70,'What is the main AI feature in Galaxy S25?','ما هي ميزة الذكاء الاصطناعي الرئيسية في Galaxy S25؟',1,'multiple_choice','Galaxy AI','Galaxy AI','Bixby','بيكسبي','Google Assistant','مساعد جوجل','Siri','سيري','A','Galaxy AI is Samsung flagship AI feature','Galaxy AI هي ميزة الذكاء الاصطناعي الرئيسية من سامسونج',NULL,'2026-01-09 05:03:28'),(206,70,'What processor powers the Galaxy S25?','ما المعالج الذي يشغل Galaxy S25؟',2,'multiple_choice','Snapdragon 8 Elite','سنابدراجون 8 إيليت','Exynos 2400','إكسينوس 2400','A17 Pro','A17 برو','Dimensity 9300','ديمنسيتي 9300','A','Galaxy S25 uses Snapdragon 8 Elite processor','Galaxy S25 يستخدم معالج سنابدراجون 8 إيليت',NULL,'2026-01-09 05:03:28'),(207,70,'What is Circle to Search?','ما هو Circle to Search؟',3,'multiple_choice','AI search by circling objects','بحث بالذكاء الاصطناعي بدائرة حول الأشياء','A new browser','متصفح جديد','A game','لعبة','A camera mode','وضع كاميرا','A','Circle to Search lets you search anything by circling it','Circle to Search يتيح لك البحث عن أي شيء برسم دائرة حوله',NULL,'2026-01-09 05:03:28'),(208,70,'How many cameras does Galaxy S25 Ultra have?','كم عدد كاميرات Galaxy S25 Ultra؟',4,'multiple_choice','4 cameras','4 كاميرات','3 cameras','3 كاميرات','5 cameras','5 كاميرات','2 cameras','2 كاميرات','A','Galaxy S25 Ultra has 4 rear cameras','Galaxy S25 Ultra لديه 4 كاميرات خلفية',NULL,'2026-01-09 05:03:28'),(209,71,'When was Samsung founded?','متى تأسست سامسونج؟',1,'multiple_choice','1938','1938','1950','1950','1969','1969','1975','1975','A','Samsung was founded in 1938','تأسست سامسونج عام 1938',NULL,'2026-01-09 05:03:28'),(210,71,'What was Samsung first product?','ما هو أول منتج لسامسونج؟',2,'multiple_choice','Dried fish and noodles','سمك مجفف ومعكرونة','Electronics','إلكترونيات','Phones','هواتف','TVs','تلفزيونات','A','Samsung started as a trading company selling dried fish','بدأت سامسونج كشركة تجارية تبيع السمك المجفف',NULL,'2026-01-09 05:03:28'),(211,71,'Which country is Samsung from?','من أي بلد سامسونج؟',3,'multiple_choice','South Korea','كوريا الجنوبية','Japan','اليابان','China','الصين','Taiwan','تايوان','A','Samsung is a South Korean company','سامسونج شركة كورية جنوبية',NULL,'2026-01-09 05:03:28'),(212,71,'What does Samsung mean in Korean?','ماذا تعني سامسونج بالكورية؟',4,'multiple_choice','Three stars','ثلاث نجوم','Big company','شركة كبيرة','Technology','تكنولوجيا','Future','المستقبل','A','Samsung means three stars in Korean','سامسونج تعني ثلاث نجوم بالكورية',NULL,'2026-01-09 05:03:28'),(213,82,'What is Vodafone Cash?','ما هو فودافون كاش؟',1,'multiple_choice','Mobile wallet service','خدمة محفظة موبايل','A bank','بنك','A loan service','خدمة قروض','A credit card','بطاقة ائتمان','A','Vodafone Cash is a mobile wallet service','فودافون كاش هي خدمة محفظة موبايل',NULL,'2026-01-09 05:03:28'),(214,82,'What is Vodafone RED?','ما هو فودافون RED؟',2,'multiple_choice','Premium postpaid plan','باقة آجلة الدفع مميزة','A prepaid plan','باقة مسبقة الدفع','Internet service','خدمة إنترنت','A phone brand','علامة هواتف','A','Vodafone RED is the premium postpaid service','فودافون RED هي خدمة آجلة الدفع المميزة',NULL,'2026-01-09 05:03:28'),(215,82,'What network does Vodafone Egypt use?','ما الشبكة التي تستخدمها فودافون مصر؟',3,'multiple_choice','4G and 5G','4G و 5G','Only 3G','3G فقط','Only 4G','4G فقط','Only 2G','2G فقط','A','Vodafone Egypt offers 4G and 5G networks','فودافون مصر تقدم شبكات 4G و 5G',NULL,'2026-01-09 05:03:28'),(216,82,'What is Ana Vodafone?','ما هو أنا فودافون؟',4,'multiple_choice','Self-service app','تطبيق خدمة ذاتية','A TV channel','قناة تلفزيونية','A store','متجر','A website only','موقع فقط','A','Ana Vodafone is the self-service mobile app','أنا فودافون هو تطبيق الخدمة الذاتية',NULL,'2026-01-09 05:03:28'),(217,91,'What is Orange Cash?','ما هو أورانج كاش؟',1,'multiple_choice','Mobile payment service','خدمة دفع موبايل','A bank account','حساب بنكي','A credit card','بطاقة ائتمان','A loan','قرض','A','Orange Cash is a mobile payment service','أورانج كاش هي خدمة دفع موبايل',NULL,'2026-01-09 05:03:28'),(218,91,'What is Orange PREMIER?','ما هو Orange PREMIER؟',2,'multiple_choice','VIP customer program','برنامج عملاء VIP','A phone model','موديل هاتف','An internet plan','باقة إنترنت','A TV service','خدمة تلفزيون','A','Orange PREMIER is the VIP customer program','Orange PREMIER هو برنامج عملاء VIP',NULL,'2026-01-09 05:03:28'),(219,91,'What color is Orange brand?','ما لون علامة أورانج؟',3,'multiple_choice','Orange','برتقالي','Red','أحمر','Blue','أزرق','Green','أخضر','A','Orange brand color is orange','لون علامة أورانج هو البرتقالي',NULL,'2026-01-09 05:03:28'),(220,91,'What is Orange DSL?','ما هو Orange DSL؟',4,'multiple_choice','Home internet service','خدمة إنترنت منزلي','Mobile data','بيانات موبايل','A phone plan','باقة هاتف','A TV service','خدمة تلفزيون','A','Orange DSL is home internet service','Orange DSL هي خدمة إنترنت منزلي',NULL,'2026-01-09 05:03:28'),(221,95,'When was Coca-Cola invented?','متى اخترعت كوكاكولا؟',1,'multiple_choice','1886','1886','1900','1900','1920','1920','1950','1950','A','Coca-Cola was invented in 1886','اخترعت كوكاكولا عام 1886',NULL,'2026-01-09 05:03:28'),(222,95,'What is Coca-Cola Zero Sugar?','ما هو كوكاكولا زيرو شوجر؟',2,'multiple_choice','Sugar-free Coca-Cola','كوكاكولا بدون سكر','A new flavor','نكهة جديدة','A diet drink','مشروب دايت','Energy drink','مشروب طاقة','A','Coca-Cola Zero Sugar is sugar-free Coca-Cola','كوكاكولا زيرو شوجر هي كوكاكولا بدون سكر',NULL,'2026-01-09 05:03:28'),(223,95,'Which company owns Sprite?','أي شركة تمتلك سبرايت؟',3,'multiple_choice','Coca-Cola Company','شركة كوكاكولا','PepsiCo','بيبسيكو','Nestle','نستله','Red Bull','ريد بول','A','Sprite is owned by Coca-Cola Company','سبرايت مملوكة لشركة كوكاكولا',NULL,'2026-01-09 05:03:28'),(224,95,'What is the original Coca-Cola color?','ما هو لون كوكاكولا الأصلي؟',4,'multiple_choice','Caramel brown','بني كراميل','Clear','شفاف','Red','أحمر','Black','أسود','A','Coca-Cola is caramel brown in color','كوكاكولا لونها بني كراميل',NULL,'2026-01-09 05:03:28'),(225,100,'What is Coca-Cola World Without Waste goal?','ما هو هدف كوكاكولا عالم بدون نفايات؟',1,'multiple_choice','Collect and recycle bottles','جمع وإعادة تدوير الزجاجات','Stop production','وقف الإنتاج','Use glass only','استخدام الزجاج فقط','Reduce size','تقليل الحجم','A','World Without Waste aims to collect and recycle bottles','عالم بدون نفايات يهدف لجمع وإعادة تدوير الزجاجات',NULL,'2026-01-09 05:03:28'),(226,100,'What material are most Coca-Cola bottles made of?','من أي مادة تصنع معظم زجاجات كوكاكولا؟',2,'multiple_choice','PET plastic','بلاستيك PET','Glass','زجاج','Aluminum','ألومنيوم','Paper','ورق','A','Most Coca-Cola bottles are made of PET plastic','معظم زجاجات كوكاكولا مصنوعة من بلاستيك PET',NULL,'2026-01-09 05:03:28'),(227,100,'What does rPET mean?','ماذا يعني rPET؟',3,'multiple_choice','Recycled PET plastic','بلاستيك PET معاد تدويره','Red PET','PET أحمر','Regular PET','PET عادي','Refined PET','PET مكرر','A','rPET means recycled PET plastic','rPET يعني بلاستيك PET معاد تدويره',NULL,'2026-01-09 05:03:28'),(228,100,'By what year does Coca-Cola aim to be net zero?','بحلول أي عام تهدف كوكاكولا للوصول لصفر انبعاثات؟',4,'multiple_choice','2050','2050','2030','2030','2025','2025','2040','2040','A','Coca-Cola aims to be net zero by 2050','تهدف كوكاكولا للوصول لصفر انبعاثات بحلول 2050',NULL,'2026-01-09 05:03:28'),(229,103,'What is Talabat?','ما هو طلبات؟',1,'multiple_choice','Food delivery app','تطبيق توصيل طعام','A restaurant','مطعم','A supermarket','سوبرماركت','A bank','بنك','A','Talabat is a food delivery app','طلبات هو تطبيق توصيل طعام',NULL,'2026-01-09 05:03:28'),(230,103,'What is Talabat Pro?','ما هو Talabat Pro؟',2,'multiple_choice','Subscription with free delivery','اشتراك مع توصيل مجاني','A restaurant','مطعم','A credit card','بطاقة ائتمان','A phone app','تطبيق هاتف','A','Talabat Pro offers free delivery subscription','Talabat Pro يقدم اشتراك توصيل مجاني',NULL,'2026-01-09 05:03:28'),(231,103,'What is Talabat Mart?','ما هو Talabat Mart؟',3,'multiple_choice','Grocery delivery service','خدمة توصيل بقالة','A restaurant','مطعم','A mall','مول','A bank','بنك','A','Talabat Mart is grocery delivery service','Talabat Mart هي خدمة توصيل بقالة',NULL,'2026-01-09 05:03:28'),(232,103,'Which company owns Talabat?','أي شركة تمتلك طلبات؟',4,'multiple_choice','Delivery Hero','ديليفري هيرو','Amazon','أمازون','Google','جوجل','Uber','أوبر','A','Talabat is owned by Delivery Hero','طلبات مملوكة لديليفري هيرو',NULL,'2026-01-09 05:03:28'),(233,110,'What does CIB stand for?','ماذا يعني CIB؟',1,'multiple_choice','Commercial International Bank','البنك التجاري الدولي','Central Investment Bank','بنك الاستثمار المركزي','Cairo International Bank','بنك القاهرة الدولي','Credit International Bank','بنك الائتمان الدولي','A','CIB stands for Commercial International Bank','CIB يعني البنك التجاري الدولي',NULL,'2026-01-09 05:03:28'),(234,110,'What is a savings account?','ما هو حساب التوفير؟',2,'multiple_choice','Account that earns interest','حساب يكسب فائدة','A loan account','حساب قرض','A credit card','بطاقة ائتمان','A business account','حساب تجاري','A','Savings account earns interest on deposits','حساب التوفير يكسب فائدة على الودائع',NULL,'2026-01-09 05:03:28'),(235,110,'What is CIB Smart Wallet?','ما هي CIB Smart Wallet؟',3,'multiple_choice','Mobile payment solution','حل دفع موبايل','A physical wallet','محفظة فعلية','A credit card','بطاقة ائتمان','A loan','قرض','A','CIB Smart Wallet is a mobile payment solution','CIB Smart Wallet هي حل دفع موبايل',NULL,'2026-01-09 05:03:28'),(236,110,'What is compound interest?','ما هي الفائدة المركبة؟',4,'multiple_choice','Interest on interest','فائدة على الفائدة','Simple interest','فائدة بسيطة','No interest','بدون فائدة','Fixed interest','فائدة ثابتة','A','Compound interest is interest calculated on principal plus accumulated interest','الفائدة المركبة هي فائدة محسوبة على الأصل والفائدة المتراكمة',NULL,'2026-01-09 05:03:28'),(237,116,'When was Pepsi created?','متى تم إنشاء بيبسي؟',1,'multiple_choice','1893','1893','1886','1886','1900','1900','1920','1920','A','Pepsi was created in 1893','تم إنشاء بيبسي عام 1893',NULL,'2026-01-09 05:03:28'),(238,116,'What was Pepsi original name?','ما كان اسم بيبسي الأصلي؟',2,'multiple_choice','Brad Drink','براد درينك','Cola Drink','كولا درينك','Pepsi Cola','بيبسي كولا','Sweet Cola','سويت كولا','A','Pepsi was originally called Brad Drink','كان اسم بيبسي الأصلي براد درينك',NULL,'2026-01-09 05:03:28'),(239,116,'Which company owns Lays chips?','أي شركة تمتلك شيبس ليز؟',3,'multiple_choice','PepsiCo','بيبسيكو','Coca-Cola','كوكاكولا','Nestle','نستله','Mars','مارس','A','Lays is owned by PepsiCo','ليز مملوكة لبيبسيكو',NULL,'2026-01-09 05:03:28'),(240,116,'What color is Pepsi logo?','ما لون شعار بيبسي؟',4,'multiple_choice','Blue, red, and white','أزرق وأحمر وأبيض','Red only','أحمر فقط','Blue only','أزرق فقط','Green','أخضر','A','Pepsi logo is blue, red, and white','شعار بيبسي أزرق وأحمر وأبيض',NULL,'2026-01-09 05:03:28'),(241,121,'Where is Carrefour from?','من أين كارفور؟',1,'multiple_choice','France','فرنسا','USA','أمريكا','UK','بريطانيا','Germany','ألمانيا','A','Carrefour is a French company','كارفور شركة فرنسية',NULL,'2026-01-09 05:03:28'),(242,121,'What does Carrefour mean?','ماذا تعني كارفور؟',2,'multiple_choice','Crossroads','مفترق طرق','Big store','متجر كبير','Low price','سعر منخفض','Quality','جودة','A','Carrefour means crossroads in French','كارفور تعني مفترق طرق بالفرنسية',NULL,'2026-01-09 05:03:28'),(243,121,'What is Carrefour hypermarket?','ما هو هايبرماركت كارفور؟',3,'multiple_choice','Large supermarket with variety','سوبرماركت كبير متنوع','Small shop','متجر صغير','Online only','أونلاين فقط','Restaurant','مطعم','A','Carrefour hypermarket is a large supermarket with wide variety','هايبرماركت كارفور هو سوبرماركت كبير متنوع',NULL,'2026-01-09 05:03:28'),(244,121,'What is MyClub Carrefour?','ما هو MyClub كارفور؟',4,'multiple_choice','Loyalty rewards program','برنامج مكافآت ولاء','A credit card','بطاقة ائتمان','A gym','نادي رياضي','A restaurant','مطعم','A','MyClub is Carrefour loyalty rewards program','MyClub هو برنامج مكافآت ولاء كارفور',NULL,'2026-01-09 05:03:28'),(245,128,'Which car brands does Mansour sell?','ما ماركات السيارات التي يبيعها منصور؟',1,'multiple_choice','Chevrolet, Opel, MG','شيفروليه، أوبل، MG','Toyota, Honda','تويوتا، هوندا','BMW, Mercedes','بي إم دبليو، مرسيدس','Ford, Jeep','فورد، جيب','A','Mansour sells Chevrolet, Opel, and MG','منصور يبيع شيفروليه وأوبل وMG',NULL,'2026-01-09 05:03:28'),(246,128,'What is Mansour Group?','ما هي مجموعة منصور؟',2,'multiple_choice','Egyptian conglomerate','تكتل مصري','A car brand','علامة سيارات','A bank','بنك','A restaurant chain','سلسلة مطاعم','A','Mansour Group is an Egyptian conglomerate','مجموعة منصور هي تكتل مصري',NULL,'2026-01-09 05:03:28'),(247,128,'What is Metro Market?','ما هو مترو ماركت؟',3,'multiple_choice','Supermarket chain by Mansour','سلسلة سوبرماركت من منصور','A car dealership','وكالة سيارات','A bank','بنك','A restaurant','مطعم','A','Metro Market is a supermarket chain owned by Mansour','مترو ماركت هي سلسلة سوبرماركت مملوكة لمنصور',NULL,'2026-01-09 05:03:28'),(248,128,'Which fast food does Mansour operate in Egypt?','أي وجبات سريعة يديرها منصور في مصر؟',4,'multiple_choice','McDonald\'s','ماكدونالدز','KFC','كنتاكي','Burger King','برجر كينج','Subway','صب واي','A','Mansour operates McDonald\'s in Egypt','منصور يدير ماكدونالدز في مصر',NULL,'2026-01-09 05:03:28'),(249,133,'What is Etisalat Cash?','ما هو اتصالات كاش؟',1,'multiple_choice','Mobile wallet service','خدمة محفظة موبايل','A bank','بنك','A loan service','خدمة قروض','A credit card','بطاقة ائتمان','A','Etisalat Cash is a mobile wallet service','اتصالات كاش هي خدمة محفظة موبايل',NULL,'2026-01-09 05:03:28'),(250,133,'What network does Etisalat Egypt offer?','ما الشبكة التي تقدمها اتصالات مصر؟',2,'multiple_choice','4G and 5G','4G و 5G','Only 3G','3G فقط','Only 2G','2G فقط','WiFi only','واي فاي فقط','A','Etisalat Egypt offers 4G and 5G networks','اتصالات مصر تقدم شبكات 4G و 5G',NULL,'2026-01-09 05:03:28'),(251,133,'What is My Etisalat app?','ما هو تطبيق My Etisalat؟',3,'multiple_choice','Self-service app','تطبيق خدمة ذاتية','A game','لعبة','A browser','متصفح','A music app','تطبيق موسيقى','A','My Etisalat is the self-service mobile app','My Etisalat هو تطبيق الخدمة الذاتية',NULL,'2026-01-09 05:03:28'),(252,133,'Where is Etisalat headquarters?','أين المقر الرئيسي لاتصالات؟',4,'multiple_choice','UAE','الإمارات','Egypt','مصر','Saudi Arabia','السعودية','Qatar','قطر','A','Etisalat headquarters is in UAE','المقر الرئيسي لاتصالات في الإمارات',NULL,'2026-01-09 05:03:28'),(253,138,'What is WE Egypt?','ما هي WE مصر؟',1,'multiple_choice','Telecom Egypt brand','علامة المصرية للاتصالات','A bank','بنك','A supermarket','سوبرماركت','A car company','شركة سيارات','A','WE is the brand name of Telecom Egypt','WE هي العلامة التجارية للمصرية للاتصالات',NULL,'2026-01-09 05:03:28'),(254,138,'What is WE Space?','ما هو WE Space؟',2,'multiple_choice','Entertainment platform','منصة ترفيه','A rocket','صاروخ','A gym','نادي رياضي','A mall','مول','A','WE Space is an entertainment platform','WE Space هي منصة ترفيه',NULL,'2026-01-09 05:03:28'),(255,138,'What internet does WE offer?','ما الإنترنت الذي تقدمه WE؟',3,'multiple_choice','ADSL and Fiber','ADSL وفايبر','Only mobile','موبايل فقط','Satellite','قمر صناعي','Dial-up','دايل أب','A','WE offers ADSL and Fiber internet','WE تقدم إنترنت ADSL وفايبر',NULL,'2026-01-09 05:03:28'),(256,138,'What is WE landline code?','ما هو كود خط WE الأرضي؟',4,'multiple_choice','02 for Cairo','02 للقاهرة','010','010','011','011','012','012','A','Cairo landline code is 02','كود القاهرة الأرضي هو 02',NULL,'2026-01-09 05:03:28'),(257,141,'What products does Juhayna make?','ما المنتجات التي تصنعها جهينة؟',1,'multiple_choice','Dairy and juice','ألبان وعصائر','Cars','سيارات','Electronics','إلكترونيات','Clothes','ملابس','A','Juhayna makes dairy products and juices','جهينة تصنع منتجات الألبان والعصائر',NULL,'2026-01-09 05:03:28'),(258,141,'What is Juhayna Pure?','ما هو جهينة بيور؟',2,'multiple_choice','Natural juice brand','علامة عصير طبيعي','A milk type','نوع حليب','A yogurt','زبادي','A cheese','جبنة','A','Juhayna Pure is a natural juice brand','جهينة بيور هي علامة عصير طبيعي',NULL,'2026-01-09 05:03:28'),(259,141,'Where is Juhayna from?','من أين جهينة؟',3,'multiple_choice','Egypt','مصر','Saudi Arabia','السعودية','UAE','الإمارات','Lebanon','لبنان','A','Juhayna is an Egyptian company','جهينة شركة مصرية',NULL,'2026-01-09 05:03:28'),(260,141,'What is Juhayna Rayeb?','ما هو جهينة رايب؟',4,'multiple_choice','Fermented milk drink','مشروب حليب مخمر','Cheese','جبنة','Juice','عصير','Butter','زبدة','A','Juhayna Rayeb is a fermented milk drink','جهينة رايب هو مشروب حليب مخمر',NULL,'2026-01-09 05:03:28');
/*!40000 ALTER TABLE `task_questions` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_submissions`
--

LOCK TABLES `task_submissions` WRITE;
/*!40000 ALTER TABLE `task_submissions` DISABLE KEYS */;
INSERT INTO `task_submissions` VALUES (21,60,1421,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":2,\"selectedOptions\":[\"10\"]},{\"questionId\":3,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":4,\"selectedOptions\":[\"10\"]},{\"questionId\":5,\"selectedOptions\":[\"الترقية\"]},{\"questionId\":6,\"selectedOptions\":[\"حملات إطلاق المنتجات الجديدة (Galaxy Unpacked)\"]},{\"questionId\":7,\"selectedOptions\":[\"الهاتف الذكي\"]},{\"questionId\":8,\"selectedOptions\":[\"أقل من 5,000 جنيه\"]},{\"questionId\":9,\"selectedOptions\":[\"عبر الإنترنت (الموقع الإلكتروني/التطبيق)\"]},{\"questionId\":10,\"selectedOptions\":[\"موقع/تطبيق Samsung (Samsung.com)\"]},{\"questionId\":11,\"selectedOptions\":[\"أسعار معقولة\",\"توصيل سريع/مريح\",\"منتجات موثوقة\"]},{\"questionId\":12,\"selectedOptions\":[\"التصميم والملمس النهائي\",\"السعر/ العروض الترويجية\",\"المميزات الذكية والذكاء الاصطناعي\"]},{\"questionId\":13,\"selectedOptions\":[\"استبدل جهازك/منتجك القديم\",\"نقاط المكافأة/خصم\",\"خصومات الأسعار / الإعانات / الاسترداد النقدي\"]},{\"questionId\":14,\"selectedOptions\":[\"أسرة تضم أطفال في سن المدرسة\"]},{\"questionId\":15,\"selectedOptions\":[\"أقل من 50,000 جنيه\"]},{\"questionId\":16,\"selectedOptions\":[\"وسائل التواصل الاجتماعي (YouTube، Instagram، TikTok)\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-17 20:33:24','2025-12-17 20:33:24','2025-12-17 20:33:24'),(22,31,1421,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,61,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-17 20:35:10','2025-12-17 20:35:10','2025-12-17 20:35:10'),(23,31,1436,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,49,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-17 23:15:36','2025-12-17 23:15:36','2025-12-17 23:15:36'),(24,31,1534,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,57,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-20 22:24:27','2025-12-20 22:24:27','2025-12-20 22:24:27'),(25,31,1590,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,89,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-20 23:21:17','2025-12-20 23:21:17','2025-12-20 23:21:17'),(26,60,1590,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Google\"]},{\"questionId\":2,\"selectedOptions\":[\"4\"]},{\"questionId\":3,\"selectedOptions\":[\"Hisense\"]},{\"questionId\":4,\"selectedOptions\":[\"3\"]},{\"questionId\":5,\"selectedOptions\":[\"Birth\"]},{\"questionId\":6,\"selectedOptions\":[\"Special promotional campaigns for home appliances/IT products\"]},{\"questionId\":7,\"selectedOptions\":[\"Wireless earbuds\"]},{\"questionId\":8,\"selectedOptions\":[\"10,000 to 20,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Physical store\"]},{\"questionId\":10,\"selectedOptions\":[\"Online marketplace (Amazon, Noon)\"]},{\"questionId\":11,\"selectedOptions\":[\"Different/convenient payment methods\"]},{\"questionId\":12,\"selectedOptions\":[\"Sales staff recommendations\"]},{\"questionId\":13,\"selectedOptions\":[\"Price discounts/subsidies/cashback\"]},{\"questionId\":14,\"selectedOptions\":[\"Family with school-age children\"]},{\"questionId\":15,\"selectedOptions\":[\"200,000 to 400,000 EGP\"]},{\"questionId\":16,\"selectedOptions\":[\"Search engines (Google, Bing)\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-20 23:23:45','2025-12-20 23:23:45','2025-12-20 23:23:45'),(27,31,1906,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,51,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-21 00:21:30','2025-12-21 00:21:30','2025-12-21 00:21:30'),(28,60,1906,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Huawei\"]},{\"questionId\":2,\"selectedOptions\":[\"4\"]},{\"questionId\":3,\"selectedOptions\":[\"Toshiba\"]},{\"questionId\":4,\"selectedOptions\":[\"5\"]},{\"questionId\":5,\"selectedOptions\":[\"Starting school/Graduation\"]},{\"questionId\":6,\"selectedOptions\":[\"Special promotional campaigns for product categories of interest (gaming, health, music)\"]},{\"questionId\":7,\"selectedOptions\":[\"Oven/Microwave\"]},{\"questionId\":8,\"selectedOptions\":[\"More than 30,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Physical store\"]},{\"questionId\":10,\"selectedOptions\":[\"Department store website/app\"]},{\"questionId\":11,\"selectedOptions\":[\"Different/convenient payment methods\"]},{\"questionId\":12,\"selectedOptions\":[\"Sales staff recommendations\"]},{\"questionId\":13,\"selectedOptions\":[\"Price discounts/subsidies/cashback\"]},{\"questionId\":14,\"selectedOptions\":[\"Family with adult children\"]},{\"questionId\":15,\"selectedOptions\":[\"400,000 to 600,000 EGP\"]},{\"questionId\":16,\"selectedOptions\":[\"Social media (YouTube, Instagram, TikTok)\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-21 00:22:16','2025-12-21 00:22:16','2025-12-21 00:22:16'),(29,31,2038,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,53,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-21 23:42:44','2025-12-21 23:42:44','2025-12-21 23:42:44'),(30,60,2038,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":2,\"selectedOptions\":[\"10\"]},{\"questionId\":3,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":4,\"selectedOptions\":[\"10\"]},{\"questionId\":5,\"selectedOptions\":[\"None\"]},{\"questionId\":6,\"selectedOptions\":[\"Holiday/celebration campaigns (Eid Al-Fitr, Eid Al-Adha)\"]},{\"questionId\":7,\"selectedOptions\":[\"Air conditioner\"]},{\"questionId\":8,\"selectedOptions\":[\"Less than 5,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Online (Website/App)\"]},{\"questionId\":10,\"selectedOptions\":[\"Consumer electronics store website/app\"]},{\"questionId\":11,\"selectedOptions\":[\"Reasonable prices\"]},{\"questionId\":12,\"selectedOptions\":[\"Product specifications and performance\"]},{\"questionId\":13,\"selectedOptions\":[\"Free or discounted repair cost insurance (Samsung CarePlus)\"]},{\"questionId\":14,\"selectedOptions\":[\"Single-person household\"]},{\"questionId\":15,\"selectedOptions\":[\"Less than 50,000 EGP\"]},{\"questionId\":16,\"selectedOptions\":[\"TV programs\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-21 23:55:07','2025-12-21 23:55:07','2025-12-21 23:55:07'),(31,60,2081,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":2,\"selectedOptions\":[\"8\"]},{\"questionId\":3,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":4,\"selectedOptions\":[\"8\"]},{\"questionId\":5,\"selectedOptions\":[\"Employment/Starting a business\"]},{\"questionId\":6,\"selectedOptions\":[\"New product launch campaigns (Galaxy Unpacked)\"]},{\"questionId\":7,\"selectedOptions\":[\"Wireless earbuds\"]},{\"questionId\":8,\"selectedOptions\":[\"5,000 to 10,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Online (Website/App)\"]},{\"questionId\":10,\"selectedOptions\":[\"Samsung brand website/app (Samsung.com)\"]},{\"questionId\":11,\"selectedOptions\":[\"Reasonable prices\",\"Fast/convenient delivery\",\"Friendly and professional staff\"]},{\"questionId\":12,\"selectedOptions\":[\"Product specifications and performance\",\"Design and finish\",\"Sales staff recommendations\"]},{\"questionId\":13,\"selectedOptions\":[\"Free or discounted repair cost insurance (Samsung CarePlus)\",\"Price discounts/subsidies/cashback\",\"Extended warranty\"]},{\"questionId\":14,\"selectedOptions\":[\"Family with infant/toddler\"]},{\"questionId\":15,\"selectedOptions\":[\"Prefer not to answer\"]},{\"questionId\":16,\"selectedOptions\":[\"TV programs\",\"Search engines (Google, Bing)\",\"Social media (YouTube, Instagram, TikTok)\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-22 01:11:22','2025-12-22 01:11:22','2025-12-22 01:11:22'),(32,31,2081,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,67,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-22 01:13:56','2025-12-22 01:13:56','2025-12-22 01:13:56'),(33,31,2169,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,53,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-22 02:52:43','2025-12-22 02:52:43','2025-12-22 02:52:43'),(34,60,2169,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":2,\"selectedOptions\":[\"8\"]},{\"questionId\":3,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":4,\"selectedOptions\":[\"7\"]},{\"questionId\":5,\"selectedOptions\":[\"None\"]},{\"questionId\":6,\"selectedOptions\":[\"Special promotional campaigns for home appliances/IT products\"]},{\"questionId\":7,\"selectedOptions\":[\"Television\"]},{\"questionId\":8,\"selectedOptions\":[\"10,000 to 20,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Online (Website/App)\"]},{\"questionId\":10,\"selectedOptions\":[\"Online marketplace (Amazon, Noon)\"]},{\"questionId\":11,\"selectedOptions\":[\"Reasonable prices\",\"Fast/convenient delivery\",\"Wide range of products\"]},{\"questionId\":12,\"selectedOptions\":[\"Product specifications and performance\",\"Brand preference\",\"Price/Promotions\"]},{\"questionId\":13,\"selectedOptions\":[\"Price discounts/subsidies/cashback\",\"Free or discounted accessories\",\"Extended warranty\"]},{\"questionId\":14,\"selectedOptions\":[\"Single-person household\"]},{\"questionId\":15,\"selectedOptions\":[\"Prefer not to answer\"]},{\"questionId\":16,\"selectedOptions\":[\"Search engines (Google, Bing)\",\"Social media (YouTube, Instagram, TikTok)\",\"IT company websites\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-22 02:55:32','2025-12-22 02:55:32','2025-12-22 02:55:32'),(35,60,2196,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Other\"]},{\"questionId\":2,\"selectedOptions\":[\"10\"]},{\"questionId\":3,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":4,\"selectedOptions\":[\"10\"]},{\"questionId\":5,\"selectedOptions\":[\"Promotion\"]},{\"questionId\":6,\"selectedOptions\":[\"Special promotional campaigns for home appliances/IT products\"]},{\"questionId\":7,\"selectedOptions\":[\"Smartphone\"]},{\"questionId\":8,\"selectedOptions\":[\"20,000 to 30,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Physical store\"]},{\"questionId\":10,\"selectedOptions\":[\"Consumer electronics store website/app\"]},{\"questionId\":11,\"selectedOptions\":[\"Different/convenient payment methods\",\"Reliable products\",\"Compare with other brand products\"]},{\"questionId\":12,\"selectedOptions\":[\"Product specifications and performance\",\"Durability\",\"Connectivity with other products\"]},{\"questionId\":13,\"selectedOptions\":[\"Bundle upgrades\",\"Free or discounted accessories\"]},{\"questionId\":14,\"selectedOptions\":[\"Single-person household\"]},{\"questionId\":15,\"selectedOptions\":[\"Prefer not to answer\"]},{\"questionId\":16,\"selectedOptions\":[\"Search engines (Google, Bing)\",\"IT-related online communities (forums, blogs)\",\"Social media (YouTube, Instagram, TikTok)\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-23 22:24:19','2025-12-23 22:24:19','2025-12-23 22:24:19'),(36,31,2196,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,58,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-23 22:31:01','2025-12-23 22:31:01','2025-12-23 22:31:01'),(37,31,2196,'rejected','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"A\",\"correctAnswer\":\"B\",\"isCorrect\":false},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"A\",\"correctAnswer\":\"B\",\"isCorrect\":false},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"A\",\"correctAnswer\":\"B\",\"isCorrect\":false}],\"passed\":false,\"watchTimePassed\":true}',0,51,0,3,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'2025-12-23 22:32:08','2025-12-23 22:32:08',NULL),(38,31,2196,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,51,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-23 22:33:12','2025-12-23 22:33:12','2025-12-23 22:33:12'),(39,60,2394,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Apple\"]},{\"questionId\":2,\"selectedOptions\":[\"8\"]},{\"questionId\":3,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":4,\"selectedOptions\":[\"8\"]},{\"questionId\":5,\"selectedOptions\":[\"Starting school/Graduation\"]},{\"questionId\":6,\"selectedOptions\":[\"Back to school/academic preparation campaign\"]},{\"questionId\":7,\"selectedOptions\":[\"Dryer\"]},{\"questionId\":8,\"selectedOptions\":[\"20,000 to 30,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Online (Website/App)\"]},{\"questionId\":10,\"selectedOptions\":[\"Online marketplace (Amazon, Noon)\"]},{\"questionId\":11,\"selectedOptions\":[\"Fast/convenient delivery\"]},{\"questionId\":12,\"selectedOptions\":[\"Sales staff recommendations\"]},{\"questionId\":13,\"selectedOptions\":[\"Reward points/discount\"]},{\"questionId\":14,\"selectedOptions\":[\"Family with infant/toddler\"]},{\"questionId\":15,\"selectedOptions\":[\"200,000 to 400,000 EGP\"]},{\"questionId\":16,\"selectedOptions\":[\"Social media (YouTube, Instagram, TikTok)\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-24 18:38:38','2025-12-24 18:38:38','2025-12-24 18:38:38'),(40,60,2442,'approved','{\"answers\":[{\"questionId\":1,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":2,\"selectedOptions\":[\"5\"]},{\"questionId\":3,\"selectedOptions\":[\"Samsung\"]},{\"questionId\":4,\"selectedOptions\":[\"1\"]},{\"questionId\":5,\"selectedOptions\":[\"Starting school/Graduation\"]},{\"questionId\":6,\"selectedOptions\":[\"Holiday/celebration campaigns (Eid Al-Fitr, Eid Al-Adha)\"]},{\"questionId\":7,\"selectedOptions\":[\"Dishwasher\"]},{\"questionId\":8,\"selectedOptions\":[\"10,000 to 20,000 EGP\"]},{\"questionId\":9,\"selectedOptions\":[\"Physical store\"]},{\"questionId\":10,\"selectedOptions\":[\"Department store website/app\"]},{\"questionId\":11,\"selectedOptions\":[\"Different/convenient payment methods\"]},{\"questionId\":12,\"selectedOptions\":[\"Design and finish\"]},{\"questionId\":13,\"selectedOptions\":[\"Free or discounted repair cost insurance (Samsung CarePlus)\"]},{\"questionId\":14,\"selectedOptions\":[\"Two-person household\"]},{\"questionId\":15,\"selectedOptions\":[\"100,000 to 200,000 EGP\"]},{\"questionId\":16,\"selectedOptions\":[\"TV programs\"]}]}',100,NULL,16,16,NULL,NULL,NULL,NULL,NULL,NULL,30.00,1,NULL,'2025-12-28 02:58:28','2025-12-28 02:58:28','2025-12-28 02:58:28'),(41,31,2471,'approved','{\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,61,3,3,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2025-12-28 05:55:40','2025-12-28 05:55:40','2025-12-28 05:55:40'),(42,60,2540,'rejected','{\"answers\":[],\"passed\":false,\"watchTimePassed\":true}',0,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'2026-01-09 01:56:54','2026-01-09 01:56:54',NULL),(43,63,2597,'rejected','{\"answers\":[],\"passed\":false,\"watchTimePassed\":true}',0,159,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'2026-01-09 04:02:50','2026-01-09 04:02:50',NULL),(44,124,1401,'approved','{\"answers\":[{\"questionId\":81,\"selectedOptions\":[\"Chevrolet\"]},{\"questionId\":82,\"selectedOptions\":[\"4\"]},{\"questionId\":83,\"selectedOptions\":[\"Good\"]},{\"questionId\":84,\"selectedOptions\":[\"Yes\"]}]}',100,NULL,4,4,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2026-01-09 05:00:38','2026-01-09 05:00:38','2026-01-09 05:00:38'),(45,128,1401,'approved','{\"answers\":[{\"questionId\":245,\"questionText\":\"Which car brands does Mansour sell?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":246,\"questionText\":\"What is Mansour Group?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":247,\"questionText\":\"What is Metro Market?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":248,\"questionText\":\"Which fast food does Mansour operate in Egypt?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,NULL,4,4,NULL,NULL,NULL,NULL,NULL,NULL,22.00,1,NULL,'2026-01-09 05:05:57','2026-01-09 05:05:57','2026-01-09 05:05:57'),(46,139,2759,'approved','{\"answers\":[{\"questionId\":101,\"selectedOptions\":[\"All\"]},{\"questionId\":102,\"selectedOptions\":[\"Monthly\"]},{\"questionId\":103,\"selectedOptions\":[\"5\"]},{\"questionId\":104,\"selectedOptions\":[\"Yes\"]}]}',100,NULL,4,4,NULL,NULL,NULL,NULL,NULL,NULL,15.00,1,NULL,'2026-01-09 05:22:35','2026-01-09 05:22:35','2026-01-09 05:22:35'),(47,124,2892,'approved','{\"answers\":[{\"questionId\":81,\"selectedOptions\":[\"Chevrolet\"]},{\"questionId\":82,\"selectedOptions\":[\"5\"]},{\"questionId\":83,\"selectedOptions\":[\"Excellent\"]},{\"questionId\":84,\"selectedOptions\":[\"Yes\"]}]}',100,NULL,4,4,NULL,NULL,NULL,NULL,NULL,NULL,25.00,1,NULL,'2026-01-09 06:34:42','2026-01-09 06:34:42','2026-01-09 06:34:42'),(48,128,2892,'approved','{\"answers\":[{\"questionId\":245,\"questionText\":\"Which car brands does Mansour sell?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":246,\"questionText\":\"What is Mansour Group?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":247,\"questionText\":\"What is Metro Market?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":248,\"questionText\":\"Which fast food does Mansour operate in Egypt?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true}],\"passed\":true,\"watchTimePassed\":true}',100,NULL,4,4,NULL,NULL,NULL,NULL,NULL,NULL,22.00,1,NULL,'2026-01-09 06:37:59','2026-01-09 06:37:59','2026-01-09 06:37:59');
/*!40000 ALTER TABLE `task_submissions` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=144 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (31,1,'video','Watch Samsung Galaxy Z Fold7 Launch Video','شاهد فيديو إطلاق Samsung Galaxy Z Fold7','Watch the official launch video for the new Samsung Galaxy Z Fold7 and answer questions','شاهد فيديو الإطلاق الرسمي لـ Samsung Galaxy Z Fold7 الجديد وأجب على الأسئلة',25.00,10000.00,400,14,1000.00,'easy',1,'active',NULL,NULL,NULL,NULL,'[\"tier1\",\"tier2\",\"tier3\"]',0,0,NULL,'quiz',80,80,'{\"duration\": 36, \"videoUrl\": \"/videos/UltraUnfolds_GalaxyZFold7_Samsung.webm\", \"imageUrl\": \"/logos/samsung.png\"}','2025-11-10 13:15:55','2025-12-28 05:55:40','2025-11-10 13:15:55',NULL,NULL,0),(60,1,'survey','Samsung Customer Experience Survey','استبيان تجربة عملاء سامسونج','Share your opinions about Samsung products and services to help improve your overall experience. This survey takes approximately 5 minutes to complete.','شاركنا آراءك حول منتجات وخدمات سامسونج للمساعدة في تحسين تجربتك الشاملة. يستغرق هذا الاستبيان حوالي 5 دقائق لإكماله.',30.00,3000.00,100,6,500.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"imageUrl\": \"/logos/samsung.png\", \"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"ما مدى رضاك عن منتجات سامسونج بشكل عام؟\", \"questionEn\": \"How satisfied are you with Samsung products overall?\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Smartphones\", \"TVs\", \"Home Appliances\", \"Wearables\", \"Tablets\"], \"optionsAr\": [\"الهواتف الذكية\", \"التلفزيونات\", \"الأجهزة المنزلية\", \"الأجهزة القابلة للارتداء\", \"الأجهزة اللوحية\"], \"questionAr\": \"ما فئة منتجات سامسونج التي تستخدمها أكثر؟\", \"questionEn\": \"Which Samsung product category do you use most?\"}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Social Media\", \"TV Ads\", \"Friends/Family\", \"Store Visit\", \"Online Search\"], \"optionsAr\": [\"وسائل التواصل الاجتماعي\", \"إعلانات التلفزيون\", \"الأصدقاء/العائلة\", \"زيارة المتجر\", \"البحث عبر الإنترنت\"], \"questionAr\": \"كيف سمعت عن سامسونج مصر؟\", \"questionEn\": \"How did you hear about Samsung Egypt?\"}, {\"id\": 4, \"type\": \"text\", \"questionAr\": \"ما التحسينات التي تقترحها لمنتجات سامسونج؟\", \"questionEn\": \"What improvements would you suggest for Samsung products?\"}], \"surveyType\": \"customer_experience\", \"estimatedTime\": 5, \"totalQuestions\": 16}','2025-12-17 13:50:39','2026-01-09 04:17:05',NULL,NULL,NULL,0),(61,1,'video','Galaxy S25 Ultra Unboxing Experience','تجربة فتح صندوق Galaxy S25 Ultra','Watch the official Samsung Galaxy S25 Ultra unboxing video and answer questions about its features including the new AI capabilities and S Pen enhancements.','شاهد فيديو فتح صندوق Samsung Galaxy S25 Ultra الرسمي وأجب على أسئلة حول ميزاته بما في ذلك قدرات الذكاء الاصطناعي الجديدة وتحسينات قلم S Pen.',15.00,7500.00,500,0,1500.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"Galaxy AI\", \"Bixby Vision\", \"Smart Capture\", \"AR Zone\"], \"optionsAr\": [\"Galaxy AI\", \"Bixby Vision\", \"Smart Capture\", \"AR Zone\"], \"questionAr\": \"ما هي ميزة الذكاء الاصطناعي الرئيسية المميزة في Galaxy S25 Ultra؟\", \"questionEn\": \"What is the main AI feature highlighted in the Galaxy S25 Ultra?\", \"correctAnswer\": 0}, {\"id\": 2, \"options\": [\"6.2 inches\", \"6.7 inches\", \"6.9 inches\", \"7.1 inches\"], \"optionsAr\": [\"6.2 بوصة\", \"6.7 بوصة\", \"6.9 بوصة\", \"7.1 بوصة\"], \"questionAr\": \"ما هو حجم شاشة Galaxy S25 Ultra؟\", \"questionEn\": \"What is the screen size of the Galaxy S25 Ultra?\", \"correctAnswer\": 2}], \"videoDuration\": 180}','2026-01-09 03:33:02','2026-01-09 04:37:21',NULL,NULL,NULL,0),(62,1,'video','Samsung Neo QLED 8K TV Features','ميزات تلفزيون Samsung Neo QLED 8K','Discover the revolutionary Samsung Neo QLED 8K TV with AI upscaling technology. Watch the product showcase and learn about its smart features.','اكتشف تلفزيون Samsung Neo QLED 8K الثوري مع تقنية الذكاء الاصطناعي للتحسين. شاهد عرض المنتج وتعرف على ميزاته الذكية.',12.00,4800.00,400,0,960.00,'easy',4,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"Mini LED\", \"OLED\", \"Plasma\", \"LCD\"], \"optionsAr\": [\"Mini LED\", \"OLED\", \"بلازما\", \"LCD\"], \"questionAr\": \"ما التقنية التي يستخدمها Samsung Neo QLED لجودة صورة أفضل؟\", \"questionEn\": \"What technology does Samsung Neo QLED use for better picture quality?\", \"correctAnswer\": 0}], \"videoDuration\": 150}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(63,1,'video','Galaxy Buds 3 Pro Audio Experience','تجربة صوت Galaxy Buds 3 Pro','Experience the premium sound quality of Samsung Galaxy Buds 3 Pro with 360 Audio and Active Noise Cancellation features.','استمتع بجودة الصوت الفائقة من Samsung Galaxy Buds 3 Pro مع ميزات الصوت 360 وإلغاء الضوضاء النشط.',10.00,6000.00,600,0,1200.00,'easy',3,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"360 Audio\", \"Mono Sound\", \"Bass Boost Only\", \"No ANC\"], \"optionsAr\": [\"صوت 360\", \"صوت أحادي\", \"تعزيز الباس فقط\", \"بدون ANC\"], \"questionAr\": \"ما هي ميزة الصوت الرئيسية في Galaxy Buds 3 Pro؟\", \"questionEn\": \"What is the main audio feature of Galaxy Buds 3 Pro?\", \"correctAnswer\": 0}], \"videoDuration\": 120}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(64,1,'survey','Samsung Customer Experience Survey 2026','استبيان تجربة عملاء Samsung 2026','Share your experience with Samsung products and services. Your feedback helps us improve our offerings in Egypt.','شارك تجربتك مع منتجات وخدمات Samsung. ملاحظاتك تساعدنا على تحسين عروضنا في مصر.',20.00,20000.00,1000,0,4000.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"questionEn\": \"How satisfied are you with Samsung products?\", \"questionAr\": \"ما مدى رضاك عن منتجات Samsung؟\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"]}, {\"id\": 2, \"type\": \"multiple_choice\", \"questionEn\": \"Which Samsung product do you own?\", \"questionAr\": \"ما منتج Samsung الذي تملكه؟\", \"options\": [\"Smartphone\", \"TV\", \"Tablet\", \"Wearable\", \"Home Appliance\"], \"optionsAr\": [\"هاتف ذكي\", \"تلفزيون\", \"تابلت\", \"جهاز قابل للارتداء\", \"أجهزة منزلية\"]}, {\"id\": 3, \"type\": \"text\", \"questionEn\": \"What feature would you like to see in future Samsung products?\", \"questionAr\": \"ما الميزة التي تود رؤيتها في منتجات Samsung المستقبلية؟\"}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(65,1,'survey','Galaxy AI Features Feedback','ملاحظات حول ميزات Galaxy AI','Help Samsung understand how users interact with Galaxy AI features. Share your thoughts on AI-powered photography, translation, and productivity tools.','ساعد Samsung على فهم كيفية تفاعل المستخدمين مع ميزات Galaxy AI. شارك أفكارك حول التصوير والترجمة وأدوات الإنتاجية المدعومة بالذكاء الاصطناعي.',25.00,12500.00,500,0,2500.00,'medium',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"questionEn\": \"Which Galaxy AI feature do you use most?\", \"questionAr\": \"ما ميزة Galaxy AI التي تستخدمها أكثر؟\", \"options\": [\"Photo Editing\", \"Live Translate\", \"Circle to Search\", \"Note Assist\", \"None\"], \"optionsAr\": [\"تحرير الصور\", \"الترجمة الفورية\", \"البحث بالدائرة\", \"مساعد الملاحظات\", \"لا شيء\"]}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(66,1,'survey','Samsung Service Center Experience','تجربة مركز خدمة Samsung','Rate your experience with Samsung authorized service centers in Egypt. Help us improve our after-sales support.','قيم تجربتك مع مراكز خدمة Samsung المعتمدة في مصر. ساعدنا على تحسين دعم ما بعد البيع.',18.00,14400.00,800,0,2880.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تجربتك في مركز خدمة سامسونج\", \"questionEn\": \"Rate your experience at Samsung Service Center\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Phone Repair\", \"TV Repair\", \"Warranty Claim\", \"Software Update\", \"Other\"], \"optionsAr\": [\"إصلاح الهاتف\", \"إصلاح التلفزيون\", \"مطالبة الضمان\", \"تحديث البرنامج\", \"أخرى\"], \"questionAr\": \"ما الخدمة التي حصلت عليها؟\", \"questionEn\": \"What service did you receive?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"كيف تقيم مساعدة الموظفين؟\", \"questionEn\": \"How would you rate the staff helpfulness?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(67,1,'app','Samsung Members App Registration','تسجيل تطبيق Samsung Members','Download and register on Samsung Members app to access exclusive benefits, device diagnostics, and special offers for Samsung users in Egypt.','حمل وسجل في تطبيق Samsung Members للوصول إلى مزايا حصرية وتشخيصات الجهاز وعروض خاصة لمستخدمي Samsung في مصر.',25.00,25000.00,1000,0,5000.00,'easy',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل Samsung Members من App Store أو Google Play\", \"instructionEn\": \"Download Samsung Members from App Store or Google Play\"}, {\"id\": 2, \"instructionAr\": \"أنشئ حساباً أو سجل الدخول بحساب Samsung\", \"instructionEn\": \"Create an account or sign in with Samsung Account\"}, {\"id\": 3, \"instructionAr\": \"أكمل إعداد ملفك الشخصي\", \"instructionEn\": \"Complete your profile setup\"}], \"iosUrl\": \"https://apps.apple.com/app/samsung-members/id1199498523\", \"appName\": \"Samsung Members\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.samsung.android.voc\", \"packageName\": \"com.samsung.android.voc\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Benefits\", \"Support\", \"Community\", \"Shop\"], \"optionsAr\": [\"المزايا\", \"الدعم\", \"المجتمع\", \"التسوق\"], \"questionAr\": \"ما هو عنصر القائمة الأول في تطبيق Samsung Members؟\", \"questionEn\": \"What is the first menu item in Samsung Members app?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(68,1,'app','Samsung Shop App First Purchase','أول عملية شراء من تطبيق Samsung Shop','Download Samsung Shop app and explore the latest products. Complete your profile to receive personalized recommendations.','حمل تطبيق Samsung Shop واستكشف أحدث المنتجات. أكمل ملفك الشخصي لتلقي توصيات مخصصة.',30.00,15000.00,500,0,3000.00,'medium',15,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق Samsung Shop\", \"instructionEn\": \"Download Samsung Shop app\"}, {\"id\": 2, \"instructionAr\": \"تصفح سلسلة Galaxy S25\", \"instructionEn\": \"Browse the Galaxy S25 series\"}], \"appName\": \"Samsung Shop\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.samsung.ecomm\", \"packageName\": \"com.samsung.ecomm\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Credit Card & Cash on Delivery\", \"Bitcoin Only\", \"Bank Transfer Only\", \"PayPal Only\"], \"optionsAr\": [\"بطاقة ائتمان والدفع عند الاستلام\", \"بيتكوين فقط\", \"تحويل بنكي فقط\", \"PayPal فقط\"], \"questionAr\": \"ما طرق الدفع المتاحة في Samsung Shop مصر؟\", \"questionEn\": \"What payment methods are available in Samsung Shop Egypt?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(69,1,'app','SmartThings Home Setup','إعداد SmartThings للمنزل','Download SmartThings app and explore how to connect and control your Samsung smart home devices.','حمل تطبيق SmartThings واستكشف كيفية توصيل والتحكم في أجهزة Samsung الذكية المنزلية.',22.00,8800.00,400,0,1760.00,'medium',12,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق SmartThings\", \"instructionEn\": \"Download SmartThings app\"}, {\"id\": 2, \"instructionAr\": \"استكشف فئات الأجهزة\", \"instructionEn\": \"Explore the device categories\"}], \"appName\": \"SmartThings\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.samsung.android.oneconnect\", \"packageName\": \"com.samsung.android.oneconnect\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"TVs, ACs, Washers, Lights\", \"Only TVs\", \"Only Phones\", \"Only Tablets\"], \"optionsAr\": [\"التلفزيونات، المكيفات، الغسالات، الإضاءة\", \"التلفزيونات فقط\", \"الهواتف فقط\", \"التابلت فقط\"], \"questionAr\": \"ما الأجهزة التي يمكن لـ SmartThings التحكم فيها؟\", \"questionEn\": \"Which devices can SmartThings control?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(70,1,'quiz','Galaxy S25 Features Quiz','اختبار ميزات Galaxy S25','Test your knowledge about the Samsung Galaxy S25 series features and win rewards!','اختبر معلوماتك حول ميزات سلسلة Samsung Galaxy S25 واربح مكافآت!',20.00,16000.00,800,0,3200.00,'medium',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"6.2 inches\", \"6.7 inches\", \"6.9 inches\", \"7.1 inches\"], \"optionsAr\": [\"6.2 بوصة\", \"6.7 بوصة\", \"6.9 بوصة\", \"7.1 بوصة\"], \"questionAr\": \"ما حجم شاشة Galaxy S25 Ultra؟\", \"questionEn\": \"What is the display size of Galaxy S25 Ultra?\", \"correctAnswer\": 2}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Exynos 2400\", \"Snapdragon 8 Gen 3\", \"Snapdragon 8 Elite\", \"MediaTek Dimensity\"], \"optionsAr\": [\"Exynos 2400\", \"Snapdragon 8 Gen 3\", \"Snapdragon 8 Elite\", \"MediaTek Dimensity\"], \"questionAr\": \"ما المعالج الذي يشغل سلسلة Galaxy S25؟\", \"questionEn\": \"Which processor powers the Galaxy S25 series?\", \"correctAnswer\": 2}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Bixby\", \"Galaxy AI\", \"Google Assistant\", \"Siri\"], \"optionsAr\": [\"بيكسبي\", \"Galaxy AI\", \"مساعد جوجل\", \"سيري\"], \"questionAr\": \"ما ميزة الذكاء الاصطناعي الجديدة في Galaxy S25؟\", \"questionEn\": \"What AI feature is new in Galaxy S25?\", \"correctAnswer\": 1}, {\"id\": 4, \"type\": \"multiple_choice\", \"options\": [\"108 MP\", \"200 MP\", \"50 MP\", \"64 MP\"], \"optionsAr\": [\"108 ميجابكسل\", \"200 ميجابكسل\", \"50 ميجابكسل\", \"64 ميجابكسل\"], \"questionAr\": \"ما دقة الكاميرا الرئيسية في S25 Ultra؟\", \"questionEn\": \"What is the main camera resolution of S25 Ultra?\", \"correctAnswer\": 1}], \"timeLimit\": 300, \"passingScore\": 70}','2026-01-09 03:33:02','2026-01-09 04:19:50',NULL,NULL,NULL,0),(71,1,'quiz','Samsung Innovation History Quiz','اختبار تاريخ ابتكارات Samsung','How well do you know Samsung history and innovations? Take this quiz to find out!','ما مدى معرفتك بتاريخ Samsung وابتكاراتها؟ خذ هذا الاختبار لتكتشف!',30.00,9000.00,300,0,1800.00,'hard',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"1938\", \"1950\", \"1969\", \"1975\"], \"optionsAr\": [\"1938\", \"1950\", \"1969\", \"1975\"], \"questionAr\": \"متى تأسست سامسونج؟\", \"questionEn\": \"When was Samsung founded?\", \"correctAnswer\": 0}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Galaxy S\", \"Galaxy Note\", \"Galaxy A\", \"Galaxy J\"], \"optionsAr\": [\"Galaxy S\", \"Galaxy Note\", \"Galaxy A\", \"Galaxy J\"], \"questionAr\": \"ما أول سلسلة هواتف ذكية من سامسونج؟\", \"questionEn\": \"Which was Samsung first smartphone series?\", \"correctAnswer\": 0}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Big Star\", \"Three Stars\", \"Bright Future\", \"Technology\"], \"optionsAr\": [\"نجمة كبيرة\", \"ثلاث نجوم\", \"مستقبل مشرق\", \"تكنولوجيا\"], \"questionAr\": \"ماذا تعني سامسونج بالكورية؟\", \"questionEn\": \"What does Samsung mean in Korean?\", \"correctAnswer\": 1}], \"timeLimit\": 420, \"passingScore\": 80}','2026-01-09 03:33:02','2026-01-09 04:19:50',NULL,NULL,NULL,0),(72,1,'social','Follow Samsung Egypt Social Media','تابع Samsung Egypt على وسائل التواصل','Follow Samsung Egypt official social media accounts and stay updated with the latest products and offers.','تابع حسابات Samsung Egypt الرسمية على وسائل التواصل الاجتماعي وابق على اطلاع بأحدث المنتجات والعروض.',15.00,30000.00,2000,0,6000.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/SamsungEgypt\", \"descriptionEn\": \"Follow Samsung Egypt on Facebook\", \"descriptionAr\": \"تابع Samsung Egypt على فيسبوك\"}, {\"id\": 2, \"type\": \"follow\", \"platform\": \"instagram\", \"url\": \"https://www.instagram.com/samsungegypt\", \"descriptionEn\": \"Follow Samsung Egypt on Instagram\", \"descriptionAr\": \"تابع Samsung Egypt على انستغرام\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is the Samsung Egypt Facebook page cover photo about?\", \"questionAr\": \"ما موضوع صورة غلاف صفحة Samsung Egypt على فيسبوك؟\", \"options\": [\"Galaxy S25\", \"Galaxy Z Fold\", \"Neo QLED TV\", \"Galaxy Watch\"], \"optionsAr\": [\"Galaxy S25\", \"Galaxy Z Fold\", \"Neo QLED TV\", \"Galaxy Watch\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(73,1,'social','Share Galaxy S25 Launch Post','شارك منشور إطلاق Galaxy S25','Share the official Galaxy S25 launch announcement on your social media and help spread the word!','شارك إعلان إطلاق Galaxy S25 الرسمي على وسائل التواصل الاجتماعي الخاصة بك وساعد في نشر الخبر!',18.00,27000.00,1500,0,5400.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"share\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/SamsungEgypt/posts/galaxy_s25_launch\", \"descriptionEn\": \"Share the Galaxy S25 launch post\", \"descriptionAr\": \"شارك منشور إطلاق Galaxy S25\"}], \"proofRequired\": true, \"proofType\": \"link\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What hashtag is used in the Galaxy S25 launch post?\", \"questionAr\": \"ما الهاشتاج المستخدم في منشور إطلاق Galaxy S25؟\", \"options\": [\"#GalaxyS25\", \"#Samsung2026\", \"#NewPhone\", \"#TechLaunch\"], \"optionsAr\": [\"#GalaxyS25\", \"#Samsung2026\", \"#NewPhone\", \"#TechLaunch\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(74,1,'visit','Visit Samsung Experience Store Cairo','زيارة متجر Samsung Experience القاهرة','Visit the Samsung Experience Store at City Stars Mall and explore the latest Galaxy products hands-on.','قم بزيارة متجر Samsung Experience في سيتي ستارز مول واستكشف أحدث منتجات Galaxy بنفسك.',50.00,10000.00,200,0,2000.00,'medium',30,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"قم بزيارة متجر سامسونج إكسبيرينس في سيتي ستارز\", \"instructionEn\": \"Visit Samsung Experience Store at City Stars\"}, {\"id\": 2, \"instructionAr\": \"التقط صورة مع شاشة عرض Galaxy S25\", \"instructionEn\": \"Take a photo with the Galaxy S25 display\"}, {\"id\": 3, \"instructionAr\": \"احصل على ختم المتجر أو إيصال\", \"instructionEn\": \"Get a store stamp or receipt\"}], \"location\": {\"lat\": 30.0726, \"lng\": 31.3456, \"nameAr\": \"سامسونج إكسبيرينس ستور - سيتي ستارز\", \"nameEn\": \"Samsung Experience Store - City Stars\", \"address\": \"City Stars Mall, Heliopolis, Cairo\"}, \"locations\": [{\"id\": 1, \"nameAr\": \"متجر Samsung Experience - سيتي ستارز\", \"nameEn\": \"Samsung Experience Store - City Stars\", \"radius\": 100, \"address\": \"City Stars Mall, Nasr City, Cairo\", \"latitude\": 30.0731, \"addressAr\": \"سيتي ستارز مول، مدينة نصر، القاهرة\", \"longitude\": 31.3456}], \"requirePhoto\": true, \"requirements\": [\"Valid ID\", \"Smartphone with camera\", \"GPS enabled\"], \"requireGeolocation\": true, \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Galaxy S25 Display\", \"TV Section\", \"Accessories Wall\", \"Service Desk\"], \"optionsAr\": [\"عرض Galaxy S25\", \"قسم التلفزيونات\", \"جدار الإكسسوارات\", \"مكتب الخدمة\"], \"questionAr\": \"ما المعروض عند مدخل متجر Samsung؟\", \"questionEn\": \"What is displayed at the entrance of the Samsung store?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(75,1,'visit','Samsung Authorized Dealer Visit','زيارة موزع Samsung المعتمد','Visit any Samsung authorized dealer in Egypt and get information about the latest offers and trade-in programs.','قم بزيارة أي موزع Samsung معتمد في مصر واحصل على معلومات حول أحدث العروض وبرامج الاستبدال.',35.00,17500.00,500,0,3500.00,'easy',20,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"قم بزيارة أي موزع سامسونج معتمد\", \"instructionEn\": \"Visit any Samsung authorized dealer\"}, {\"id\": 2, \"instructionAr\": \"اسأل عن عروض Galaxy S25\", \"instructionEn\": \"Ask about Galaxy S25 offers\"}, {\"id\": 3, \"instructionAr\": \"التقط صورة لواجهة المتجر\", \"instructionEn\": \"Take a photo of the store front\"}], \"location\": {\"lat\": 30.0444, \"lng\": 31.2357, \"nameAr\": \"موزع سامسونج المعتمد\", \"nameEn\": \"Samsung Authorized Dealer\", \"address\": \"Multiple locations across Egypt\"}, \"locations\": [{\"id\": 1, \"nameAr\": \"بي تك - المعادي\", \"nameEn\": \"B.TECH - Maadi\", \"radius\": 150, \"address\": \"Maadi Grand Mall, Cairo\", \"latitude\": 29.9602, \"addressAr\": \"المعادي جراند مول، القاهرة\", \"longitude\": 31.2569}, {\"id\": 2, \"nameAr\": \"راية شوب - مصر الجديدة\", \"nameEn\": \"Raya Shop - Heliopolis\", \"radius\": 150, \"address\": \"Heliopolis, Cairo\", \"latitude\": 30.0866, \"addressAr\": \"مصر الجديدة، القاهرة\", \"longitude\": 31.3417}], \"requirePhoto\": false, \"requirements\": [\"Valid ID\", \"Smartphone with camera\", \"GPS enabled\"], \"requireGeolocation\": true, \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Up to 5000 EGP off\", \"Free accessories\", \"Extended warranty\", \"No offers\"], \"optionsAr\": [\"خصم حتى 5000 جنيه\", \"إكسسوارات مجانية\", \"ضمان ممتد\", \"لا توجد عروض\"], \"questionAr\": \"ما عرض الاستبدال المتاح حالياً؟\", \"questionEn\": \"What trade-in offer is currently available?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(76,2,'video','Vodafone RED AFCON 2025 Offer','عرض Vodafone RED لأمم أفريقيا 2025','Watch the Vodafone RED exclusive AFCON 2025 offer video featuring free TOD access for all matches.','شاهد فيديو عرض Vodafone RED الحصري لأمم أفريقيا 2025 مع وصول مجاني لـ TOD لجميع المباريات.',12.00,9600.00,800,0,1920.00,'easy',4,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"TOD\", \"Netflix\", \"Shahid\", \"OSN\"], \"optionsAr\": [\"TOD\", \"Netflix\", \"شاهد\", \"OSN\"], \"questionAr\": \"ما خدمة البث المجانية المضمنة مع Vodafone RED؟\", \"questionEn\": \"What streaming service is included free with Vodafone RED?\", \"correctAnswer\": 0}], \"videoDuration\": 120}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(77,2,'video','Vodafone Cash Digital Wallet','محفظة Vodafone Cash الرقمية','Learn how to use Vodafone Cash for payments, transfers, and bill payments in Egypt.','تعلم كيفية استخدام Vodafone Cash للمدفوعات والتحويلات ودفع الفواتير في مصر.',15.00,15000.00,1000,0,3000.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"30,000 EGP\", \"10,000 EGP\", \"50,000 EGP\", \"5,000 EGP\"], \"optionsAr\": [\"30,000 جنيه\", \"10,000 جنيه\", \"50,000 جنيه\", \"5,000 جنيه\"], \"questionAr\": \"ما الحد الأقصى للتحويل في Vodafone Cash؟\", \"questionEn\": \"What is the maximum transfer limit for Vodafone Cash?\", \"correctAnswer\": 0}], \"videoDuration\": 180}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(78,2,'survey','Vodafone Network Experience Survey','استبيان تجربة شبكة Vodafone','Share your experience with Vodafone network coverage and speed. Help us improve our services across Egypt.','شارك تجربتك مع تغطية وسرعة شبكة Vodafone. ساعدنا على تحسين خدماتنا في جميع أنحاء مصر.',18.00,27000.00,1500,0,5400.00,'easy',7,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تغطية شبكة فودافون في منطقتك\", \"questionEn\": \"Rate Vodafone network coverage in your area\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Prepaid\", \"RED Postpaid\", \"Flex\", \"Business\", \"Other\"], \"optionsAr\": [\"مسبق الدفع\", \"RED آجل الدفع\", \"فليكس\", \"أعمال\", \"أخرى\"], \"questionAr\": \"ما هي باقتك الحالية في فودافون؟\", \"questionEn\": \"What is your current Vodafone plan?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم رضاك عن سرعة الإنترنت\", \"questionEn\": \"Rate your internet speed satisfaction\"}, {\"id\": 4, \"type\": \"text\", \"questionAr\": \"أي اقتراحات لتحسين خدمات فودافون؟\", \"questionEn\": \"Any suggestions to improve Vodafone services?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(79,2,'survey','Vodafone Business Solutions Feedback','ملاحظات حلول Vodafone للأعمال','If you use Vodafone Business solutions, share your feedback on our enterprise services.','إذا كنت تستخدم حلول Vodafone للأعمال، شارك ملاحظاتك حول خدماتنا للمؤسسات.',25.00,7500.00,300,0,1500.00,'medium',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Business Internet\", \"Corporate Lines\", \"Cloud Services\", \"IoT Solutions\", \"Multiple\"], \"optionsAr\": [\"إنترنت الأعمال\", \"خطوط الشركات\", \"خدمات السحابة\", \"حلول إنترنت الأشياء\", \"متعددة\"], \"questionAr\": \"ما حل فودافون للأعمال الذي تستخدمه؟\", \"questionEn\": \"Which Vodafone Business solution do you use?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم القيمة مقابل المال لفودافون للأعمال\", \"questionEn\": \"Rate the value for money of Vodafone Business\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم جودة دعم العملاء\", \"questionEn\": \"Rate the customer support quality\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(80,2,'app','Ana Vodafone App Registration','تسجيل تطبيق أنا ڤودافون','Download Ana Vodafone app and manage your account, check balance, and access exclusive offers.','حمل تطبيق أنا ڤودافون وأدر حسابك، تحقق من رصيدك، واحصل على عروض حصرية.',20.00,40000.00,2000,0,8000.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق أنا ڤودافون\", \"instructionEn\": \"Download Ana Vodafone app\"}, {\"id\": 2, \"instructionAr\": \"سجل برقم Vodafone الخاص بك\", \"instructionEn\": \"Register with your Vodafone number\"}], \"appName\": \"Ana Vodafone\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.vodafone.ecare\", \"packageName\": \"com.vodafone.ecare\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Check balance & recharge\", \"Order food\", \"Book flights\", \"Watch movies\"], \"optionsAr\": [\"تحقق من الرصيد والشحن\", \"طلب طعام\", \"حجز رحلات\", \"مشاهدة أفلام\"], \"questionAr\": \"ما الذي يمكنك فعله في تطبيق أنا ڤودافون؟\", \"questionEn\": \"What can you do in Ana Vodafone app?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(81,2,'app','Vodafone Cash App Setup','إعداد تطبيق Vodafone Cash','Set up Vodafone Cash on your phone and learn how to send money, pay bills, and shop online.','أعد Vodafone Cash على هاتفك وتعلم كيفية إرسال الأموال ودفع الفواتير والتسوق عبر الإنترنت.',28.00,28000.00,1000,0,5600.00,'medium',12,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق Vodafone Cash\", \"instructionEn\": \"Download Vodafone Cash app\"}, {\"id\": 2, \"instructionAr\": \"أكمل التحقق من الهوية\", \"instructionEn\": \"Complete KYC verification\"}], \"appName\": \"Vodafone Cash\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.vodafone.cash\", \"packageName\": \"com.vodafone.cash\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"National ID\", \"Passport only\", \"Driver license only\", \"No documents\"], \"optionsAr\": [\"البطاقة الشخصية\", \"جواز السفر فقط\", \"رخصة القيادة فقط\", \"لا مستندات\"], \"questionAr\": \"ما المستندات المطلوبة لتسجيل Vodafone Cash؟\", \"questionEn\": \"What documents are needed for Vodafone Cash registration?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(82,2,'quiz','Vodafone Egypt Knowledge Quiz','اختبار معلومات Vodafone مصر','Test your knowledge about Vodafone Egypt services and history!','اختبر معلوماتك حول خدمات وتاريخ Vodafone مصر!',22.00,13200.00,600,0,2640.00,'medium',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"1996\", \"1998\", \"2000\", \"2002\"], \"optionsAr\": [\"1996\", \"1998\", \"2000\", \"2002\"], \"questionAr\": \"متى انطلقت فودافون في مصر؟\", \"questionEn\": \"When did Vodafone launch in Egypt?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Vodafone Pay\", \"Vodafone Cash\", \"Vodafone Money\", \"Vodafone Wallet\"], \"optionsAr\": [\"فودافون باي\", \"فودافون كاش\", \"فودافون موني\", \"فودافون واليت\"], \"questionAr\": \"ما اسم المحفظة الرقمية لفودافون؟\", \"questionEn\": \"What is Vodafone digital wallet called?\", \"correctAnswer\": 1}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Vodafone Gold\", \"Vodafone RED\", \"Vodafone Plus\", \"Vodafone Prime\"], \"optionsAr\": [\"فودافون جولد\", \"فودافون ريد\", \"فودافون بلس\", \"فودافون برايم\"], \"questionAr\": \"ما اسم باقة فودافون المميزة؟\", \"questionEn\": \"What is Vodafone premium plan called?\", \"correctAnswer\": 1}, {\"id\": 4, \"type\": \"multiple_choice\", \"options\": [\"Blue\", \"Green\", \"Red\", \"Orange\"], \"optionsAr\": [\"أزرق\", \"أخضر\", \"أحمر\", \"برتقالي\"], \"questionAr\": \"ما لون علامة فودافون التجارية؟\", \"questionEn\": \"What color is Vodafone brand?\", \"correctAnswer\": 2}], \"timeLimit\": 300, \"passingScore\": 70}','2026-01-09 03:33:02','2026-01-09 04:19:50',NULL,NULL,NULL,0),(83,2,'social','Follow Vodafone Egypt Social','تابع Vodafone Egypt على السوشيال','Follow Vodafone Egypt on social media for the latest offers and news.','تابع Vodafone Egypt على وسائل التواصل الاجتماعي لأحدث العروض والأخبار.',12.00,36000.00,3000,0,7200.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/VodafoneEgypt\", \"descriptionEn\": \"Follow Vodafone Egypt on Facebook\", \"descriptionAr\": \"تابع Vodafone Egypt على فيسبوك\"}, {\"id\": 2, \"type\": \"follow\", \"platform\": \"instagram\", \"url\": \"https://www.instagram.com/vodafoneegypt\", \"descriptionEn\": \"Follow Vodafone Egypt on Instagram\", \"descriptionAr\": \"تابع Vodafone Egypt على انستغرام\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is the current Vodafone Egypt campaign theme?\", \"questionAr\": \"ما موضوع حملة Vodafone Egypt الحالية؟\", \"options\": [\"AFCON 2025\", \"Summer Offers\", \"Back to School\", \"Ramadan\"], \"optionsAr\": [\"أمم أفريقيا 2025\", \"عروض الصيف\", \"العودة للمدارس\", \"رمضان\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(84,2,'visit','Visit Vodafone Store Cairo','زيارة متجر Vodafone القاهرة','Visit any Vodafone store in Cairo and explore the latest offers.','قم بزيارة أي متجر Vodafone في القاهرة واستكشف أحدث العروض.',30.00,12000.00,400,0,2400.00,'easy',20,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"قم بزيارة متجر فودافون في مول مصر\", \"instructionEn\": \"Visit Vodafone Store at Mall of Egypt\"}, {\"id\": 2, \"instructionAr\": \"استفسر عن باقات RED\", \"instructionEn\": \"Inquire about RED plans\"}, {\"id\": 3, \"instructionAr\": \"التقط سيلفي في المتجر\", \"instructionEn\": \"Take a selfie at the store\"}], \"location\": {\"lat\": 29.9722, \"lng\": 30.9753, \"nameAr\": \"متجر فودافون - مول مصر\", \"nameEn\": \"Vodafone Store - Mall of Egypt\", \"address\": \"Mall of Egypt, 6th of October City\"}, \"locations\": [{\"id\": 1, \"nameAr\": \"متجر Vodafone - سيتي ستارز\", \"nameEn\": \"Vodafone Store - City Stars\", \"radius\": 150, \"address\": \"City Stars Mall, Nasr City, Cairo\", \"latitude\": 30.0731, \"addressAr\": \"سيتي ستارز مول، مدينة نصر، القاهرة\", \"longitude\": 31.3456}], \"requirePhoto\": false, \"requirements\": [\"Valid ID\", \"Smartphone with camera\", \"GPS enabled\"], \"requireGeolocation\": true, \"verificationQuestions\": [{\"id\": 1, \"options\": [\"AFCON Bundle\", \"Summer Sale\", \"Back to School\", \"No promotion\"], \"optionsAr\": [\"باقة أمم أفريقيا\", \"تخفيضات الصيف\", \"العودة للمدارس\", \"لا عروض\"], \"questionAr\": \"ما العرض الحالي في متجر Vodafone؟\", \"questionEn\": \"What is the current promotion at Vodafone store?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(85,12,'video','Orange Mal3ab 012 AFCON Campaign','حملة Orange ملعب 012 لأمم أفريقيا','Watch the Orange Mal3ab 012 campaign video and learn how to collect the Golden Generation squad.','شاهد فيديو حملة Orange ملعب 012 وتعلم كيفية جمع فريق الجيل الذهبي.',14.00,14000.00,1000,0,2800.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"With every recharge\", \"By subscription\", \"Free download\", \"Purchase only\"], \"optionsAr\": [\"مع كل شحن\", \"بالاشتراك\", \"تحميل مجاني\", \"بالشراء فقط\"], \"questionAr\": \"كيف تجمع اللاعبين في ملعب 012؟\", \"questionEn\": \"How do you collect players in Mal3ab 012?\", \"correctAnswer\": 0}], \"videoDuration\": 150}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(86,12,'video','Orange 5G Network Launch','إطلاق شبكة Orange 5G','Discover Orange Egypt 5G network capabilities and coverage areas.','اكتشف قدرات شبكة Orange مصر 5G ومناطق التغطية.',12.00,9600.00,800,0,1920.00,'easy',4,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"Up to 1 Gbps\", \"100 Mbps\", \"50 Mbps\", \"10 Mbps\"], \"optionsAr\": [\"حتى 1 جيجابت\", \"100 ميجابت\", \"50 ميجابت\", \"10 ميجابت\"], \"questionAr\": \"ما السرعات التي يمكن أن تحققها Orange 5G؟\", \"questionEn\": \"What speeds can Orange 5G achieve?\", \"correctAnswer\": 0}], \"videoDuration\": 120}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(87,12,'survey','Orange Customer Satisfaction Survey','استبيان رضا عملاء Orange','Share your feedback about Orange Egypt services and help us serve you better.','شارك ملاحظاتك حول خدمات Orange مصر وساعدنا على خدمتك بشكل أفضل.',16.00,19200.00,1200,0,3840.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"الرضا العام عن أورانج مصر\", \"questionEn\": \"Overall satisfaction with Orange Egypt\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Mobile\", \"Home Internet\", \"Orange Money\", \"All\", \"Other\"], \"optionsAr\": [\"موبايل\", \"إنترنت منزلي\", \"أورانج موني\", \"الكل\", \"أخرى\"], \"questionAr\": \"ما خدمة أورانج التي تستخدمها؟\", \"questionEn\": \"Which Orange service do you use?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم جودة شبكة أورانج\", \"questionEn\": \"Rate Orange network quality\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(88,12,'survey','Orange PREMIER Experience Survey','استبيان تجربة Orange PREMIER','If you are an Orange PREMIER customer, share your VIP experience feedback.','إذا كنت عميل Orange PREMIER، شارك ملاحظاتك حول تجربة VIP.',30.00,6000.00,200,0,1200.00,'medium',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تجربتك مع أورانج بريميير\", \"questionEn\": \"Rate your Orange PREMIER experience\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Priority Support\", \"Exclusive Offers\", \"Lounge Access\", \"Extra Data\", \"All\"], \"optionsAr\": [\"دعم الأولوية\", \"عروض حصرية\", \"دخول الصالة\", \"بيانات إضافية\", \"الكل\"], \"questionAr\": \"ما ميزة بريميير التي تقدرها أكثر؟\", \"questionEn\": \"What PREMIER benefit do you value most?\"}, {\"id\": 3, \"type\": \"text\", \"questionAr\": \"كيف يمكن تحسين أورانج بريميير؟\", \"questionEn\": \"How can Orange PREMIER improve?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(89,12,'app','My Orange App Setup','إعداد تطبيق My Orange','Download My Orange app to manage your account, check consumption, and access exclusive offers.','حمل تطبيق My Orange لإدارة حسابك والتحقق من الاستهلاك والوصول إلى عروض حصرية.',18.00,27000.00,1500,0,5400.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق My Orange\", \"instructionEn\": \"Download My Orange app\"}, {\"id\": 2, \"instructionAr\": \"سجل الدخول برقم Orange الخاص بك\", \"instructionEn\": \"Login with your Orange number\"}], \"appName\": \"My Orange\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.orange.myorange.eg\", \"packageName\": \"com.orange.myorange.eg\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Balance & consumption\", \"Weather\", \"News\", \"Games\"], \"optionsAr\": [\"الرصيد والاستهلاك\", \"الطقس\", \"الأخبار\", \"الألعاب\"], \"questionAr\": \"ما الذي يمكنك التحقق منه في تطبيق My Orange؟\", \"questionEn\": \"What can you check in My Orange app?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(90,12,'app','Orange Money Registration','تسجيل Orange Money','Register for Orange Money and start sending money and paying bills digitally.','سجل في Orange Money وابدأ في إرسال الأموال ودفع الفواتير رقمياً.',25.00,20000.00,800,0,4000.00,'medium',12,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق Orange Money\", \"instructionEn\": \"Download Orange Money app\"}, {\"id\": 2, \"instructionAr\": \"أكمل التسجيل ببطاقتك الشخصية\", \"instructionEn\": \"Complete registration with your ID\"}], \"appName\": \"Orange Money\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.orange.money.eg\", \"packageName\": \"com.orange.money.eg\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"30,000 EGP\", \"5,000 EGP\", \"100,000 EGP\", \"1,000 EGP\"], \"optionsAr\": [\"30,000 جنيه\", \"5,000 جنيه\", \"100,000 جنيه\", \"1,000 جنيه\"], \"questionAr\": \"ما الحد اليومي للتحويل في Orange Money؟\", \"questionEn\": \"What is the daily transfer limit for Orange Money?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(91,12,'quiz','Orange Egypt Quiz Challenge','تحدي اختبار Orange مصر','Test your knowledge about Orange Egypt services and win!','اختبر معلوماتك حول خدمات Orange مصر واربح!',20.00,10000.00,500,0,2000.00,'medium',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Etisalat\", \"Mobinil\", \"Vodafone\", \"WE\"], \"optionsAr\": [\"اتصالات\", \"موبينيل\", \"فودافون\", \"وي\"], \"questionAr\": \"ما الاسم السابق لأورانج مصر؟\", \"questionEn\": \"What was Orange Egypt previously called?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Orange Pay\", \"Orange Cash\", \"Orange Money\", \"Orange Wallet\"], \"optionsAr\": [\"أورانج باي\", \"أورانج كاش\", \"أورانج موني\", \"أورانج واليت\"], \"questionAr\": \"ما خدمة الدفع الرقمي من أورانج؟\", \"questionEn\": \"What is Orange digital payment service?\", \"correctAnswer\": 2}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Orange VIP\", \"Orange PREMIER\", \"Orange Elite\", \"Orange Gold\"], \"optionsAr\": [\"أورانج VIP\", \"أورانج بريميير\", \"أورانج إيليت\", \"أورانج جولد\"], \"questionAr\": \"ما اسم برنامج أورانج المميز؟\", \"questionEn\": \"What is Orange premium program called?\", \"correctAnswer\": 1}], \"timeLimit\": 300, \"passingScore\": 70}','2026-01-09 03:33:02','2026-01-09 04:19:51',NULL,NULL,NULL,0),(92,12,'social','Follow Orange Egypt Social','تابع Orange Egypt على السوشيال','Follow Orange Egypt official social media accounts.','تابع حسابات Orange Egypt الرسمية على وسائل التواصل الاجتماعي.',10.00,25000.00,2500,0,5000.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/OrangeEgypt\", \"descriptionEn\": \"Follow Orange Egypt on Facebook\", \"descriptionAr\": \"تابع Orange Egypt على فيسبوك\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is the Orange Egypt slogan?\", \"questionAr\": \"ما شعار Orange مصر؟\", \"options\": [\"The Future is Orange\", \"Connect to Life\", \"Power to You\", \"Simply Closer\"], \"optionsAr\": [\"المستقبل برتقالي\", \"اتصل بالحياة\", \"القوة لك\", \"أقرب ببساطة\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(93,3,'video','Coca-Cola Share a Coke Campaign','حملة Coca-Cola شارك كوكاكولا','Watch the Share a Coke campaign video and learn about personalized Coca-Cola bottles in Egypt.','شاهد فيديو حملة شارك كوكاكولا وتعرف على زجاجات Coca-Cola المخصصة في مصر.',10.00,20000.00,2000,0,4000.00,'easy',3,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"Names\", \"Numbers\", \"Colors\", \"Logos\"], \"optionsAr\": [\"أسماء\", \"أرقام\", \"ألوان\", \"شعارات\"], \"questionAr\": \"ما الذي يمكنك إيجاده على زجاجات شارك كوكاكولا؟\", \"questionEn\": \"What can you find on Share a Coke bottles?\", \"correctAnswer\": 0}], \"videoDuration\": 90}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(94,3,'survey','Coca-Cola Taste Survey','استبيان طعم Coca-Cola','Share your preferences about Coca-Cola products available in Egypt.','شارك تفضيلاتك حول منتجات Coca-Cola المتوفرة في مصر.',15.00,22500.00,1500,0,4500.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Coca-Cola Original\", \"Coca-Cola Zero\", \"Coca-Cola Light\", \"Sprite\", \"Fanta\"], \"optionsAr\": [\"كوكاكولا الأصلية\", \"كوكاكولا زيرو\", \"كوكاكولا لايت\", \"سبرايت\", \"فانتا\"], \"questionAr\": \"ما منتج كوكاكولا الذي تفضله؟\", \"questionEn\": \"Which Coca-Cola product do you prefer?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم طعم كوكاكولا\", \"questionEn\": \"Rate the taste of Coca-Cola\"}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Daily\", \"Weekly\", \"Monthly\", \"Occasionally\", \"Rarely\"], \"optionsAr\": [\"يومياً\", \"أسبوعياً\", \"شهرياً\", \"أحياناً\", \"نادراً\"], \"questionAr\": \"كم مرة تشرب كوكاكولا؟\", \"questionEn\": \"How often do you drink Coca-Cola?\"}]}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(95,3,'quiz','Coca-Cola Egypt Quiz','اختبار Coca-Cola مصر','Test your knowledge about Coca-Cola history and products!','اختبر معلوماتك حول تاريخ ومنتجات Coca-Cola!',18.00,18000.00,1000,0,3600.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"1876\", \"1886\", \"1896\", \"1906\"], \"optionsAr\": [\"1876\", \"1886\", \"1896\", \"1906\"], \"questionAr\": \"متى اخترعت كوكاكولا؟\", \"questionEn\": \"When was Coca-Cola invented?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Coca-Cola Light\", \"Coca-Cola Zero\", \"Coca-Cola Diet\", \"Coca-Cola Free\"], \"optionsAr\": [\"كوكاكولا لايت\", \"كوكاكولا زيرو\", \"كوكاكولا دايت\", \"كوكاكولا فري\"], \"questionAr\": \"ما اسم نسخة كوكاكولا بدون سكر؟\", \"questionEn\": \"What is Coca-Cola zero sugar version called?\", \"correctAnswer\": 1}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Sprite\", \"Fanta\", \"Pepsi\", \"Schweppes\"], \"optionsAr\": [\"سبرايت\", \"فانتا\", \"بيبسي\", \"شويبس\"], \"questionAr\": \"أي علامة ليست مملوكة لكوكاكولا؟\", \"questionEn\": \"Which brand is NOT owned by Coca-Cola?\", \"correctAnswer\": 2}], \"timeLimit\": 240, \"passingScore\": 60}','2026-01-09 03:33:02','2026-01-09 04:19:51',NULL,NULL,NULL,0),(96,3,'social','Coca-Cola Social Media Follow','تابع Coca-Cola على السوشيال','Follow Coca-Cola Egypt on social media for the latest campaigns and promotions.','تابع Coca-Cola Egypt على وسائل التواصل الاجتماعي لأحدث الحملات والعروض.',8.00,24000.00,3000,0,4800.00,'easy',3,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/CocaColaEgypt\", \"descriptionEn\": \"Follow Coca-Cola Egypt on Facebook\", \"descriptionAr\": \"تابع Coca-Cola Egypt على فيسبوك\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is Coca-Cola main color?\", \"questionAr\": \"ما اللون الرئيسي لـ Coca-Cola؟\", \"options\": [\"Red\", \"Blue\", \"Green\", \"Yellow\"], \"optionsAr\": [\"أحمر\", \"أزرق\", \"أخضر\", \"أصفر\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(97,3,'photo','Coca-Cola Photo Challenge','تحدي صور Coca-Cola','Take a creative photo with any Coca-Cola product and share your moment of happiness.','التقط صورة إبداعية مع أي منتج Coca-Cola وشارك لحظة سعادتك.',25.00,12500.00,500,0,2500.00,'medium',15,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"requirements\": [{\"id\": 1, \"descriptionEn\": \"Photo must include a Coca-Cola product\", \"descriptionAr\": \"يجب أن تتضمن الصورة منتج Coca-Cola\", \"required\": true}, {\"id\": 2, \"descriptionEn\": \"Photo should be creative and original\", \"descriptionAr\": \"يجب أن تكون الصورة إبداعية وأصلية\", \"required\": true}], \"maxPhotos\": 3, \"minPhotos\": 1, \"allowCaption\": true, \"guidelinesEn\": [\"Include Coca-Cola product clearly\", \"Good lighting\", \"Be creative\"], \"guidelinesAr\": [\"أظهر منتج Coca-Cola بوضوح\", \"إضاءة جيدة\", \"كن مبدعاً\"]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(98,3,'video','Coca-Cola Ramadan Campaign Video','فيديو حملة Coca-Cola رمضان','Watch the special Coca-Cola Ramadan campaign video celebrating Egyptian traditions.','شاهد فيديو حملة Coca-Cola الخاصة برمضان احتفالاً بالتقاليد المصرية.',12.00,18000.00,1500,0,3600.00,'easy',4,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"Togetherness\", \"Sports\", \"Music\", \"Travel\"], \"optionsAr\": [\"الترابط\", \"الرياضة\", \"الموسيقى\", \"السفر\"], \"questionAr\": \"ما موضوع حملة Coca-Cola رمضان؟\", \"questionEn\": \"What is the theme of Coca-Cola Ramadan campaign?\", \"correctAnswer\": 0}], \"videoDuration\": 120}','2026-01-09 03:33:02','2026-01-09 04:37:31',NULL,NULL,NULL,0),(99,3,'survey','Coca-Cola Product Feedback','ملاحظات منتجات Coca-Cola','Share your feedback on Coca-Cola product availability and quality in Egypt.','شارك ملاحظاتك حول توفر وجودة منتجات Coca-Cola في مصر.',14.00,11200.00,800,0,2240.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Supermarket\", \"Convenience Store\", \"Restaurant\", \"Online\", \"Vending Machine\"], \"optionsAr\": [\"سوبرماركت\", \"متجر صغير\", \"مطعم\", \"أونلاين\", \"آلة بيع\"], \"questionAr\": \"أين تشتري كوكاكولا عادة؟\", \"questionEn\": \"Where do you usually buy Coca-Cola?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تصميم عبوة كوكاكولا\", \"questionEn\": \"Rate Coca-Cola packaging design\"}, {\"id\": 3, \"type\": \"text\", \"questionAr\": \"ما نكهة كوكاكولا الجديدة التي تريدها؟\", \"questionEn\": \"What new Coca-Cola flavor would you like?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(100,3,'quiz','Coca-Cola Sustainability Quiz','اختبار استدامة Coca-Cola','Learn about Coca-Cola sustainability initiatives in Egypt.','تعرف على مبادرات Coca-Cola للاستدامة في مصر.',20.00,8000.00,400,0,1600.00,'medium',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Glass only\", \"Plastic only\", \"Aluminum only\", \"All of the above\"], \"optionsAr\": [\"زجاج فقط\", \"بلاستيك فقط\", \"ألومنيوم فقط\", \"كل ما سبق\"], \"questionAr\": \"من أي مادة تصنع زجاجات كوكاكولا؟\", \"questionEn\": \"What material are Coca-Cola bottles made of?\", \"correctAnswer\": 3}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"100% recyclable\", \"50% recyclable\", \"No plastic\", \"Biodegradable\"], \"optionsAr\": [\"قابل للتدوير 100%\", \"قابل للتدوير 50%\", \"بدون بلاستيك\", \"قابل للتحلل\"], \"questionAr\": \"ما هدف كوكاكولا للتغليف؟\", \"questionEn\": \"What is Coca-Cola goal for packaging?\", \"correctAnswer\": 0}], \"timeLimit\": 300, \"passingScore\": 70}','2026-01-09 03:33:02','2026-01-09 04:19:51',NULL,NULL,NULL,0),(101,18,'app','Talabat App First Order','أول طلب من تطبيق طلبات','Download Talabat app and explore restaurants near you. Complete your profile for personalized recommendations.','حمل تطبيق طلبات واستكشف المطاعم القريبة منك. أكمل ملفك الشخصي للحصول على توصيات مخصصة.',22.00,33000.00,1500,0,6600.00,'easy',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق طلبات\", \"instructionEn\": \"Download Talabat app\"}, {\"id\": 2, \"instructionAr\": \"أنشئ حساباً\", \"instructionEn\": \"Create an account\"}, {\"id\": 3, \"instructionAr\": \"أضف عنوان التوصيل\", \"instructionEn\": \"Add your delivery address\"}], \"appName\": \"Talabat\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.talabat\", \"packageName\": \"com.talabat\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Varies by restaurant\", \"100 EGP always\", \"No minimum\", \"500 EGP\"], \"optionsAr\": [\"يختلف حسب المطعم\", \"100 جنيه دائماً\", \"لا يوجد حد أدنى\", \"500 جنيه\"], \"questionAr\": \"ما الحد الأدنى للطلب للتوصيل المجاني على طلبات؟\", \"questionEn\": \"What is the minimum order for free delivery on Talabat?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(102,18,'survey','Talabat Customer Experience Survey','استبيان تجربة عملاء طلبات','Share your experience with Talabat delivery service in Egypt.','شارك تجربتك مع خدمة توصيل طلبات في مصر.',18.00,18000.00,1000,0,3600.00,'easy',7,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تجربتك العامة مع طلبات\", \"questionEn\": \"Rate your overall Talabat experience\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Food\", \"Groceries\", \"Pharmacy\", \"Flowers\", \"Other\"], \"optionsAr\": [\"طعام\", \"بقالة\", \"صيدلية\", \"زهور\", \"أخرى\"], \"questionAr\": \"ما الذي تطلبه أكثر من طلبات؟\", \"questionEn\": \"What do you order most on Talabat?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم سرعة التوصيل\", \"questionEn\": \"Rate delivery speed\"}, {\"id\": 4, \"type\": \"text\", \"questionAr\": \"أي اقتراحات لطلبات؟\", \"questionEn\": \"Any suggestions for Talabat?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(103,18,'quiz','Talabat Food Quiz','اختبار طعام طلبات','Test your knowledge about Egyptian cuisine and Talabat services!','اختبر معلوماتك حول المطبخ المصري وخدمات طلبات!',15.00,12000.00,800,0,2400.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Food\", \"Orders\", \"Delivery\", \"Restaurant\"], \"optionsAr\": [\"طعام\", \"طلبات\", \"توصيل\", \"مطعم\"], \"questionAr\": \"ماذا تعني طلبات بالعربية؟\", \"questionEn\": \"What does Talabat mean in Arabic?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Egypt\", \"UAE\", \"Kuwait\", \"Saudi Arabia\"], \"optionsAr\": [\"مصر\", \"الإمارات\", \"الكويت\", \"السعودية\"], \"questionAr\": \"في أي بلد بدأت طلبات؟\", \"questionEn\": \"Which country did Talabat start in?\", \"correctAnswer\": 2}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Talabat Shop\", \"Talabat Mart\", \"Talabat Grocery\", \"Talabat Market\"], \"optionsAr\": [\"طلبات شوب\", \"طلبات مارت\", \"طلبات بقالة\", \"طلبات ماركت\"], \"questionAr\": \"ما اسم خدمة البقالة من طلبات؟\", \"questionEn\": \"What is Talabat grocery service called?\", \"correctAnswer\": 1}], \"timeLimit\": 240, \"passingScore\": 60}','2026-01-09 03:33:02','2026-01-09 04:19:51',NULL,NULL,NULL,0),(104,18,'social','Follow Talabat Egypt Social','تابع طلبات مصر على السوشيال','Follow Talabat Egypt on social media for exclusive offers and discounts.','تابع طلبات مصر على وسائل التواصل الاجتماعي للحصول على عروض وخصومات حصرية.',10.00,20000.00,2000,0,4000.00,'easy',4,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/TalabatEgypt\", \"descriptionEn\": \"Follow Talabat Egypt on Facebook\", \"descriptionAr\": \"تابع طلبات مصر على فيسبوك\"}, {\"id\": 2, \"type\": \"follow\", \"platform\": \"instagram\", \"url\": \"https://www.instagram.com/talabat_egypt\", \"descriptionEn\": \"Follow Talabat Egypt on Instagram\", \"descriptionAr\": \"تابع طلبات مصر على انستغرام\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What color is Talabat logo?\", \"questionAr\": \"ما لون شعار طلبات؟\", \"options\": [\"Orange\", \"Red\", \"Blue\", \"Green\"], \"optionsAr\": [\"برتقالي\", \"أحمر\", \"أزرق\", \"أخضر\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(105,18,'survey','Talabat Pro Subscription Survey','استبيان اشتراك Talabat Pro','Share your thoughts on Talabat Pro subscription benefits.','شارك أفكارك حول مزايا اشتراك Talabat Pro.',22.00,8800.00,400,0,1760.00,'medium',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Yes\", \"No\", \"Was before\", \"Considering\"], \"optionsAr\": [\"نعم\", \"لا\", \"كنت سابقاً\", \"أفكر في ذلك\"], \"questionAr\": \"هل أنت مشترك في طلبات برو؟\", \"questionEn\": \"Are you a Talabat Pro subscriber?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم قيمة طلبات برو مقابل المال\", \"questionEn\": \"Rate Talabat Pro value for money\"}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Free Delivery\", \"Exclusive Discounts\", \"Priority Support\", \"All\"], \"optionsAr\": [\"توصيل مجاني\", \"خصومات حصرية\", \"دعم الأولوية\", \"الكل\"], \"questionAr\": \"ما ميزة برو الأهم لك؟\", \"questionEn\": \"Which Pro benefit matters most?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(106,18,'app','Talabat Mart Grocery Experience','تجربة بقالة Talabat Mart','Download Talabat and explore Talabat Mart for quick grocery delivery.','حمل طلبات واستكشف Talabat Mart للتوصيل السريع للبقالة.',20.00,12000.00,600,0,2400.00,'easy',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"افتح تطبيق طلبات\", \"instructionEn\": \"Open Talabat app\"}, {\"id\": 2, \"instructionAr\": \"انتقل إلى قسم Talabat Mart\", \"instructionEn\": \"Navigate to Talabat Mart section\"}, {\"id\": 3, \"instructionAr\": \"تصفح المنتجات المتاحة\", \"instructionEn\": \"Browse available products\"}], \"appName\": \"Talabat\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.talabat\", \"packageName\": \"com.talabat\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"30 minutes or less\", \"Same day\", \"Next day\", \"1 hour\"], \"optionsAr\": [\"30 دقيقة أو أقل\", \"نفس اليوم\", \"اليوم التالي\", \"ساعة واحدة\"], \"questionAr\": \"ما وعد توصيل Talabat Mart؟\", \"questionEn\": \"What is Talabat Mart delivery promise?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(107,19,'app','CIB Mobile Banking App','تطبيق CIB للخدمات المصرفية','Download CIB Mobile Banking app and explore digital banking features.','حمل تطبيق CIB للخدمات المصرفية واستكشف ميزات الخدمات المصرفية الرقمية.',30.00,24000.00,800,0,4800.00,'medium',15,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق CIB Mobile\", \"instructionEn\": \"Download CIB Mobile app\"}, {\"id\": 2, \"instructionAr\": \"استكشف ميزات التطبيق\", \"instructionEn\": \"Explore the app features\"}], \"appName\": \"CIB Egypt\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.cib.mobile\", \"packageName\": \"com.cib.mobile\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Transfers, Bills, Cards\", \"Only balance check\", \"Only ATM locator\", \"None\"], \"optionsAr\": [\"التحويلات، الفواتير، البطاقات\", \"التحقق من الرصيد فقط\", \"محدد ATM فقط\", \"لا شيء\"], \"questionAr\": \"ما الخدمات المتوفرة في CIB Mobile؟\", \"questionEn\": \"What services are available in CIB Mobile?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(108,19,'survey','CIB Digital Banking Survey','استبيان الخدمات المصرفية الرقمية CIB','Share your experience with CIB digital banking services.','شارك تجربتك مع خدمات CIB المصرفية الرقمية.',25.00,12500.00,500,0,2500.00,'easy',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تطبيق CIB للخدمات المصرفية\", \"questionEn\": \"Rate CIB Mobile Banking app\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Mobile App\", \"Internet Banking\", \"Smart Wallet\", \"ATM\", \"All\"], \"optionsAr\": [\"تطبيق الموبايل\", \"الخدمات المصرفية عبر الإنترنت\", \"المحفظة الذكية\", \"الصراف الآلي\", \"الكل\"], \"questionAr\": \"ما خدمة CIB الرقمية التي تستخدمها أكثر؟\", \"questionEn\": \"Which CIB digital service do you use most?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم سهولة الاستخدام\", \"questionEn\": \"Rate the ease of use\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(109,19,'video','CIB Credit Card Features Video','فيديو ميزات بطاقة CIB الائتمانية','Learn about CIB credit card benefits and rewards program.','تعرف على مزايا بطاقة CIB الائتمانية وبرنامج المكافآت.',18.00,10800.00,600,0,2160.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"CIB Points\", \"Cash Back Only\", \"No rewards\", \"Miles Only\"], \"optionsAr\": [\"نقاط CIB\", \"استرداد نقدي فقط\", \"لا مكافآت\", \"أميال فقط\"], \"questionAr\": \"ما برنامج المكافآت الذي يقدمه CIB؟\", \"questionEn\": \"What rewards program does CIB offer?\", \"correctAnswer\": 0}], \"videoDuration\": 180}','2026-01-09 03:33:02','2026-01-09 04:37:31',NULL,NULL,NULL,0),(110,19,'quiz','CIB Financial Literacy Quiz','اختبار الثقافة المالية CIB','Test your financial knowledge with CIB educational quiz.','اختبر معرفتك المالية مع اختبار CIB التعليمي.',28.00,11200.00,400,0,2240.00,'medium',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Central International Bank\", \"Commercial International Bank\", \"Cairo Investment Bank\", \"Credit International Bank\"], \"optionsAr\": [\"البنك المركزي الدولي\", \"البنك التجاري الدولي\", \"بنك القاهرة للاستثمار\", \"بنك الائتمان الدولي\"], \"questionAr\": \"ماذا يعني CIB؟\", \"questionEn\": \"What does CIB stand for?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Interest on principal only\", \"Interest on interest\", \"Fixed interest rate\", \"No interest\"], \"optionsAr\": [\"فائدة على الأصل فقط\", \"فائدة على الفائدة\", \"سعر فائدة ثابت\", \"بدون فائدة\"], \"questionAr\": \"ما هي الفائدة المركبة؟\", \"questionEn\": \"What is compound interest?\", \"correctAnswer\": 1}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Measure wealth\", \"Assess loan eligibility\", \"Calculate taxes\", \"Track spending\"], \"optionsAr\": [\"قياس الثروة\", \"تقييم أهلية القرض\", \"حساب الضرائب\", \"تتبع الإنفاق\"], \"questionAr\": \"لماذا يستخدم التصنيف الائتماني؟\", \"questionEn\": \"What is a credit score used for?\", \"correctAnswer\": 1}, {\"id\": 4, \"type\": \"multiple_choice\", \"options\": [\"Investing in one stock\", \"Spreading investments\", \"Saving only\", \"Avoiding risk\"], \"optionsAr\": [\"الاستثمار في سهم واحد\", \"توزيع الاستثمارات\", \"الادخار فقط\", \"تجنب المخاطر\"], \"questionAr\": \"ما هو التنويع في الاستثمار؟\", \"questionEn\": \"What is diversification in investing?\", \"correctAnswer\": 1}], \"timeLimit\": 360, \"passingScore\": 70}','2026-01-09 03:33:02','2026-01-09 04:19:51',NULL,NULL,NULL,0),(111,19,'social','Follow CIB Egypt Social','تابع CIB Egypt على السوشيال','Follow CIB Egypt on social media for financial tips and offers.','تابع CIB Egypt على وسائل التواصل الاجتماعي للنصائح المالية والعروض.',12.00,12000.00,1000,0,2400.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/CIBEgypt\", \"descriptionEn\": \"Follow CIB Egypt on Facebook\", \"descriptionAr\": \"تابع CIB Egypt على فيسبوك\"}, {\"id\": 2, \"type\": \"follow\", \"platform\": \"instagram\", \"url\": \"https://www.instagram.com/cib_egypt\", \"descriptionEn\": \"Follow CIB Egypt on Instagram\", \"descriptionAr\": \"تابع CIB Egypt على انستغرام\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is CIB main color?\", \"questionAr\": \"ما اللون الرئيسي لـ CIB؟\", \"options\": [\"Blue\", \"Red\", \"Green\", \"Orange\"], \"optionsAr\": [\"أزرق\", \"أحمر\", \"أخضر\", \"برتقالي\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(112,19,'survey','CIB Wealth Management Survey','استبيان إدارة الثروات CIB','Share your interest in CIB wealth management and investment services.','شارك اهتمامك بخدمات إدارة الثروات والاستثمار من CIB.',35.00,7000.00,200,0,1400.00,'medium',12,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Very Interested\", \"Somewhat Interested\", \"Not Sure\", \"Not Interested\"], \"optionsAr\": [\"مهتم جداً\", \"مهتم نوعاً ما\", \"غير متأكد\", \"غير مهتم\"], \"questionAr\": \"هل أنت مهتم بإدارة الثروات من CIB؟\", \"questionEn\": \"Are you interested in CIB wealth management?\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Stocks\", \"Bonds\", \"Mutual Funds\", \"Real Estate\", \"All\"], \"optionsAr\": [\"الأسهم\", \"السندات\", \"صناديق الاستثمار\", \"العقارات\", \"الكل\"], \"questionAr\": \"ما نوع الاستثمار الذي يهمك؟\", \"questionEn\": \"What investment type interests you?\"}, {\"id\": 3, \"type\": \"text\", \"questionAr\": \"ما أهدافك المالية؟\", \"questionEn\": \"What financial goals do you have?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(113,19,'app','CIB Smart Wallet Setup','إعداد CIB Smart Wallet','Set up CIB Smart Wallet for contactless payments.','أعد CIB Smart Wallet للمدفوعات اللاتلامسية.',32.00,9600.00,300,0,1920.00,'medium',15,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل CIB Smart Wallet\", \"instructionEn\": \"Download CIB Smart Wallet\"}, {\"id\": 2, \"instructionAr\": \"اربط بطاقة CIB الخاصة بك\", \"instructionEn\": \"Link your CIB card\"}], \"appName\": \"CIB Smart Wallet\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.cib.wallet\", \"packageName\": \"com.cib.wallet\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Tap to pay\", \"Only check balance\", \"Only ATM\", \"Nothing\"], \"optionsAr\": [\"الدفع بالنقر\", \"التحقق من الرصيد فقط\", \"ATM فقط\", \"لا شيء\"], \"questionAr\": \"ما الذي يمكنك فعله مع CIB Smart Wallet؟\", \"questionEn\": \"What can you do with CIB Smart Wallet?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(114,23,'video','Pepsi Egypt Campaign Video','فيديو حملة Pepsi مصر','Watch the latest Pepsi Egypt campaign featuring Egyptian celebrities.','شاهد أحدث حملة Pepsi مصر مع نجوم مصريين.',10.00,20000.00,2000,0,4000.00,'easy',3,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"For the Love of It\", \"Live for Now\", \"The Choice\", \"Refresh\"], \"optionsAr\": [\"لحب الحياة\", \"عيش اللحظة\", \"الاختيار\", \"انتعش\"], \"questionAr\": \"ما شعار حملة Pepsi مصر؟\", \"questionEn\": \"What is Pepsi Egypt campaign slogan?\", \"correctAnswer\": 0}], \"videoDuration\": 90}','2026-01-09 03:33:02','2026-01-09 04:37:22',NULL,NULL,NULL,0),(115,23,'survey','Pepsi vs Competitors Survey','استبيان Pepsi مقابل المنافسين','Share your preferences between Pepsi and other soft drinks.','شارك تفضيلاتك بين Pepsi والمشروبات الغازية الأخرى.',15.00,18000.00,1200,0,3600.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Pepsi\", \"Coca-Cola\", \"Both equally\", \"Neither\", \"Other\"], \"optionsAr\": [\"بيبسي\", \"كوكاكولا\", \"كلاهما بالتساوي\", \"لا أحد منهما\", \"أخرى\"], \"questionAr\": \"ما المشروب الغازي الذي تفضله؟\", \"questionEn\": \"Which soft drink do you prefer?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم طعم بيبسي\", \"questionEn\": \"Rate Pepsi taste\"}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Taste\", \"Price\", \"Availability\", \"Brand\", \"Promotions\"], \"optionsAr\": [\"الطعم\", \"السعر\", \"التوفر\", \"العلامة التجارية\", \"العروض\"], \"questionAr\": \"ما الذي يجعلك تختار بيبسي؟\", \"questionEn\": \"What makes you choose Pepsi?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(116,23,'quiz','Pepsi Trivia Quiz','اختبار معلومات Pepsi','Test your knowledge about Pepsi history and products!','اختبر معلوماتك حول تاريخ ومنتجات Pepsi!',16.00,12800.00,800,0,2560.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"1883\", \"1893\", \"1903\", \"1913\"], \"optionsAr\": [\"1883\", \"1893\", \"1903\", \"1913\"], \"questionAr\": \"متى تم إنشاء بيبسي؟\", \"questionEn\": \"When was Pepsi created?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Brad Drink\", \"Cola-Cola\", \"Pepsin Cola\", \"Sweet Soda\"], \"optionsAr\": [\"براد درينك\", \"كولا كولا\", \"بيبسين كولا\", \"سويت صودا\"], \"questionAr\": \"ما الاسم الأصلي لبيبسي؟\", \"questionEn\": \"What was Pepsi originally called?\", \"correctAnswer\": 0}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Sprite\", \"Lays\", \"Fanta\", \"Schweppes\"], \"optionsAr\": [\"سبرايت\", \"ليز\", \"فانتا\", \"شويبس\"], \"questionAr\": \"أي علامة مملوكة لبيبسيكو؟\", \"questionEn\": \"Which brand is owned by PepsiCo?\", \"correctAnswer\": 1}], \"timeLimit\": 240, \"passingScore\": 60}','2026-01-09 03:33:02','2026-01-09 04:19:51',NULL,NULL,NULL,0),(117,23,'social','Follow Pepsi Egypt Social','تابع Pepsi Egypt على السوشيال','Follow Pepsi Egypt on social media for exclusive content.','تابع Pepsi Egypt على وسائل التواصل الاجتماعي لمحتوى حصري.',8.00,20000.00,2500,0,4000.00,'easy',3,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/PepsiEgypt\", \"descriptionEn\": \"Follow Pepsi Egypt on Facebook\", \"descriptionAr\": \"تابع Pepsi Egypt على فيسبوك\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is Pepsi main color?\", \"questionAr\": \"ما اللون الرئيسي لـ Pepsi؟\", \"options\": [\"Blue\", \"Red\", \"Green\", \"Yellow\"], \"optionsAr\": [\"أزرق\", \"أحمر\", \"أخضر\", \"أصفر\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(118,23,'survey','Lays Flavor Feedback','ملاحظات نكهات Lays','Share your feedback on Lays chip flavors available in Egypt.','شارك ملاحظاتك حول نكهات رقائق Lays المتوفرة في مصر.',12.00,12000.00,1000,0,2400.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Classic Salted\", \"Cheese\", \"Chili\", \"Paprika\", \"Other\"], \"optionsAr\": [\"مملح كلاسيك\", \"جبنة\", \"فلفل حار\", \"بابريكا\", \"أخرى\"], \"questionAr\": \"ما نكهة ليز المفضلة لديك؟\", \"questionEn\": \"What is your favorite Lays flavor?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم جودة ليز\", \"questionEn\": \"Rate Lays quality\"}, {\"id\": 3, \"type\": \"text\", \"questionAr\": \"ما النكهة الجديدة التي تريد أن تصنعها ليز؟\", \"questionEn\": \"What new flavor would you like Lays to make?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(119,24,'app','Carrefour Egypt App Download','تحميل تطبيق كارفور مصر','Download Carrefour Egypt app and explore online grocery shopping.','حمل تطبيق كارفور مصر واستكشف التسوق البقالة عبر الإنترنت.',18.00,21600.00,1200,0,4320.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق كارفور مصر\", \"instructionEn\": \"Download Carrefour Egypt app\"}, {\"id\": 2, \"instructionAr\": \"أنشئ حساباً\", \"instructionEn\": \"Create an account\"}], \"appName\": \"Carrefour Egypt\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.carrefour.egypt\", \"packageName\": \"com.carrefour.egypt\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Same day delivery\", \"Next week\", \"1 hour\", \"No delivery\"], \"optionsAr\": [\"توصيل في نفس اليوم\", \"الأسبوع القادم\", \"ساعة واحدة\", \"لا توصيل\"], \"questionAr\": \"ما وعد توصيل كارفور؟\", \"questionEn\": \"What is Carrefour delivery promise?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(120,24,'survey','Carrefour Shopping Experience Survey','استبيان تجربة التسوق في كارفور','Share your shopping experience at Carrefour Egypt stores.','شارك تجربة التسوق في متاجر كارفور مصر.',20.00,16000.00,800,0,3200.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تجربة التسوق في كارفور\", \"questionEn\": \"Rate your Carrefour shopping experience\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Weekly\", \"Bi-weekly\", \"Monthly\", \"Occasionally\", \"First time\"], \"optionsAr\": [\"أسبوعياً\", \"كل أسبوعين\", \"شهرياً\", \"أحياناً\", \"أول مرة\"], \"questionAr\": \"كم مرة تتسوق في كارفور؟\", \"questionEn\": \"How often do you shop at Carrefour?\"}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Groceries\", \"Electronics\", \"Clothing\", \"Home Items\", \"All\"], \"optionsAr\": [\"بقالة\", \"إلكترونيات\", \"ملابس\", \"أدوات منزلية\", \"الكل\"], \"questionAr\": \"ما الذي تشتريه أكثر من كارفور؟\", \"questionEn\": \"What do you buy most at Carrefour?\"}, {\"id\": 4, \"type\": \"text\", \"questionAr\": \"أي اقتراحات لكارفور؟\", \"questionEn\": \"Any suggestions for Carrefour?\"}]}','2026-01-09 03:33:02','2026-01-09 04:17:05',NULL,NULL,NULL,0),(121,24,'quiz','Carrefour Deals Quiz','اختبار عروض كارفور','Test your knowledge about Carrefour deals and promotions!','اختبر معلوماتك حول عروض وخصومات كارفور!',15.00,9000.00,600,0,1800.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"USA\", \"UK\", \"France\", \"Germany\"], \"optionsAr\": [\"أمريكا\", \"بريطانيا\", \"فرنسا\", \"ألمانيا\"], \"questionAr\": \"من أي بلد كارفور؟\", \"questionEn\": \"Which country is Carrefour from?\", \"correctAnswer\": 2}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Big Store\", \"Crossroads\", \"Shopping\", \"Market\"], \"optionsAr\": [\"متجر كبير\", \"مفترق طرق\", \"تسوق\", \"سوق\"], \"questionAr\": \"ماذا تعني كارفور بالفرنسية؟\", \"questionEn\": \"What does Carrefour mean in French?\", \"correctAnswer\": 1}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Carrefour Points\", \"Carrefour Club\", \"MyClub\", \"Carrefour Rewards\"], \"optionsAr\": [\"نقاط كارفور\", \"نادي كارفور\", \"ماي كلوب\", \"مكافآت كارفور\"], \"questionAr\": \"ما برنامج ولاء كارفور؟\", \"questionEn\": \"What is Carrefour loyalty program?\", \"correctAnswer\": 2}], \"timeLimit\": 180, \"passingScore\": 60}','2026-01-09 03:33:02','2026-01-09 04:19:51',NULL,NULL,NULL,0),(122,24,'social','Follow Carrefour Egypt Social','تابع كارفور مصر على السوشيال','Follow Carrefour Egypt for the latest deals and offers.','تابع كارفور مصر لأحدث العروض والخصومات.',10.00,15000.00,1500,0,3000.00,'easy',4,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/CarrefourEgypt\", \"descriptionEn\": \"Follow Carrefour Egypt on Facebook\", \"descriptionAr\": \"تابع كارفور مصر على فيسبوك\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is Carrefour main color?\", \"questionAr\": \"ما اللون الرئيسي لكارفور؟\", \"options\": [\"Blue\", \"Red\", \"Green\", \"Yellow\"], \"optionsAr\": [\"أزرق\", \"أحمر\", \"أخضر\", \"أصفر\"], \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 03:33:02',NULL,NULL,NULL,0),(123,24,'visit','Carrefour Store Visit Feedback','ملاحظات زيارة متجر كارفور','Visit any Carrefour store and share your feedback.','قم بزيارة أي متجر كارفور وشارك ملاحظاتك.',40.00,12000.00,300,0,2400.00,'medium',25,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"قم بزيارة موقع المتجر\", \"instructionEn\": \"Visit the store location\"}, {\"id\": 2, \"instructionAr\": \"التقط صورة عند مدخل المتجر\", \"instructionEn\": \"Take a photo at the store entrance\"}, {\"id\": 3, \"instructionAr\": \"أكمل تسجيل الوصول للتحقق\", \"instructionEn\": \"Complete the verification check-in\"}], \"locations\": [{\"id\": 1, \"nameAr\": \"كارفور سيتي ستارز\", \"nameEn\": \"Carrefour City Stars\", \"radius\": 200, \"address\": \"City Stars Mall, Nasr City, Cairo\", \"latitude\": 30.0731, \"addressAr\": \"سيتي ستارز مول، مدينة نصر، القاهرة\", \"longitude\": 31.3456}, {\"id\": 2, \"nameAr\": \"كارفور مول مصر\", \"nameEn\": \"Carrefour Mall of Egypt\", \"radius\": 200, \"address\": \"Mall of Egypt, 6th of October\", \"latitude\": 29.9726, \"addressAr\": \"مول مصر، 6 أكتوبر\", \"longitude\": 30.9754}], \"requirePhoto\": false, \"requirements\": [\"Valid ID\", \"Smartphone with camera\", \"GPS enabled\"], \"requireGeolocation\": true, \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Fresh produce\", \"Electronics\", \"Clothing\", \"Pharmacy\"], \"optionsAr\": [\"المنتجات الطازجة\", \"الإلكترونيات\", \"الملابس\", \"الصيدلية\"], \"questionAr\": \"ما القسم عند المدخل؟\", \"questionEn\": \"What section is at the entrance?\", \"correctAnswer\": 0}]}','2026-01-09 03:33:02','2026-01-09 04:38:39',NULL,NULL,NULL,0),(124,13,'survey','Mansour Automotive Survey','استبيان Mansour للسيارات','Share your experience with Mansour Automotive brands including Chevrolet, Opel, and MG in Egypt.','شارك تجربتك مع علامات Mansour للسيارات بما في ذلك شيفروليه وأوبل وMG في مصر.',25.00,12500.00,500,2,2500.00,'easy',10,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Chevrolet\", \"Opel\", \"MG\", \"Cadillac\", \"All\"], \"optionsAr\": [\"شيفروليه\", \"أوبل\", \"إم جي\", \"كاديلاك\", \"الكل\"], \"questionAr\": \"ما علامة منصور للسيارات التي تعرفها؟\", \"questionEn\": \"Which Mansour Automotive brand do you know?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم خدمة منصور للسيارات\", \"questionEn\": \"Rate Mansour Automotive service\"}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Yes, soon\", \"Maybe later\", \"Just browsing\", \"Already own one\", \"No\"], \"optionsAr\": [\"نعم، قريباً\", \"ربما لاحقاً\", \"أتصفح فقط\", \"أملك واحدة بالفعل\", \"لا\"], \"questionAr\": \"هل تفكر في شراء سيارة من منصور؟\", \"questionEn\": \"Are you considering buying a car from Mansour?\"}, {\"id\": 4, \"type\": \"text\", \"questionAr\": \"ما الميزات الأهم عند شراء سيارة؟\", \"questionEn\": \"What features matter most when buying a car?\"}]}','2026-01-09 03:36:28','2026-01-09 06:34:42',NULL,NULL,NULL,0),(125,13,'survey','Metro Market Shopping Experience','تجربة التسوق في Metro Market','Share your shopping experience at Metro Market supermarkets.','شارك تجربة التسوق في سوبر ماركت Metro Market.',18.00,14400.00,800,0,2880.00,'easy',7,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تجربتك في مترو ماركت\", \"questionEn\": \"Rate your Metro Market experience\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Weekly\", \"Bi-weekly\", \"Monthly\", \"Occasionally\"], \"optionsAr\": [\"أسبوعياً\", \"كل أسبوعين\", \"شهرياً\", \"أحياناً\"], \"questionAr\": \"كم مرة تتسوق في مترو؟\", \"questionEn\": \"How often do you shop at Metro?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تنوع المنتجات في مترو\", \"questionEn\": \"Rate product variety at Metro\"}]}','2026-01-09 03:36:28','2026-01-09 04:17:05',NULL,NULL,NULL,0),(126,13,'survey','McDonald\'s Egypt Customer Survey','استبيان عملاء McDonald\'s مصر','Share your dining experience at McDonald\'s Egypt restaurants.','شارك تجربة تناول الطعام في مطاعم McDonald\'s مصر.',15.00,22500.00,1500,0,4500.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم تجربتك في ماكدونالدز مصر\", \"questionEn\": \"Rate your McDonald\'s Egypt experience\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Big Mac\", \"McChicken\", \"Nuggets\", \"Fries\", \"McFlurry\"], \"optionsAr\": [\"بيج ماك\", \"ماك تشيكن\", \"ناجتس\", \"بطاطس\", \"ماك فلوري\"], \"questionAr\": \"ما وجبتك المفضلة في ماكدونالدز؟\", \"questionEn\": \"What is your favorite McDonald\'s item?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم جودة الطعام\", \"questionEn\": \"Rate food quality\"}]}','2026-01-09 03:36:28','2026-01-09 04:17:05',NULL,NULL,NULL,0),(127,13,'social','Follow Mansour Group Social','تابع Mansour Group على السوشيال','Follow Mansour Group brands on social media for the latest offers.','تابع علامات Mansour Group على وسائل التواصل الاجتماعي لأحدث العروض.',10.00,15000.00,1500,0,3000.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/MansourAutomotive\", \"descriptionEn\": \"Follow Mansour Automotive on Facebook\", \"descriptionAr\": \"تابع Mansour Automotive على فيسبوك\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What car brand does Mansour represent?\", \"questionAr\": \"ما علامة السيارات التي يمثلها Mansour؟\", \"options\": [\"Chevrolet\", \"Toyota\", \"BMW\", \"Mercedes\"], \"optionsAr\": [\"شيفروليه\", \"تويوتا\", \"BMW\", \"مرسيدس\"], \"correctAnswer\": 0}]}','2026-01-09 03:36:28','2026-01-09 03:36:28',NULL,NULL,NULL,0),(128,13,'quiz','Mansour Automotive Quiz','اختبار Mansour للسيارات','Test your knowledge about Mansour Automotive brands and history!','اختبر معلوماتك حول علامات وتاريخ Mansour للسيارات!',22.00,8800.00,400,2,1760.00,'medium',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Chevrolet\", \"Opel\", \"Toyota\", \"MG\"], \"optionsAr\": [\"شيفروليه\", \"أوبل\", \"تويوتا\", \"إم جي\"], \"questionAr\": \"أي علامة سيارات لا يمثلها منصور؟\", \"questionEn\": \"Which car brand does Mansour NOT represent?\", \"correctAnswer\": 2}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Real Estate\", \"Automotive\", \"Banking\", \"Telecom\"], \"optionsAr\": [\"عقارات\", \"سيارات\", \"بنوك\", \"اتصالات\"], \"questionAr\": \"ما العمل الرئيسي لمجموعة منصور؟\", \"questionEn\": \"What is Mansour Group main business?\", \"correctAnswer\": 1}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"KFC\", \"Burger King\", \"McDonald\'s\", \"Subway\"], \"optionsAr\": [\"كنتاكي\", \"برجر كينج\", \"ماكدونالدز\", \"صب واي\"], \"questionAr\": \"أي سلسلة وجبات سريعة يديرها منصور في مصر؟\", \"questionEn\": \"Which fast food chain does Mansour operate in Egypt?\", \"correctAnswer\": 2}, {\"id\": 4, \"type\": \"multiple_choice\", \"options\": [\"Carrefour\", \"Metro Market\", \"Spinneys\", \"Seoudi\"], \"optionsAr\": [\"كارفور\", \"مترو ماركت\", \"سبينيز\", \"السعودي\"], \"questionAr\": \"أي سلسلة سوبرماركت مملوكة لمنصور؟\", \"questionEn\": \"What supermarket chain is owned by Mansour?\", \"correctAnswer\": 1}], \"timeLimit\": 300, \"passingScore\": 70}','2026-01-09 03:36:28','2026-01-09 06:37:59',NULL,NULL,NULL,0),(129,20,'video','Etisalat 5G Network Experience','تجربة شبكة Etisalat 5G','Watch the Etisalat 5G network video and learn about the fastest network in Egypt.','شاهد فيديو شبكة Etisalat 5G وتعرف على أسرع شبكة في مصر.',14.00,14000.00,1000,0,2800.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"Up to 1 Gbps\", \"100 Mbps\", \"50 Mbps\", \"10 Mbps\"], \"optionsAr\": [\"حتى 1 جيجابت\", \"100 ميجابت\", \"50 ميجابت\", \"10 ميجابت\"], \"questionAr\": \"ما السرعة القصوى لـ Etisalat 5G؟\", \"questionEn\": \"What is Etisalat 5G maximum speed?\", \"correctAnswer\": 0}], \"videoDuration\": 150}','2026-01-09 03:36:28','2026-01-09 04:37:31',NULL,NULL,NULL,0),(130,20,'app','My Etisalat App Setup','إعداد تطبيق My Etisalat','Download My Etisalat app to manage your account and access exclusive offers.','حمل تطبيق My Etisalat لإدارة حسابك والوصول إلى عروض حصرية.',20.00,30000.00,1500,0,6000.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق My Etisalat\", \"instructionEn\": \"Download My Etisalat app\"}, {\"id\": 2, \"instructionAr\": \"سجل الدخول برقم Etisalat الخاص بك\", \"instructionEn\": \"Login with your Etisalat number\"}], \"appName\": \"My Etisalat\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.etisalat.myetisalat\", \"packageName\": \"com.etisalat.myetisalat\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Check balance & recharge\", \"Order food\", \"Book flights\", \"Watch movies\"], \"optionsAr\": [\"تحقق من الرصيد والشحن\", \"طلب طعام\", \"حجز رحلات\", \"مشاهدة أفلام\"], \"questionAr\": \"ما الذي يمكنك فعله في تطبيق My Etisalat؟\", \"questionEn\": \"What can you do in My Etisalat app?\", \"correctAnswer\": 0}]}','2026-01-09 03:36:28','2026-01-09 04:38:39',NULL,NULL,NULL,0),(131,20,'survey','Etisalat Customer Experience Survey','استبيان تجربة عملاء Etisalat','Share your experience with Etisalat network and services.','شارك تجربتك مع شبكة وخدمات Etisalat.',18.00,21600.00,1200,0,4320.00,'easy',7,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم جودة شبكة اتصالات\", \"questionEn\": \"Rate Etisalat network quality\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Mobile\", \"Home Internet\", \"Etisalat Cash\", \"All\", \"Other\"], \"optionsAr\": [\"موبايل\", \"إنترنت منزلي\", \"اتصالات كاش\", \"الكل\", \"أخرى\"], \"questionAr\": \"ما خدمة اتصالات التي تستخدمها؟\", \"questionEn\": \"Which Etisalat service do you use?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم جودة خدمة العملاء\", \"questionEn\": \"Rate customer service quality\"}, {\"id\": 4, \"type\": \"text\", \"questionAr\": \"أي اقتراحات لاتصالات؟\", \"questionEn\": \"Any suggestions for Etisalat?\"}]}','2026-01-09 03:36:28','2026-01-09 04:37:22',NULL,NULL,NULL,0),(132,20,'social','Follow Etisalat Egypt Social','تابع Etisalat Egypt على السوشيال','Follow Etisalat Egypt on social media for the latest offers.','تابع Etisalat Egypt على وسائل التواصل الاجتماعي لأحدث العروض.',12.00,24000.00,2000,0,4800.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/EtisalatMisr\", \"descriptionEn\": \"Follow Etisalat Egypt on Facebook\", \"descriptionAr\": \"تابع Etisalat Egypt على فيسبوك\"}, {\"id\": 2, \"type\": \"follow\", \"platform\": \"instagram\", \"url\": \"https://www.instagram.com/etisalatmisr\", \"descriptionEn\": \"Follow Etisalat Egypt on Instagram\", \"descriptionAr\": \"تابع Etisalat Egypt على انستغرام\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is Etisalat Egypt dial code?\", \"questionAr\": \"ما كود اتصال Etisalat مصر؟\", \"options\": [\"011\", \"010\", \"012\", \"015\"], \"optionsAr\": [\"011\", \"010\", \"012\", \"015\"], \"correctAnswer\": 0}]}','2026-01-09 03:36:28','2026-01-09 03:36:28',NULL,NULL,NULL,0),(133,20,'quiz','Etisalat Egypt Quiz','اختبار Etisalat مصر','Test your knowledge about Etisalat Egypt services!','اختبر معلوماتك حول خدمات Etisalat مصر!',20.00,10000.00,500,0,2000.00,'medium',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"2005\", \"2007\", \"2010\", \"2012\"], \"optionsAr\": [\"2005\", \"2007\", \"2010\", \"2012\"], \"questionAr\": \"متى انطلقت اتصالات في مصر؟\", \"questionEn\": \"When did Etisalat launch in Egypt?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Etisalat Pay\", \"Etisalat Cash\", \"Etisalat Money\", \"Flous\"], \"optionsAr\": [\"اتصالات باي\", \"اتصالات كاش\", \"اتصالات موني\", \"فلوس\"], \"questionAr\": \"ما اسم المحفظة الرقمية لاتصالات؟\", \"questionEn\": \"What is Etisalat digital wallet called?\", \"correctAnswer\": 3}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Egypt\", \"Saudi Arabia\", \"UAE\", \"Kuwait\"], \"optionsAr\": [\"مصر\", \"السعودية\", \"الإمارات\", \"الكويت\"], \"questionAr\": \"في أي بلد يقع مقر اتصالات؟\", \"questionEn\": \"Which country is Etisalat headquartered?\", \"correctAnswer\": 2}], \"timeLimit\": 300, \"passingScore\": 70}','2026-01-09 03:36:28','2026-01-09 04:19:51',NULL,NULL,NULL,0),(134,21,'survey','WE Egypt Home Internet Survey','استبيان إنترنت WE المنزلي','Share your experience with WE home internet services.','شارك تجربتك مع خدمات إنترنت WE المنزلي.',20.00,20000.00,1000,0,4000.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم سرعة إنترنت WE المنزلي\", \"questionEn\": \"Rate WE home internet speed\"}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"30 Mbps\", \"50 Mbps\", \"100 Mbps\", \"200 Mbps\", \"Other\"], \"optionsAr\": [\"30 ميجا\", \"50 ميجا\", \"100 ميجا\", \"200 ميجا\", \"أخرى\"], \"questionAr\": \"ما باقة إنترنت WE لديك؟\", \"questionEn\": \"What is your WE internet plan?\"}, {\"id\": 3, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم استقرار الاتصال\", \"questionEn\": \"Rate connection stability\"}]}','2026-01-09 03:36:28','2026-01-09 04:17:05',NULL,NULL,NULL,0),(135,21,'app','WE App Download','تحميل تطبيق WE','Download WE app to manage your account and pay bills online.','حمل تطبيق WE لإدارة حسابك ودفع الفواتير عبر الإنترنت.',18.00,21600.00,1200,0,4320.00,'easy',8,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"steps\": [{\"id\": 1, \"instructionAr\": \"حمل تطبيق WE\", \"instructionEn\": \"Download WE app\"}, {\"id\": 2, \"instructionAr\": \"سجل الدخول برقم الخط الأرضي\", \"instructionEn\": \"Login with your landline number\"}], \"appName\": \"WE\", \"appStoreUrl\": \"https://play.google.com/store/apps/details?id=com.te.we\", \"packageName\": \"com.te.we\", \"requirements\": [\"Smartphone with iOS 14+ or Android 10+\", \"Active internet connection\", \"Valid phone number\"], \"verificationQuestions\": [{\"id\": 1, \"options\": [\"Internet & phone bills\", \"Only mobile\", \"Only electricity\", \"Nothing\"], \"optionsAr\": [\"فواتير الإنترنت والهاتف\", \"الموبايل فقط\", \"الكهرباء فقط\", \"لا شيء\"], \"questionAr\": \"ما الذي يمكنك دفعه في تطبيق WE؟\", \"questionEn\": \"What can you pay in WE app?\", \"correctAnswer\": 0}]}','2026-01-09 03:36:28','2026-01-09 04:38:39',NULL,NULL,NULL,0),(136,21,'video','WE Fiber Optic Video','فيديو WE فايبر أوبتك','Watch the WE Fiber Optic video and learn about the fastest home internet.','شاهد فيديو WE فايبر أوبتك وتعرف على أسرع إنترنت منزلي.',12.00,12000.00,1000,0,2400.00,'easy',4,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"Up to 100 Mbps\", \"10 Mbps\", \"5 Mbps\", \"1 Mbps\"], \"optionsAr\": [\"حتى 100 ميجابت\", \"10 ميجابت\", \"5 ميجابت\", \"1 ميجابت\"], \"questionAr\": \"ما السرعة القصوى لـ WE Fiber؟\", \"questionEn\": \"What is WE Fiber maximum speed?\", \"correctAnswer\": 0}], \"videoDuration\": 120}','2026-01-09 03:36:28','2026-01-09 04:37:22',NULL,NULL,NULL,0),(137,21,'social','Follow WE Egypt Social','تابع WE Egypt على السوشيال','Follow WE Egypt on social media for the latest offers.','تابع WE Egypt على وسائل التواصل الاجتماعي لأحدث العروض.',10.00,15000.00,1500,0,3000.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/WEEgypt\", \"descriptionEn\": \"Follow WE Egypt on Facebook\", \"descriptionAr\": \"تابع WE Egypt على فيسبوك\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is WE Egypt main service?\", \"questionAr\": \"ما الخدمة الرئيسية لـ WE مصر؟\", \"options\": [\"Landline & Internet\", \"Mobile only\", \"TV only\", \"None\"], \"optionsAr\": [\"الخط الأرضي والإنترنت\", \"الموبايل فقط\", \"التلفزيون فقط\", \"لا شيء\"], \"correctAnswer\": 0}]}','2026-01-09 03:36:28','2026-01-09 03:36:28',NULL,NULL,NULL,0),(138,21,'quiz','WE Services Quiz','اختبار خدمات WE','Test your knowledge about WE Egypt services!','اختبر معلوماتك حول خدمات WE مصر!',15.00,9000.00,600,0,1800.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Vodafone\", \"Orange\", \"Telecom Egypt\", \"Etisalat\"], \"optionsAr\": [\"فودافون\", \"أورانج\", \"المصرية للاتصالات\", \"اتصالات\"], \"questionAr\": \"ما الشركة التي تملك WE؟\", \"questionEn\": \"What company owns WE?\", \"correctAnswer\": 2}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Satellite\", \"Fiber Optic\", \"Dial-up\", \"Mobile only\"], \"optionsAr\": [\"قمر صناعي\", \"ألياف ضوئية\", \"اتصال هاتفي\", \"موبايل فقط\"], \"questionAr\": \"ما نوع الإنترنت الذي تقدمه WE للمنازل؟\", \"questionEn\": \"What type of internet does WE offer for homes?\", \"correctAnswer\": 1}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"010\", \"011\", \"012\", \"02\"], \"optionsAr\": [\"010\", \"011\", \"012\", \"02\"], \"questionAr\": \"ما كود الخط الأرضي لـ WE في مصر؟\", \"questionEn\": \"What is WE landline code in Egypt?\", \"correctAnswer\": 3}], \"timeLimit\": 240, \"passingScore\": 60}','2026-01-09 03:36:28','2026-01-09 04:19:51',NULL,NULL,NULL,0),(139,22,'survey','Juhayna Product Survey','استبيان منتجات جهينة','Share your preferences about Juhayna dairy products.','شارك تفضيلاتك حول منتجات جهينة للألبان.',15.00,22500.00,1500,1,4500.00,'easy',5,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Milk\", \"Juice\", \"Yogurt\", \"Cheese\", \"All\"], \"optionsAr\": [\"حليب\", \"عصير\", \"زبادي\", \"جبنة\", \"الكل\"], \"questionAr\": \"ما منتج جهينة الذي تشتريه أكثر؟\", \"questionEn\": \"Which Juhayna product do you buy most?\"}, {\"id\": 2, \"type\": \"rating\", \"options\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"optionsAr\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"questionAr\": \"قيم جودة منتجات جهينة\", \"questionEn\": \"Rate Juhayna product quality\"}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Daily\", \"Weekly\", \"Bi-weekly\", \"Monthly\", \"Occasionally\"], \"optionsAr\": [\"يومياً\", \"أسبوعياً\", \"كل أسبوعين\", \"شهرياً\", \"أحياناً\"], \"questionAr\": \"كم مرة تشتري منتجات جهينة؟\", \"questionEn\": \"How often do you buy Juhayna products?\"}, {\"id\": 4, \"type\": \"text\", \"questionAr\": \"ما منتج جهينة الجديد الذي تريده؟\", \"questionEn\": \"What new Juhayna product would you like?\"}]}','2026-01-09 03:36:28','2026-01-09 05:22:35',NULL,NULL,NULL,0),(140,22,'video','Juhayna Pure Campaign Video','فيديو حملة جهينة Pure','Watch the Juhayna Pure juice campaign video.','شاهد فيديو حملة عصير جهينة Pure.',10.00,15000.00,1500,0,3000.00,'easy',3,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"videoUrl\": \"/videos/sample_product_video.mp4\", \"questions\": [{\"id\": 1, \"options\": [\"100% Real Fruit\", \"Concentrate\", \"Artificial\", \"Mixed\"], \"optionsAr\": [\"100% فاكهة حقيقية\", \"مركز\", \"صناعي\", \"مختلط\"], \"questionAr\": \"من ماذا يصنع جهينة Pure؟\", \"questionEn\": \"What is Juhayna Pure made from?\", \"correctAnswer\": 0}], \"videoDuration\": 90}','2026-01-09 03:36:28','2026-01-09 04:37:22',NULL,NULL,NULL,0),(141,22,'quiz','Juhayna Quiz Challenge','تحدي اختبار جهينة','Test your knowledge about Juhayna products and history!','اختبر معلوماتك حول منتجات وتاريخ جهينة!',16.00,12800.00,800,0,2560.00,'easy',6,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"questions\": [{\"id\": 1, \"type\": \"multiple_choice\", \"options\": [\"Snacks\", \"Dairy Products\", \"Beverages\", \"Bakery\"], \"optionsAr\": [\"وجبات خفيفة\", \"منتجات ألبان\", \"مشروبات\", \"مخبوزات\"], \"questionAr\": \"ما المنتج الرئيسي لجهينة؟\", \"questionEn\": \"What is Juhayna main product?\", \"correctAnswer\": 1}, {\"id\": 2, \"type\": \"multiple_choice\", \"options\": [\"Juhayna Juice\", \"Pure\", \"Fresh\", \"Natural\"], \"optionsAr\": [\"عصير جهينة\", \"بيور\", \"فريش\", \"ناتشورال\"], \"questionAr\": \"ما اسم علامة عصير جهينة؟\", \"questionEn\": \"What is Juhayna juice brand called?\", \"correctAnswer\": 1}, {\"id\": 3, \"type\": \"multiple_choice\", \"options\": [\"Saudi Arabia\", \"UAE\", \"Egypt\", \"Jordan\"], \"optionsAr\": [\"السعودية\", \"الإمارات\", \"مصر\", \"الأردن\"], \"questionAr\": \"من أي بلد جهينة؟\", \"questionEn\": \"Which country is Juhayna from?\", \"correctAnswer\": 2}, {\"id\": 4, \"type\": \"multiple_choice\", \"options\": [\"Red\", \"Blue\", \"Green\", \"Orange\"], \"optionsAr\": [\"أحمر\", \"أزرق\", \"أخضر\", \"برتقالي\"], \"questionAr\": \"ما لون علامة جهينة التجارية؟\", \"questionEn\": \"What color is Juhayna brand?\", \"correctAnswer\": 2}], \"timeLimit\": 240, \"passingScore\": 60}','2026-01-09 03:36:28','2026-01-09 04:19:51',NULL,NULL,NULL,0),(142,22,'social','Follow Juhayna Social','تابع جهينة على السوشيال','Follow Juhayna on social media for the latest products and recipes.','تابع جهينة على وسائل التواصل الاجتماعي لأحدث المنتجات والوصفات.',8.00,16000.00,2000,0,3200.00,'easy',3,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"actions\": [{\"id\": 1, \"type\": \"follow\", \"platform\": \"facebook\", \"url\": \"https://www.facebook.com/JuhaynaEgypt\", \"descriptionEn\": \"Follow Juhayna on Facebook\", \"descriptionAr\": \"تابع جهينة على فيسبوك\"}, {\"id\": 2, \"type\": \"follow\", \"platform\": \"instagram\", \"url\": \"https://www.instagram.com/juhaynaegypt\", \"descriptionEn\": \"Follow Juhayna on Instagram\", \"descriptionAr\": \"تابع جهينة على انستغرام\"}], \"proofRequired\": true, \"proofType\": \"username\", \"verificationQuestions\": [{\"id\": 1, \"questionEn\": \"What is Juhayna main color?\", \"questionAr\": \"ما اللون الرئيسي لجهينة؟\", \"options\": [\"Blue\", \"Red\", \"Green\", \"Yellow\"], \"optionsAr\": [\"أزرق\", \"أحمر\", \"أخضر\", \"أصفر\"], \"correctAnswer\": 0}]}','2026-01-09 03:36:28','2026-01-09 03:36:28',NULL,NULL,NULL,0),(143,22,'photo','Juhayna Photo Challenge','تحدي صور جهينة','Take a creative photo with any Juhayna product.','التقط صورة إبداعية مع أي منتج جهينة.',22.00,11000.00,500,0,2200.00,'medium',15,'active',NULL,NULL,NULL,NULL,NULL,0,0,NULL,'automatic',80,80,'{\"requirements\": [{\"id\": 1, \"descriptionEn\": \"Photo must include a Juhayna product\", \"descriptionAr\": \"يجب أن تتضمن الصورة منتج جهينة\", \"required\": true}, {\"id\": 2, \"descriptionEn\": \"Photo should be creative\", \"descriptionAr\": \"يجب أن تكون الصورة إبداعية\", \"required\": true}], \"maxPhotos\": 3, \"minPhotos\": 1, \"allowCaption\": true, \"guidelinesEn\": [\"Include Juhayna product clearly\", \"Good lighting\", \"Be creative\"], \"guidelinesAr\": [\"أظهر منتج جهينة بوضوح\", \"إضاءة جيدة\", \"كن مبدعاً\"]}','2026-01-09 03:36:28','2026-01-09 03:36:28',NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

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
  `commissionAmount` decimal(10,2) DEFAULT '0.00',
  `commissionRate` decimal(5,2) DEFAULT '0.00',
  `netAmount` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `relatedTaskId` (`relatedTaskId`),
  KEY `relatedUserTaskId` (`relatedUserTaskId`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`relatedTaskId`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`relatedUserTaskId`) REFERENCES `userTasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (19,1237,'earn',25.00,0.00,25.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-17 14:19:29',0.00,0.00,0.00),(20,845,'earn',25.00,538.00,563.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-17 16:56:03',0.00,0.00,0.00),(21,1421,'earn',25.00,30.00,55.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-17 20:35:10',0.00,0.00,0.00),(22,1436,'earn',25.00,0.00,25.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-17 23:15:36',0.00,0.00,0.00),(23,1534,'earn',25.00,0.00,25.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-20 22:24:27',0.00,0.00,0.00),(24,1590,'earn',25.00,0.00,25.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-20 23:21:17',0.00,0.00,0.00),(25,1590,'earn',30.00,25.00,55.00,'Survey completed: Samsung Customer Experience Survey',60,NULL,'completed','2025-12-20 23:46:31',0.00,0.00,0.00),(26,1906,'earn',8.00,0.00,8.00,'Profile completion reward',NULL,NULL,'completed','2025-12-21 00:18:24',0.00,0.00,0.00),(27,1906,'earn',25.00,8.00,33.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-21 00:21:30',0.00,0.00,0.00),(28,2038,'earn',25.00,0.00,25.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-21 23:42:44',0.00,0.00,0.00),(29,2038,'earn',30.00,25.00,55.00,'Survey completed: Samsung Customer Experience Survey',60,NULL,'completed','2025-12-21 23:55:07',0.00,0.00,0.00),(30,2081,'earn',30.00,0.00,30.00,'Survey completed: Samsung Customer Experience Survey',60,NULL,'completed','2025-12-22 01:11:22',0.00,0.00,0.00),(31,2081,'earn',25.00,30.00,55.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-22 01:13:56',0.00,0.00,0.00),(32,2169,'earn',25.00,0.00,25.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-22 02:52:43',0.00,0.00,0.00),(33,2169,'earn',30.00,25.00,55.00,'Survey completed: Samsung Customer Experience Survey',60,NULL,'completed','2025-12-22 02:55:32',0.00,0.00,0.00),(34,2196,'earn',30.00,0.00,30.00,'Survey completed: Samsung Customer Experience Survey',60,NULL,'completed','2025-12-23 22:24:19',0.00,0.00,0.00),(35,2196,'earn',8.00,30.00,38.00,'Profile completion reward',NULL,NULL,'completed','2025-12-23 22:26:52',0.00,0.00,0.00),(36,2196,'earn',25.00,38.00,63.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-23 22:31:01',0.00,0.00,0.00),(37,2394,'earn',30.00,0.00,30.00,'Survey completed: Samsung Customer Experience Survey',60,NULL,'completed','2025-12-24 18:38:38',0.00,0.00,0.00),(38,2442,'earn',30.00,0.00,30.00,'Survey completed: Samsung Customer Experience Survey',60,NULL,'completed','2025-12-28 02:58:28',0.00,0.00,0.00),(39,2471,'earn',25.00,0.00,25.00,'Task completed: Watch Samsung Galaxy Z Fold7 Launch Video',31,NULL,'completed','2025-12-28 05:55:40',0.00,0.00,0.00),(40,1401,'earn',25.00,350.00,375.00,'Survey completed: Mansour Automotive Survey',124,NULL,'completed','2026-01-09 05:00:38',5.00,20.00,25.00),(41,1401,'earn',22.00,397.00,419.00,'Task completed: Mansour Automotive Quiz',128,NULL,'completed','2026-01-09 05:05:57',4.40,20.00,22.00),(42,2759,'earn',15.00,0.00,15.00,'Survey completed: Juhayna Product Survey',139,NULL,'completed','2026-01-09 05:22:35',3.00,20.00,15.00),(43,2892,'earn',25.00,0.00,25.00,'Survey completed: Mansour Automotive Survey',124,NULL,'completed','2026-01-09 06:34:42',5.00,20.00,25.00),(44,2892,'earn',22.00,47.00,69.00,'Task completed: Mansour Automotive Quiz',128,NULL,'completed','2026-01-09 06:37:59',4.40,20.00,22.00);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userTasks`
--

LOCK TABLES `userTasks` WRITE;
/*!40000 ALTER TABLE `userTasks` DISABLE KEYS */;
INSERT INTO `userTasks` VALUES (8,1237,31,'completed','2025-12-17 14:19:29','2025-12-17 14:19:29',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(9,845,31,'completed','2025-12-17 16:56:03','2025-12-17 16:56:03',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(10,1421,31,'completed','2025-12-17 20:35:10','2025-12-17 20:35:10',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(11,1436,31,'completed','2025-12-17 23:15:36','2025-12-17 23:15:36',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(12,1534,31,'completed','2025-12-20 22:24:27','2025-12-20 22:24:27',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(13,1590,31,'completed','2025-12-20 23:21:17','2025-12-20 23:21:17',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(14,1906,31,'completed','2025-12-21 00:21:30','2025-12-21 00:21:30',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(15,2038,31,'completed','2025-12-21 23:42:44','2025-12-21 23:42:44',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(16,2081,31,'completed','2025-12-22 01:13:56','2025-12-22 01:13:56',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(17,2169,31,'completed','2025-12-22 02:52:43','2025-12-22 02:52:43',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(18,2196,31,'completed','2025-12-23 22:31:01','2025-12-23 22:31:01',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(19,2471,31,'completed','2025-12-28 05:55:40','2025-12-28 05:55:40',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":202,\"questionText\":\"What is the name of the phone featured in the video?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":203,\"questionText\":\"What type of phone is the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true},{\"questionId\":204,\"questionText\":\"Which company manufactures the Galaxy Z Fold7?\",\"userAnswer\":\"B\",\"correctAnswer\":\"B\",\"isCorrect\":true}]}',NULL,25.00),(20,1401,128,'completed','2026-01-09 05:05:57','2026-01-09 05:05:57',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":245,\"questionText\":\"Which car brands does Mansour sell?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":246,\"questionText\":\"What is Mansour Group?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":247,\"questionText\":\"What is Metro Market?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":248,\"questionText\":\"Which fast food does Mansour operate in Egypt?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true}]}',NULL,22.00),(21,2892,128,'completed','2026-01-09 06:37:59','2026-01-09 06:37:59',NULL,NULL,'{\"score\":100,\"answers\":[{\"questionId\":245,\"questionText\":\"Which car brands does Mansour sell?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":246,\"questionText\":\"What is Mansour Group?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":247,\"questionText\":\"What is Metro Market?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true},{\"questionId\":248,\"questionText\":\"Which fast food does Mansour operate in Egypt?\",\"userAnswer\":\"A\",\"correctAnswer\":\"A\",\"isCorrect\":true}]}',NULL,22.00);
/*!40000 ALTER TABLE `userTasks` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `user_badges`
--

LOCK TABLES `user_badges` WRITE;
/*!40000 ALTER TABLE `user_badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_badges` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `user_bounty_responses`
--

LOCK TABLES `user_bounty_responses` WRITE;
/*!40000 ALTER TABLE `user_bounty_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_bounty_responses` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `user_challenges`
--

LOCK TABLES `user_challenges` WRITE;
/*!40000 ALTER TABLE `user_challenges` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_challenges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_consents`
--

DROP TABLE IF EXISTS `user_consents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_consents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `consentType` enum('mandatory_kyc','personalization','analytics','marketing','data_sharing') NOT NULL,
  `isGranted` tinyint(1) DEFAULT '0',
  `grantedAt` timestamp NULL DEFAULT NULL,
  `withdrawnAt` timestamp NULL DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `userAgent` text,
  `version` varchar(20) DEFAULT '1.0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_consent` (`userId`,`consentType`),
  CONSTRAINT `user_consents_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_consents`
--

LOCK TABLES `user_consents` WRITE;
/*!40000 ALTER TABLE `user_consents` DISABLE KEYS */;
INSERT INTO `user_consents` VALUES (1,1400,'mandatory_kyc',1,'2025-12-17 17:33:32',NULL,'41.33.100.50',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(2,1400,'personalization',0,NULL,NULL,'41.33.100.50',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(3,1400,'analytics',1,'2025-12-17 17:33:32',NULL,'41.33.100.50',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(4,1400,'marketing',0,NULL,NULL,'41.33.100.50',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(5,1401,'mandatory_kyc',1,'2025-12-17 17:33:32',NULL,'156.204.50.10',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(6,1401,'personalization',1,'2025-12-17 17:33:32',NULL,'156.204.50.10',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(7,1401,'analytics',1,'2025-12-17 17:33:32',NULL,'156.204.50.10',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(8,1401,'marketing',1,'2025-12-17 17:33:32',NULL,'156.204.50.10',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(9,1402,'mandatory_kyc',1,'2025-12-17 17:33:32',NULL,'197.160.10.5',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(10,1402,'personalization',1,'2025-12-17 17:33:32',NULL,'197.160.10.5',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(11,1402,'analytics',1,'2025-12-17 17:33:32',NULL,'197.160.10.5',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(12,1402,'marketing',1,'2025-12-17 17:33:32',NULL,'197.160.10.5',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(13,1402,'data_sharing',1,'2025-12-17 17:33:32',NULL,'197.160.10.5',NULL,'1.0','2025-12-17 17:33:32','2025-12-17 17:33:32'),(14,1436,'mandatory_kyc',1,'2025-12-17 23:12:58',NULL,'196.137.160.80',NULL,'1.0','2025-12-17 23:12:58','2025-12-17 23:12:58'),(15,1436,'analytics',1,'2025-12-17 23:12:58',NULL,'196.137.160.80',NULL,'1.0','2025-12-17 23:12:58','2025-12-17 23:12:58'),(16,1477,'mandatory_kyc',1,'2025-12-18 00:50:36',NULL,'41.44.5.207',NULL,'1.0','2025-12-18 00:50:36','2025-12-18 00:50:36'),(17,1477,'analytics',1,'2025-12-18 00:50:36',NULL,'41.44.5.207',NULL,'1.0','2025-12-18 00:50:36','2025-12-18 00:50:36');
/*!40000 ALTER TABLE `user_consents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_devices`
--

DROP TABLE IF EXISTS `user_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `deviceId` varchar(255) DEFAULT NULL,
  `deviceBrand` varchar(100) DEFAULT NULL,
  `deviceModel` varchar(100) DEFAULT NULL,
  `osName` varchar(50) DEFAULT NULL,
  `osVersion` varchar(50) DEFAULT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `countryCode` varchar(5) DEFAULT NULL,
  `isCurrentDevice` tinyint(1) DEFAULT '0',
  `lastSeenAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `user_devices_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_devices`
--

LOCK TABLES `user_devices` WRITE;
/*!40000 ALTER TABLE `user_devices` DISABLE KEYS */;
INSERT INTO `user_devices` VALUES (1,1400,'device_ahmed_001','Samsung','Galaxy A52','Android','13','Vodafone EG','41.33.100.50','Cairo','Egypt','EG',0,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(2,1401,'device_fatima_002','Apple','iPhone 14 Pro','iOS','17.2','Orange EG','156.204.50.10','Alexandria','Egypt','EG',1,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(3,1402,'device_khaled_003','Google','Pixel 8 Pro','Android','14','Etisalat EG','197.160.10.5','Nasr City','Egypt','EG',1,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(4,1400,'device_1400_1766012412158','Android','Unknown','Android','Unknown',NULL,'98.91.224.122',NULL,NULL,NULL,1,'2025-12-17 23:00:12','2025-12-17 23:00:12'),(5,1436,'device_1436_1766013178076','Android','Unknown','Android','Unknown',NULL,'196.137.160.80',NULL,NULL,NULL,1,'2025-12-17 23:12:58','2025-12-17 23:12:58'),(6,1477,'device_1477_1766019036969','Android','Unknown','Android','Unknown',NULL,'41.44.5.207',NULL,NULL,NULL,1,'2025-12-18 00:50:36','2025-12-18 00:50:36');
/*!40000 ALTER TABLE `user_devices` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `user_levels`
--

LOCK TABLES `user_levels` WRITE;
/*!40000 ALTER TABLE `user_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_levels` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `user_profile_completions`
--

LOCK TABLES `user_profile_completions` WRITE;
/*!40000 ALTER TABLE `user_profile_completions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_profile_completions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profile_data`
--

DROP TABLE IF EXISTS `user_profile_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `questionKey` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `answerValue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_question` (`userId`,`questionKey`),
  CONSTRAINT `user_profile_data_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profile_data`
--

LOCK TABLES `user_profile_data` WRITE;
/*!40000 ALTER TABLE `user_profile_data` DISABLE KEYS */;
INSERT INTO `user_profile_data` VALUES (1,1401,'shopping_frequency','2-3 times a month','2025-12-17 17:33:32','2025-12-17 17:33:32'),(2,1401,'preferred_brands','Apple, Nike, Zara','2025-12-17 17:33:32','2025-12-17 17:33:32'),(3,1401,'future_plans','Planning a vacation','2025-12-17 17:33:32','2025-12-17 17:33:32'),(4,1401,'preferred_categories','Fashion, Electronics, Travel','2025-12-17 17:33:32','2025-12-17 17:33:32'),(5,1401,'income_range','15000-25000 EGP','2025-12-17 17:33:32','2025-12-17 17:33:32'),(6,1402,'shopping_frequency','Weekly','2025-12-17 17:33:32','2025-12-17 17:33:32'),(7,1402,'preferred_brands','Toyota, Samsung, Adidas','2025-12-17 17:33:32','2025-12-17 17:33:32'),(8,1402,'future_plans','Buying a new TV','2025-12-17 17:33:32','2025-12-17 17:33:32'),(9,1402,'preferred_categories','Electronics, Automotive, Sports','2025-12-17 17:33:32','2025-12-17 17:33:32'),(10,1402,'income_range','25000-40000 EGP','2025-12-17 17:33:32','2025-12-17 17:33:32'),(11,1402,'hobbies','Football, Gaming','2025-12-17 17:33:32','2025-12-17 17:33:32'),(12,1402,'payment_method','Credit Card','2025-12-17 17:33:32','2025-12-17 17:33:32'),(13,1402,'vehicle_owned','Toyota Corolla 2022','2025-12-17 17:33:32','2025-12-17 17:33:32'),(14,1402,'home_ownership','Renting','2025-12-17 17:33:32','2025-12-17 17:33:32'),(15,1402,'family_size','3 (Married with 1 child)','2025-12-17 17:33:32','2025-12-17 17:33:32');
/*!40000 ALTER TABLE `user_profile_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_social_profiles`
--

DROP TABLE IF EXISTS `user_social_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_social_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `provider` enum('google','facebook','instagram','twitter','tiktok','spotify') NOT NULL,
  `socialId` varchar(255) NOT NULL,
  `email` varchar(320) DEFAULT NULL,
  `displayName` varchar(255) DEFAULT NULL,
  `profileUrl` text,
  `avatarUrl` text,
  `accessToken` text,
  `refreshToken` text,
  `profileData` json DEFAULT NULL,
  `connectedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lastSyncAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_social` (`userId`,`provider`),
  CONSTRAINT `user_social_profiles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_social_profiles`
--

LOCK TABLES `user_social_profiles` WRITE;
/*!40000 ALTER TABLE `user_social_profiles` DISABLE KEYS */;
INSERT INTO `user_social_profiles` VALUES (1,1401,'google','google_fatima_12345','fatima.z@gmail.com','Fatima Zahra',NULL,'https://lh3.googleusercontent.com/a/default-user',NULL,NULL,'{\"locale\": \"ar\", \"verified_email\": true}','2025-12-17 17:33:32',NULL),(2,1402,'facebook','fb_khaled_67890','khaled.m@yahoo.com','Khaled Mahmoud',NULL,'https://graph.facebook.com/khaled.m.123/picture',NULL,NULL,'{\"likes\": [\"Sports\", \"Technology\", \"Cars\"], \"friends_count\": 450}','2025-12-17 17:33:32',NULL);
/*!40000 ALTER TABLE `user_social_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_tasks`
--

DROP TABLE IF EXISTS `user_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `taskId` int NOT NULL,
  `status` enum('started','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'started',
  `completedAt` datetime DEFAULT NULL,
  `rewardAmount` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_user_task` (`userId`,`taskId`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tasks`
--

LOCK TABLES `user_tasks` WRITE;
/*!40000 ALTER TABLE `user_tasks` DISABLE KEYS */;
INSERT INTO `user_tasks` VALUES (1,1649,60,'completed','2025-12-20 20:19:59',30.00),(2,1653,60,'completed','2025-12-20 21:23:48',30.00);
/*!40000 ALTER TABLE `user_tasks` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `user_tier_unlocks`
--

LOCK TABLES `user_tier_unlocks` WRITE;
/*!40000 ALTER TABLE `user_tier_unlocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_tier_unlocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_verifications`
--

DROP TABLE IF EXISTS `user_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `verificationType` enum('phone','email','national_id','passport','drivers_license','utility_bill','selfie') NOT NULL,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `documentUrl` text,
  `extractedData` json DEFAULT NULL,
  `verifiedAt` timestamp NULL DEFAULT NULL,
  `rejectionReason` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_verification` (`userId`,`verificationType`),
  CONSTRAINT `user_verifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_verifications`
--

LOCK TABLES `user_verifications` WRITE;
/*!40000 ALTER TABLE `user_verifications` DISABLE KEYS */;
INSERT INTO `user_verifications` VALUES (1,1400,'phone','verified',NULL,'{\"phone\": \"+201001234567\", \"carrier\": \"Vodafone EG\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(2,1401,'phone','verified',NULL,'{\"phone\": \"+201119876543\", \"carrier\": \"Orange EG\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(3,1401,'email','verified',NULL,'{\"email\": \"fatima.z@gmail.com\", \"provider\": \"google\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(4,1401,'national_id','verified',NULL,'{\"gender\": \"female\", \"fullName\": \"Fatima Zahra\", \"nationalId\": \"29508150123456\", \"dateOfBirth\": \"1995-08-15\", \"nationality\": \"Egypt\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(5,1402,'phone','verified',NULL,'{\"phone\": \"+201223344556\", \"carrier\": \"Etisalat EG\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(6,1402,'email','verified',NULL,'{\"email\": \"khaled.m@yahoo.com\", \"provider\": \"facebook\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(7,1402,'national_id','verified',NULL,'{\"gender\": \"male\", \"fullName\": \"Khaled Mahmoud\", \"nationalId\": \"28803200987654\", \"dateOfBirth\": \"1988-03-20\", \"nationality\": \"Egypt\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(8,1402,'drivers_license','verified',NULL,'{\"expiryDate\": \"2027-06-15\", \"vehicleClass\": \"Private\", \"licenseNumber\": \"DL-12345\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(9,1402,'utility_bill','verified',NULL,'{\"address\": \"123 Nasr Rd, Nasr City, Cairo\", \"billDate\": \"2024-11-01\", \"billType\": \"Electricity\"}','2025-12-17 17:33:32',NULL,'2025-12-17 17:33:32','2025-12-17 17:33:32'),(10,1436,'phone','verified',NULL,'{\"phone\": \"+201001581287\"}','2025-12-17 23:12:58',NULL,'2025-12-17 23:12:58','2025-12-17 23:12:58'),(11,1477,'phone','verified',NULL,'{\"phone\": \"+201001681287\"}','2025-12-18 00:50:36',NULL,'2025-12-18 00:50:36','2025-12-18 00:50:36');
/*!40000 ALTER TABLE `user_verifications` ENABLE KEYS */;
UNLOCK TABLES;

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
  `kycLevel` int DEFAULT '0',
  `phoneVerified` tinyint(1) DEFAULT '0',
  `emailVerified` tinyint(1) DEFAULT '0',
  `fullName` varchar(255) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `address` text,
  `nationalId` varchar(50) DEFAULT NULL,
  `lastKycAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openId` (`openId`),
  UNIQUE KEY `referralCode` (`referralCode`),
  KEY `countryId` (`countryId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`countryId`) REFERENCES `countries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2970 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (843,'admin_001','Admin User','admin@taskkash.com','$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqxLlRFpO8s1rJLxHxGdLgv1tSuXa','email','admin',NULL,0.00,0,0.00,'tier1',100,1,NULL,1,0.00,'2025-12-11 20:33:12','2026-01-09 02:03:01','2026-01-09 02:03:01',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1400,'ahmed_001','Ahmed',NULL,'$2b$10$xrCY79DSOkyQ016/gK72zOGeO8FLMD/llLSTfNLjK9D5Dt4UR1TZy',NULL,'user','+201001234567',25.00,2,25.00,'tier1',40,NULL,NULL,0,0.00,'2025-12-17 17:33:32','2025-12-18 21:57:38','2025-12-18 00:16:13','AHMED001',NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,1,1,0,NULL,NULL,NULL,'Egypt',NULL,NULL,NULL),(1401,'fatima_002','Fatima Zahra','fatima.z@gmail.com','$2b$10$xrCY79DSOkyQ016/gK72zOGeO8FLMD/llLSTfNLjK9D5Dt4UR1TZy',NULL,'user','+201119876543',397.00,17,497.00,'tier2',75,NULL,NULL,1,0.00,'2025-12-17 17:33:32','2026-01-09 05:15:29','2026-01-09 05:15:30','FATIMA002',NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,2,1,1,'Fatima Zahra','1995-08-15','female','Egypt',NULL,NULL,NULL),(1402,'khaled_003','Khaled Mahmoud','khaled.m@yahoo.com','$2b$10$xrCY79DSOkyQ016/gK72zOGeO8FLMD/llLSTfNLjK9D5Dt4UR1TZy',NULL,'user','+201223344556',1250.00,45,1500.00,'tier3',95,NULL,NULL,1,0.00,'2025-12-17 17:33:32','2025-12-18 21:57:38','2025-12-17 17:33:32','KHALED003',NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,3,1,1,'Khaled Mahmoud','1988-03-20','male','Egypt','123 Nasr Rd, Nasr City, Cairo','28803200987654',NULL),(1421,'user_1766002785064_uekgsk9ar','Afnan header','Afnan_header@hotmail.com','$2b$10$wPEv14pAYSveUryaCDaD4epgXHftdBwDZz1Ljz0Zi4/3DuKDjAXAq',NULL,'user','+201227109226',55.00,1,25.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-17 20:19:45','2025-12-18 05:22:49','2025-12-18 05:22:50',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1436,'user_1766013178061_4i97e7rds','Ahmed Mr','ahmed.job@gmail.com','$2b$10$xrCY79DSOkyQ016/gK72zOGeO8FLMD/llLSTfNLjK9D5Dt4UR1TZy',NULL,'user','+201001581287',25.00,1,25.00,'tier1',40,NULL,NULL,0,0.00,'2025-12-17 23:12:58','2025-12-18 21:57:38','2025-12-17 23:17:48',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1477,'user_1766019036950_03jaya083',NULL,NULL,'$2b$10$xrCY79DSOkyQ016/gK72zOGeO8FLMD/llLSTfNLjK9D5Dt4UR1TZy',NULL,'user','+201001681287',0.00,0,0.00,'tier1',40,NULL,NULL,0,0.00,'2025-12-18 00:50:36','2025-12-18 21:57:38','2025-12-18 00:52:21',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1495,'user_1766019258448_lyh6ar884','Ahmed Mustafa','ahmed@xmail.com','$2b$10$k6ql.8PV327jxs6XEl2FseeoovRnCGEKC5a6kMo0hBWct4PJGvjJO',NULL,'user','+201001581287',8.00,0,0.00,'tier1',100,NULL,NULL,0,0.00,'2025-12-18 00:54:18','2025-12-18 00:56:11','2025-12-18 00:56:11',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1513,'user_1766096927647_fs7hqlhlj','Test User Manus','testuser.manus@gmail.com','$2b$10$2/E.WRuGAH2dUlyazkxG0.crKAoTNuklhOHLojZLv/6uOVkHOaHCG',NULL,'user','+201234567890',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-18 22:28:47','2025-12-18 22:36:36','2025-12-18 22:36:37',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1534,'user_1766269193302_oxetnyk7j','Test User Journey Dec21','testjourney.dec21@gmail.com','$2b$10$P25fTgKBMmv.Te1K2BcIOOmNUlDvAXYqQIb9ogmF0ZKPzKwMD8Som',NULL,'user','+201234567899',25.00,1,25.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-20 22:19:53','2025-12-20 23:48:25','2025-12-20 23:48:26',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1590,'user_1766272708777_gfuz2zd4h','Amgad Saad','Saad@mail.com','$2b$10$Vg.04QNr1puiWl03boyebedFAxo1HDPFU8s/ugcCGk/nq4IPHeLTG',NULL,'user','+201001581287',63.00,2,55.00,'tier1',100,NULL,'/uploads/avatars/avatar-1766274666748-754068479.jpg',0,0.00,'2025-12-20 23:18:28','2025-12-21 00:04:07','2025-12-21 00:04:07',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(1906,'user_1766276100653_jrl8tq70h','Hamza Said','hamza@mail.com','$2b$10$3qg/XdJhnZwr.8YOe1t3U.rzQxqTL0RL/g8Mw2L4TIDUDAFyAp3rO',NULL,'user','+201201581287',63.00,2,55.00,'tier1',100,NULL,'/uploads/avatars/avatar-1766277202450-399982013.jpg',0,0.00,'2025-12-21 00:15:00','2025-12-21 00:46:29','2025-12-21 00:46:29',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2038,'user_1766360215994_usdvi7bi4','Test User','testuser@example.com','$2b$10$r4ALUUXHVG2/0Ihb/X6oGer.HcaSIYLktvvHWFweFh2L7YCzs7WDO',NULL,'user','+201234567890',55.00,2,55.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-21 23:36:56','2025-12-22 00:27:16','2025-12-22 00:27:17',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2081,'user_1766363334636_bqygn4jym','Beta Tester User','betatester@example.com','$2b$10$z/BpNyia7.PRpoie4vdEyufreRHPPEXYq2Jm3YQQulnYl.2F0R4kG',NULL,'user','+201555555555',55.00,2,55.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-22 00:28:54','2025-12-22 02:50:07','2025-12-22 02:50:08',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2150,'user_1766368117041_r0rxqvv6s','Beta Tester User','beta.tester.user@manus.im','$2b$10$l/kD/Hq3sK0Tpvr6TYq.QOvPO6fPBJtKgLGyGjRhwiyDmwHFyXhXG',NULL,'user','+201234567890',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-22 01:48:37','2025-12-22 01:52:04','2025-12-22 01:52:05',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2169,'user_1766371851218_xelcu01j6','Comet Tester','comet.tester@example.com','$2b$10$BCv9OqY2tRmr8v8CmlXQPuetY4arWqZtX5bCWlKd08n4VAvXdOpJS',NULL,'user','01234567890',55.00,2,55.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-22 02:50:51','2025-12-27 23:31:00','2025-12-27 23:31:01',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2196,'user_1766528330227_ig7cfciyu','Moustafa Mohammed ','moustafa.makramm@gmail.com','$2b$10$x8s4AjHB7oixiQ2BVdraLedoasIdTn82C2H6B8aNyxyOm/.t3oe8e',NULL,'user','01070206309',63.00,2,55.00,'tier1',100,NULL,'/uploads/avatars/avatar-1766528876294-454894749.jpg',0,0.00,'2025-12-23 22:18:50','2025-12-24 22:09:11','2025-12-24 22:09:12',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2355,'user_1766536411675_b875lsfym','T Rex','Trex@email.com','$2b$10$fFQCoigQEFxTjh21hWlPyetP3eYlCkY0Yru49ox6pMMIkvTOmnal.',NULL,'user','+20100200300',0.00,0,0.00,'tier1',0,NULL,'/uploads/avatars/avatar-1766537087973-348391179.jpg',0,0.00,'2025-12-24 00:33:31','2026-01-03 00:05:22','2026-01-03 00:05:23',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2394,'user_1766601459395_zvs86y9m6','Amr Morsey','amr@zmaxmedia.com','$2b$10$dBsIF2s61JZ9aIXMqfV9BeNa.Cs4twH/sD9wDptUuFOlMrGGCNB9a',NULL,'user','+201005714100',30.00,1,30.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-24 18:37:39','2025-12-24 20:16:39','2025-12-24 20:16:40',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2422,'user_1766878463192_jeyhnqzfa','Ahmed Comet','test.comet@beta.taskkash.io','$2b$10$UMOOd1J.FW9hhJbhgN7zm.VfpFTNmxPI94lqzeSBfCoRvm2QRghf.',NULL,'user','+201012345678',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-27 23:34:23','2025-12-28 02:55:58','2025-12-28 02:55:59',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2442,'user_1766890598717_1ogxl17cl','TestUser Comprehensive','comptest@taskkash.com','$2b$10$rUL7QsgGoKYtYSyCWaVgy.pfQkk8V8Y1qMhYyI5ocpKZM/OIZ.U1e',NULL,'user','+201098765432',30.00,1,30.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-28 02:56:38','2025-12-28 05:51:26','2025-12-28 05:51:27',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2471,'user_1766901167363_f5vqwoj7k','Test User Review','reviewtest@taskkash.com','$2b$10$WqTUR6B0QJkOvK97VCTreeoiwUMd7zapf.gu2z7vAYckRfna9HSY.',NULL,'user','+201234567899',25.00,1,25.00,'tier1',0,NULL,NULL,0,0.00,'2025-12-28 05:52:47','2025-12-28 05:55:40','2025-12-28 05:55:41',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2488,'user_1767845537547_lk21sjun9','Ahmed Hassan','ahmed.hassan@testmail.com','$2b$10$DQ/08mYCqnIlj.CzkJMrduK/sXq07x2rupEi.FH69ooRPx8uAzfNa',NULL,'user','+201234567890',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2026-01-08 04:12:17','2026-01-08 04:25:30','2026-01-08 04:25:31',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2533,'user_1767918664622_u4ztgju06','Test User Journey','testjourney2026@taskkash.com','$2b$10$GB2OK6ITI83cXMkR//Dk4eluhdApbQZrn6msBFPGrzTxxFwe35FL2',NULL,'user','+201001234567',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2026-01-09 00:31:04','2026-01-09 00:31:57','2026-01-09 00:31:58',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2540,'user_1767922991010_lf5h7fipe','Test Comprehensive User','testcomprehensive2026@taskkash.com','$2b$10$yur5B8lKhh1qoM4ze2mgyOCcXteuX0K7paPWFQ1lh9UU/kQwMWhtS',NULL,'user','+201009876543',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2026-01-09 01:43:11','2026-01-09 01:57:11','2026-01-09 01:57:11',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2549,'user_1767929906046_5h24y67eq','Test User','testuser2026@taskkash.com','$2b$10$tmbAYmLbAGSpIIPswKV9cen.Bg/sJPkPMeKnFkSynkHQfw6/UCjAq',NULL,'user','+201234567890',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2026-01-09 03:38:26','2026-01-09 03:52:43','2026-01-09 03:52:44',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2597,'user_1767931143884_qktjj6ykr','Ahmed Mahmoud','a@mail.com','$2b$10$X6DbkUvQHJuDnVek9nvVmuIF1nYD7GSHpwgXd6WPfpw1G.4l04Cki',NULL,'user','+966573006793',0.00,0,0.00,'tier1',0,NULL,NULL,0,0.00,'2026-01-09 03:59:03','2026-01-09 06:51:05','2026-01-09 06:51:05',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2759,'user_1767935782848_q4kcyeggk','Test User Registration','testuser2026@test.com','$2b$10$r/xUOiLGKTMHAizhECsieOUK3gWddCtlQtU0rJBq0DLpRccWpsENa',NULL,'user','+201234567890',15.00,1,15.00,'tier1',0,NULL,NULL,0,0.00,'2026-01-09 05:16:22','2026-01-09 06:27:35','2026-01-09 06:27:36',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2892,'user_1767940157698_52xaeg8a3','Test Journey User','testjourney@test.com','$2b$10$IDqPf38JEzMc0iUKM1IVHe4vpyepjVk65unOEe7pwEvx9cTEa6266',NULL,'user','+201234567899',47.00,2,47.00,'tier1',0,NULL,NULL,0,0.00,'2026-01-09 06:29:17','2026-01-09 06:45:12','2026-01-09 06:45:13',NULL,NULL,0,0.00,1,0.00,0,0,NULL,0.00,0.00,1.00,NULL,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `weekly_challenges`
--

LOCK TABLES `weekly_challenges` WRITE;
/*!40000 ALTER TABLE `weekly_challenges` DISABLE KEYS */;
/*!40000 ALTER TABLE `weekly_challenges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawal_methods`
--

DROP TABLE IF EXISTS `withdrawal_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawal_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nameEn` varchar(100) NOT NULL,
  `nameAr` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT 'wallet',
  `minAmount` decimal(10,2) DEFAULT '50.00',
  `maxAmount` decimal(10,2) DEFAULT '10000.00',
  `processingTime` varchar(100) DEFAULT '1-3 business days',
  `fee` decimal(10,2) DEFAULT '0.00',
  `feeType` enum('fixed','percentage') DEFAULT 'fixed',
  `isEnabled` tinyint(1) DEFAULT '1',
  `sortOrder` int DEFAULT '0',
  `requiredFields` json DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `order` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawal_methods`
--

LOCK TABLES `withdrawal_methods` WRITE;
/*!40000 ALTER TABLE `withdrawal_methods` DISABLE KEYS */;
INSERT INTO `withdrawal_methods` VALUES (1,'Vodafone Cash','فودافون كاش','smartphone',10.00,5000.00,'Instant - 24 hours',0.00,'fixed',1,0,'[\"phoneNumber\"]','2025-12-20 20:51:00',1),(2,'InstaPay','انستاباي','credit-card',10.00,10000.00,'Instant - 2 hours',0.00,'fixed',1,0,'[\"phoneNumber\", \"bankName\"]','2025-12-20 20:51:00',2),(3,'Bank Transfer','تحويل بنكي','building',100.00,50000.00,'1-3 business days',10.00,'fixed',1,0,'[\"bankName\", \"accountNumber\", \"accountHolderName\"]','2025-12-20 20:51:00',3);
/*!40000 ALTER TABLE `withdrawal_methods` ENABLE KEYS */;
UNLOCK TABLES;

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
  `commissionRate` decimal(5,2) DEFAULT '0.00',
  `commissionAmount` decimal(10,2) DEFAULT '0.00',
  `netAmount` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `transactionId` (`transactionId`),
  KEY `idx_user_status` (`userId`,`status`),
  KEY `idx_status` (`status`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `withdrawal_requests_ibfk_2` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawal_requests`
--

LOCK TABLES `withdrawal_requests` WRITE;
/*!40000 ALTER TABLE `withdrawal_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `withdrawal_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-09  7:09:23
