/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Attendee } from '$lib/common';
import { db } from '$lib/server/db';
import { event as eventTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const eventId = params.id;
	const [eventData] = await db.select().from(eventTable).where(eq(eventTable.id, eventId));

	if (!eventData) {
		return {
			status: 404,
			error: 'Event not found'
		};
	}

	// Exclude passwordHash
	const attendees = (JSON.parse(eventData.attendees ?? '[]') as Attendee[]).map(
		({ passwordHash, ...attendee }) => attendee
	);
	eventData.attendees = JSON.stringify(attendees);

	return {
		props: {
			event: eventData
		}
	};
};
