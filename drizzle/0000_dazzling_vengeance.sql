CREATE TABLE `equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`operator` text DEFAULT 'no' NOT NULL,
	`delivery` text DEFAULT 'no' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_equipment_provider_id` ON `equipment` (`provider_id`);--> statement-breakpoint
CREATE INDEX `idx_equipment_category` ON `equipment` (`category`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`whatsapp` text NOT NULL,
	`comuna` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `providers_owner_id_unique` ON `providers` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `providers_slug_unique` ON `providers` (`slug`);