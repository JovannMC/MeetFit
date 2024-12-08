import type { Attendee } from '$lib/common';
import { db } from '$lib/server/db';
import { event as eventTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get info of attendee's availability for event
export const GET: RequestHandler = async ({ params }) => {
	const eventId = params.id;
	const attendeeName = params.attendee;

	const event = db.select().from(eventTable).where(eq(eventTable.id, eventId)).get();

	if (!event) {
		return json({ error: 'Event not found' }, { status: 404 });
	}

	const attendees = JSON.parse(event.attendees ?? '[]');
	const attendeeData = attendees.find((attendee: Attendee) => attendee.name === attendeeName);

	if (!attendeeData) {
		return json({ error: 'Attendee not found in event' }, { status: 404 });
	}

	return json({ attendee: attendeeData });
};
