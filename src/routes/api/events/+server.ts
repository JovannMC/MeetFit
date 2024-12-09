import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { name, timezone, timeRangeStart, timeRangeEnd, days } = await request.json();

	const newEvent = {
		id: crypto.randomUUID(),
		name,
		timezone,
		timeRangeStart,
		timeRangeEnd,
		days: JSON.stringify(days)
	};

	await db.insert(event).values(newEvent);

	return json({ event: newEvent });
};

export const GET: RequestHandler = async () => {
	// TODO: search events? maybe
	// or stats?
	const events = await db.select().from(event);

	return json({ events });
};
