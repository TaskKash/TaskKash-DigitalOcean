
# TaskKash Database Schema

This document provides a detailed overview of the TaskKash database schema, including table structures, relationships, and data types.

## 1. Database Requirements

- **Database System**: MySQL
- **Version**: 8.x or higher
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## 2. Schema Diagram

A visual representation of the table relationships will be provided here in future versions.

## 3. Table Definitions

### 3.1. `users`

Stores user account information, balances, and profile details.

| Column                | Type                                       | Constraints                 | Description                                      |
|-----------------------|--------------------------------------------|-----------------------------|--------------------------------------------------|
| `id`                  | `INT`                                      | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each user.                 |
| `name`                | `VARCHAR(255)`                             | `NOT NULL`                  | User's full name.                                |
| `email`               | `VARCHAR(255)`                             | `NOT NULL`, `UNIQUE`        | User's email address.                            |
| `password`            | `VARCHAR(255)`                             | `NOT NULL`                  | Hashed password.                                 |
| `role`                | `ENUM('user', 'admin', 'advertiser')`      | `NOT NULL`, `DEFAULT 'user'`  | User's role in the system.                       |
| `balance`             | `DECIMAL(10, 2)`                           | `NOT NULL`, `DEFAULT 0.00`    | Current account balance.                         |
| `totalEarnings`       | `DECIMAL(10, 2)`                           | `NOT NULL`, `DEFAULT 0.00`    | Lifetime earnings.                               |
| `profileStrength`     | `INT`                                      | `NOT NULL`, `DEFAULT 0`       | Profile completion percentage (0-100).           |
| `createdAt`           | `TIMESTAMP`                                | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of account creation.                   |
| `updatedAt`           | `TIMESTAMP`                                | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of the last profile update.            |

### 3.2. `advertisers`

Stores information about the companies or individuals who post tasks.

| Column        | Type           | Constraints                 | Description                                      |
|---------------|----------------|-----------------------------|--------------------------------------------------|
| `id`          | `INT`          | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each advertiser.           |
| `name`        | `VARCHAR(255)` | `NOT NULL`                  | Advertiser's name.                               |
| `logo`        | `VARCHAR(255)` |                             | URL to the advertiser's logo.                    |
| `website`     | `VARCHAR(255)` |                             | Advertiser's official website.                   |
| `createdAt`   | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of advertiser registration.            |

### 3.3. `tasks`

Contains all the tasks that users can complete to earn rewards.

| Column                | Type                               | Constraints                 | Description                                      |
|-----------------------|------------------------------------|-----------------------------|--------------------------------------------------|
| `id`                  | `INT`                              | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each task.                 |
| `advertiserId`        | `INT`                              | `FOREIGN KEY (advertisers.id)`| The advertiser who created the task.             |
| `title`               | `VARCHAR(255)`                     | `NOT NULL`                  | Title of the task.                               |
| `description`         | `TEXT`                             | `NOT NULL`                  | Detailed description of the task.                |
| `reward`              | `DECIMAL(10, 2)`                   | `NOT NULL`                  | Amount to be paid upon successful completion.    |
| `videoUrl`            | `VARCHAR(255)`                     | `NOT NULL`                  | URL of the video to be watched.                  |
| `duration`            | `INT`                              | `NOT NULL`                  | Actual duration of the video in seconds.         |
| `status`              | `ENUM('active', 'inactive', 'completed')` | `NOT NULL`, `DEFAULT 'active'` | Current status of the task.                      |
| `createdAt`           | `TIMESTAMP`                        | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of task creation.                      |

### 3.4. `questions`

Stores the verification questions associated with each video task.

| Column        | Type           | Constraints                 | Description                                      |
|---------------|----------------|-----------------------------|--------------------------------------------------|
| `id`          | `INT`          | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each question.             |
| `taskId`      | `INT`          | `FOREIGN KEY (tasks.id)`    | The task to which this question belongs.         |
| `question`    | `TEXT`         | `NOT NULL`                  | The text of the question.                        |
| `options`     | `JSON`         | `NOT NULL`                  | A JSON array of possible answers.                |
| `correctOption` | `INT`          | `NOT NULL`                  | The index of the correct option in the `options` array. |

### 3.5. `transactions`

Logs all financial transactions, including earnings and withdrawals.

| Column        | Type                               | Constraints                 | Description                                      |
|---------------|------------------------------------|-----------------------------|--------------------------------------------------|
| `id`          | `INT`                              | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for each transaction.          |
| `userId`      | `INT`                              | `FOREIGN KEY (users.id)`    | The user involved in the transaction.            |
| `taskId`      | `INT`                              | `FOREIGN KEY (tasks.id)`    | The task related to the transaction (if applicable). |
| `type`        | `ENUM('earn', 'withdraw', 'bonus', 'refund')` | `NOT NULL`                  | The type of transaction.                         |
| `amount`      | `DECIMAL(10, 2)`                   | `NOT NULL`                  | The amount of the transaction.                   |
| `status`      | `ENUM('completed', 'pending', 'failed')` | `NOT NULL`, `DEFAULT 'completed'` | The status of the transaction.                   |
| `createdAt`   | `TIMESTAMP`                        | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of the transaction.                    |

## 4. SQL Schema File

The complete SQL script for creating this schema is available in the `taskkash_schema.sql` file included in this package.

```sql
-- Example from taskkash_schema.sql

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','advertiser') NOT NULL DEFAULT 'user',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `totalEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
  `profileStrength` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ... and so on for all other tables.
```

This structured documentation ensures that any developer can understand and set up the database required for the TaskKash application, minimizing the risk of deployment issues.
