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


