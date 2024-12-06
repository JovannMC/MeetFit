import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get info of attendee's availability for event
export const GET: RequestHandler = async ({ params }) => {
	const eventId = params.id;
	const attendeeId = params.attendee;

	const [attendeeData] = await db
		.select()
		.from(attendee)
		.where(eq(attendee.id, attendeeId))
		.andWhere(eq(attendee.eventId, eventId));

	if (!attendeeData) {
		return json({ error: 'Attendee not found in event' }, { status: 404 });
	}

	return json({ attendee: attendeeData });
};
