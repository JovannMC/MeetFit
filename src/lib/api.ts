import { error } from '../routes/log';

export async function fetchHelper(url: string, method: string, body?: object) {
	try {
		const options: RequestInit = {
			method,
			headers: {
				'Content-Type': 'application/json'
			}
		};

		if (method !== 'GET' && body) {
			options.body = JSON.stringify(body);
		}

		const response = await fetch(url, options);
		const result = await response.json();
		if (!response.ok) {
			throw new Error(result.message || 'Unknown error during fetch request');
		}
		return result;
	} catch (err) {
		error('Fetch error:', err);
		throw error;
	}
}

export async function addEvent(body: object) {
	return fetchHelper('/api/events', 'POST', body);
}

export async function getEvents() {
	return fetchHelper('/api/events', 'GET');
}

export async function getAttendees(eventId: string) {
	return fetchHelper(`/api/events/${eventId}/attendees`, 'GET');
}

export async function signinAttendee(eventId: string, username: string, password: string) {
	return fetchHelper(`/api/events/${eventId}/attendees`, 'POST', {
		username,
		password
	});
}

export async function updateAttendee(eventId: string, username: string, body: object) {
	return fetchHelper(`/api/events/${eventId}/attendees/${username}`, 'PATCH', body);
}
