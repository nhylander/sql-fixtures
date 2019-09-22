CREATE USER 'root'@'%' IDENTIFIED BY 'password1' ;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';

CREATE DATABASE IF NOT EXISTS `test`;

USE `test`;

DROP TABLE IF EXISTS `effective_things`;

CREATE TABLE `effective_things` (
  `effective_id` int(11) NOT NULL,
  `effective_time` DATETIME NOT NULL,
  `description` varchar(160) NOT NULL,
  PRIMARY KEY (`effective_id`, `effective_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `names`;

CREATE TABLE `names` (
  `id` int(11) NOT NULL,
  `name` varchar(160) NOT NULL,
  `name_points` int(11) DEFAULT 0,
  `thing_id` int(11) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_effective_things_thing_id_created_at_idx` (`thing_id`, `created_at`),
  CONSTRAINT `fk_effective_things_thing_id_created_at_idx` 
    FOREIGN KEY (`thing_id`, `created_at`) REFERENCES `effective_things` (`effective_id`, `effective_time`) 
    ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `items`;

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `item_name` varchar(160) NOT NULL,
  `name_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_items_names_name_id_idx` (`name_id`),
  CONSTRAINT `fk_items_names_name_id` FOREIGN KEY (`name_id`) REFERENCES `names` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `sub_items`;

CREATE TABLE `sub_items` (
  `id` int(11) NOT NULL,
  `sub_item_name` varchar(160) NOT NULL,
  `item_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sub_items_items_item_id_idx` (`item_id`),
  CONSTRAINT `fk_sub_items_items_item_id` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
