/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Attendee } from '$lib/common';
import { db } from '$lib/server/db';
import { event as eventTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get info of event
export const GET: RequestHandler = async ({ params }) => {
	const eventId = params.id;

	const [eventData] = await db.select().from(eventTable).where(eq(eventTable.id, eventId));

	if (!eventData) {
		return json({ error: 'Event not found' }, { status: 404 });
	}

	const attendees = (JSON.parse(eventData.attendees ?? '[]') as Attendee[]).map(
		({ passwordHash, ...attendee }) => attendee
	);
	eventData.attendees = JSON.stringify(attendees);

	return json({ event: eventData });
};

// Delete event
export const DELETE: RequestHandler = async ({ params }) => {
	const eventId = params.id;

	const [eventData] = await db.select().from(eventTable).where(eq(eventTable.id, eventId));

	if (!eventData) {
		return json({ error: 'Event not found' }, { status: 404 });
	}

	await db.delete(eventTable).where(eq(eventTable.id, eventId));

	return json({ message: 'Event deleted successfully' }, { status: 200 });
};
