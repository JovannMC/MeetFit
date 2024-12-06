import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const eventId = params.id;
	const [eventData] = await db.select().from(event).where(eq(event.id, eventId));

	if (!eventData) {
		return {
			status: 404,
			error: 'Event not found'
		};
	}

	return {
		props: {
			event: eventData
		}
	};
};
