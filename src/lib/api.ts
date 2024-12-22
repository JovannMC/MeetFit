export async function fetchHelper(url: string, method: string, body?: object) {
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
}

export async function addEvent(body: object) {
	try {
		return await fetchHelper('/api/events', 'POST', body);
	} catch (err) {
		return { message: (err as Error).message || 'Unknown error during addEvent' };
	}
}

export async function getEvents() {
	try {
		return await fetchHelper('/api/events', 'GET');
	} catch (err) {
		return { message: (err as Error).message || 'Unknown error during getEvents' };
	}
}

export async function getAttendees(eventId: string) {
	try {
		return await fetchHelper(`/api/events/${eventId}/attendees`, 'GET');
	} catch (err) {
		return { message: (err as Error).message || 'Unknown error during getAttendees' };
	}
}

export async function signinAttendee(eventId: string, username: string, password: string) {
	try {
		return await fetchHelper(`/api/events/${eventId}/attendees`, 'POST', {
			username,
			password
		});
	} catch (err) {
		return { message: (err as Error).message || 'Unknown error during signinAttendee' };
	}
}

export async function updateAttendee(eventId: string, username: string, body: object) {
	try {
		return await fetchHelper(`/api/events/${eventId}/attendees/${username}`, 'PATCH', body);
	} catch (err) {
		return { message: (err as Error).message || 'Unknown error during updateAttendee' };
	}
}
