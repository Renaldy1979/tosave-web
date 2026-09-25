CREATE TABLE `attributes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attributes_title_unique` ON `attributes` (`title`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`state` text DEFAULT 'ativa' NOT NULL,
	`image` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
CREATE TABLE `car_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_id` integer NOT NULL,
	`path` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `car_images_car_position_idx` ON `car_images` (`car_id`,`position`);--> statement-breakpoint
CREATE TABLE `cars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`brand_id` integer,
	`serie_id` integer,
	`collector` text,
	`color` text,
	`imagem_full` text,
	`imagem_thumb` text,
	`imagem_url_original` text,
	`imagem_check` integer DEFAULT false NOT NULL,
	`serie_position` text,
	`toy` text,
	`year` integer,
	`scale` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`serie_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `cars_brand_idx` ON `cars` (`brand_id`);--> statement-breakpoint
CREATE INDEX `cars_serie_idx` ON `cars` (`serie_id`);--> statement-breakpoint
CREATE INDEX `cars_toy_idx` ON `cars` (`toy`);--> statement-breakpoint
CREATE INDEX `cars_year_idx` ON `cars` (`year`);--> statement-breakpoint
CREATE INDEX `cars_title_idx` ON `cars` (`title`);--> statement-breakpoint
CREATE TABLE `cars_attributes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_id` integer NOT NULL,
	`attribute_id` integer NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cars_attributes_car_attribute_unique` ON `cars_attributes` (`car_id`,`attribute_id`);--> statement-breakpoint
CREATE INDEX `cars_attributes_attribute_idx` ON `cars_attributes` (`attribute_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`car_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_user_car_unique` ON `collections` (`user_id`,`car_id`);--> statement-breakpoint
CREATE INDEX `collections_car_idx` ON `collections` (`car_id`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`imagem` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `series_is_default_idx` ON `series` (`is_default`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'COLLECTOR' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`expo_push_token` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);