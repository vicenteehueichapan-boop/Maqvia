CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`equipment_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `equipment_id`),
	FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_favorites_equipment_id` ON `favorites` (`equipment_id`);--> statement-breakpoint
ALTER TABLE `equipment` ADD `status` text DEFAULT 'active' NOT NULL;