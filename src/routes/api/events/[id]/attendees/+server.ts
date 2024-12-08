/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Attendee } from '$lib/common';
import { db } from '$lib/server/db';
import { event as eventTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Get info on all attendees for event
export const GET: RequestHandler = async ({ params }) => {
	const eventId = params.id;

	const event = db.select().from(eventTable).where(eq(eventTable.id, eventId)).get();

	if (!event) {
		return json({ error: 'Event not found' }, { status: 404 });
	}

	// Exclude passwordHash
	const attendees = (JSON.parse(event.attendees ?? '[]') as Attendee[]).map(
		({ passwordHash, ...attendee }) => attendee
	);

	return json({ attendees });
};

// Add new attendee or log in to an existing attendee
export const POST: RequestHandler = async ({ params, request }) => {
	const eventId = params.id;
	const { username, availability, password } = await request.json();

	const event = db.select().from(eventTable).where(eq(eventTable.id, eventId)).get();

	if (!event) {
		return json({ error: 'Event not found' }, { status: 404 });
	}

	const attendees = JSON.parse(event.attendees ?? '[]');
	const existingAttendee = attendees.find((attendee: Attendee) => attendee.name === username);

	if (existingAttendee) {
		// Found existing attendee
		if (
			password &&
			existingAttendee.passwordHash &&
			bcrypt.compareSync(password, existingAttendee.passwordHash)
		) {
			// Password provided and matches
			const { passwordHash, ...attendeeWithoutPasswordHash } = existingAttendee;
			return json({ success: true, attendee: attendeeWithoutPasswordHash });
		} else if (!password && !existingAttendee.passwordHash) {
			// No password provided and no password set for attendee
			const { passwordHash, ...attendeeWithoutPasswordHash } = existingAttendee;
			return json({ success: true, attendee: attendeeWithoutPasswordHash });
		} else {
			// Password provided but doesn't match
			return json({ error: 'Invalid password', success: false }, { status: 401 });
		}
	} else {
		// New attendee
		const pswdHash = password ? bcrypt.hashSync(password, 10) : null;
		const newAttendee = { name: username, availability, passwordHash: pswdHash };
		attendees.push(newAttendee);

		await db
			.update(eventTable)
			.set({ attendees: JSON.stringify(attendees) })
			.where(eq(eventTable.id, eventId));

		const { passwordHash, ...attendeeWithoutPasswordHash } = newAttendee;
		return json({ success: true, attendee: attendeeWithoutPasswordHash });
	}
};
