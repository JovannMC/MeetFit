import { db } from '$lib/server/db';
import { attendee } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get info of attendee's availability for event
export const GET: RequestHandler = async ({ params }) => {
	const eventId = params.id;
	const attendeeId = params.attendee;

	const [attendeeData] = await db
		.select()
		.from(attendee)
		.where(and(eq(attendee.eventId, eventId), eq(attendee.id, attendeeId)));

	if (!attendeeData) {
		return json({ error: 'Attendee not found in event' }, { status: 404 });
	}

	return json({ attendee: attendeeData });
};
