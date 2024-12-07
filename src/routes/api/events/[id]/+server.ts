import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get info of event
export const GET: RequestHandler = async ({ params }) => {
	const eventId = params.id;

	const [eventData] = await db.select().from(event).where(eq(event.id, eventId));

	if (!eventData) {
		return json({ error: 'Event not found' }, { status: 404 });
	}

	return json({ event: eventData });
};

// Delete event
export const DELETE: RequestHandler = async ({ params }) => {
	const eventId = params.id;

	const [eventData] = await db.select().from(event).where(eq(event.id, eventId));

	if (!eventData) {
		return json({ error: 'Event not found' }, { status: 404 });
	}

	await db.delete(event).where(eq(event.id, eventId));

	return json({ message: 'Event deleted successfully' }, { status: 200 });
};
