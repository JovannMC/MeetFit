import { db } from '$lib/server/db';
import { event as eventTable, user } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { count } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get instance stats
export const GET: RequestHandler = async () => {
	const userCount = await db.select({ count: count() }).from(user);
	const eventCount = await db.select({ count: count() }).from(eventTable);

	const events = await db.select().from(eventTable);
	let attendeeCount = 0;

	events.forEach((event) => {
		const attendees = JSON.parse(event.attendees ?? '[]');
		attendeeCount += attendees.length;
	});

	return json({
		users: userCount[0].count,
		events: eventCount[0].count,
		attendees: attendeeCount
	});
};
