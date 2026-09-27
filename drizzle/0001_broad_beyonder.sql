ALTER TABLE `equipment` ADD `price_kind` text DEFAULT 'consult' NOT NULL;--> statement-breakpoint
ALTER TABLE `equipment` ADD `price_amount` integer;--> statement-breakpoint
ALTER TABLE `equipment` ADD `price_unit` text DEFAULT 'day' NOT NULL;--> statement-breakpoint
ALTER TABLE `equipment` ADD `services` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `equipment` ADD `sector` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `equipment` ADD `location_precision` text DEFAULT 'none' NOT NULL;