import { db } from '$lib/server/db';
import { attendee, event, user } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { count } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get instance stats
export const GET: RequestHandler = async () => {
	const userCount = await db.select({ count: count() }).from(user);
	const eventCount = await db.select({ count: count() }).from(event);
	const attendeeCount = await db.select({ count: count() }).from(attendee);

	return json({
		users: userCount[0].count,
		events: eventCount[0].count,
		attendees: attendeeCount[0].count
	});
};
