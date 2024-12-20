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
		return json({ message: 'Event not found' }, { status: 404 });
	}

	const attendees = JSON.parse(event.attendees ?? '[]');
	const attendeeData = attendees.find((attendee: Attendee) => attendee.name === attendeeName);

	if (!attendeeData) {
		return json({ message: 'Attendee not found in event' }, { status: 404 });
	}

	return json({ attendee: attendeeData });
};

// Update attendee's settings for event
export const PATCH: RequestHandler = async ({ params, request }) => {
	const eventId = params.id;
	const attendeeName = params.attendee;
	const { availability, timezone } = await request.json();

	const event = db.select().from(eventTable).where(eq(eventTable.id, eventId)).get();

	if (!event) {
		return json({ message: 'Event not found' }, { status: 404 });
	}

	const attendees = JSON.parse(event.attendees ?? '[]');
	const attendeeData = attendees.find((attendee: Attendee) => attendee.name === attendeeName);

	if (!attendeeData) {
		return json({ message: 'Attendee not found in event' }, { status: 404 });
	}

	if (availability) attendeeData.availability = availability;
	if (timezone) attendeeData.timezone = timezone;

	db.update(eventTable)
		.set({ attendees: JSON.stringify(attendees) })
		.where(eq(eventTable.id, eventId))
		.run();

	return json({ attendee: attendeeData });
};
