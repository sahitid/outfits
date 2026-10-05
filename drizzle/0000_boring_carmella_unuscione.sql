CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`start` text NOT NULL,
	`end` text,
	`mood` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `event_owner` ON `events` (`owner`);--> statement-breakpoint
CREATE TABLE `garments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`moods` text NOT NULL,
	`color` text NOT NULL,
	`warmth` integer NOT NULL,
	`image_key` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `garment_owner` ON `garments` (`owner`);--> statement-breakpoint
CREATE TABLE `outfits` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`mood` text NOT NULL,
	`pieces` text NOT NULL,
	`date` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `outfit_owner` ON `outfits` (`owner`);--> statement-breakpoint
CREATE TABLE `settings` (
	`owner` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
