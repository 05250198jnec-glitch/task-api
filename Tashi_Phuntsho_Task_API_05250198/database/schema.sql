CREATE DATABASE IF NOT EXISTS task_api_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE task_api_db;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO tasks (title, description, status)
SELECT 'Complete API assignment', 'Create and test the Task Management API.', 'in_progress'
WHERE NOT EXISTS (SELECT 1 FROM tasks);
