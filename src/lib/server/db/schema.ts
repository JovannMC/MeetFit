import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// from template, probably not gonna be used
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

// from template, probably not gonna be used
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const event = sqliteTable('event', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	timezone: text('timezone').notNull(),
	timeRangeStart: integer('time_range_start').notNull(),
	timeRangeEnd: integer('time_range_end').notNull(),
	days: text('days').notNull(),
	attendees: text('attendees') // JSON string storing attendee's name, availability, and password hash - Attendee interface
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Event = typeof event.$inferSelect;
