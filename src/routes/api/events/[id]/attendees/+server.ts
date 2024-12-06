import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendee } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get info on all attendees for event
export const GET: RequestHandler = async ({ params }) => {
	const eventId = params.id;

	const attendees = await db.select().from(attendee).where(eq(attendee.eventId, eventId));

	if (!attendees.length) {
		return json({ error: 'No attendees in event' }, { status: 404 });
	}

	return json({ attendees });
};

export const POST: RequestHandler = async ({ params, request }) => {
	const eventId = params.id;
	const { name, availability } = await request.json();

	const newAttendee = {
		id: crypto.randomUUID(),
		eventId,
		name,
		availability: JSON.stringify(availability)
	};

	await db.insert(attendee).values(newAttendee);

	return json({ success: true, attendee: newAttendee });
};
