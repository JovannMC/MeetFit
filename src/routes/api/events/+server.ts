/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Attendee } from '$lib/common';
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

// TODO: remove this and API endpoint testing stuff before production
export const GET: RequestHandler = async () => {
	// TODO: search events? maybe
	// or stats?
	const events = await db.select().from(event);

	// Exclude "passwordHash"
	const sanitizedEvents = events.map((event) => {
		const attendees = (JSON.parse(event.attendees ?? '[]') as Attendee[]).map(
			({ passwordHash, ...attendee }) => attendee
		);
		return { ...event, attendees: JSON.stringify(attendees) };
	});

	return json({ events: sanitizedEvents });
};
