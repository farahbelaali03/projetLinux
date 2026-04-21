-- ================================================
-- DATABASE: todolist
-- ================================================
CREATE DATABASE IF NOT EXISTS todolist;
USE todolist;

-- Table 1 : users
CREATE TABLE users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table 2 : categories
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    color       VARCHAR(7) DEFAULT '#3498db',
    user_id     INT UNSIGNED NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table 3 : tasks
CREATE TABLE tasks (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT NULL,
    status       ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    priority     ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date     DATE NULL,
    category_id  INT UNSIGNED NULL,
    user_id      INT UNSIGNED NOT NULL,
    assigned_to  INT UNSIGNED NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id)       ON DELETE SET NULL
);
