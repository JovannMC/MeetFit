<script lang="ts">
	import type { Day } from '$lib/common';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
	import { onMount } from 'svelte';
	import { error, info } from '../../log';

	let { data } = $props();

	const event = data.props?.event;

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	let timezone = $state(currentTimezone);

	const eventDays: Day[] = JSON.parse(event?.days ?? '[]');
	const rangeStart = event?.timeRangeStart ?? 0;
	const rangeEnd = event?.timeRangeEnd ?? 24;

	info(`Event days count: ${eventDays.length}`);

	/*
	 * Selection logic
	 */

	let selectedTimes: { day: string; times: string[] }[] = $state([]);

	function selectTimeSlot(day: Day, time: string) {
		const key = `${day.year}-${day.month + 1}-${day.day}`;
		let dayObject = selectedTimes.find((d) => d.day === key);

		if (!dayObject) {
			dayObject = { day: key, times: [] };
			selectedTimes.push(dayObject);
		}

		if (!dayObject.times.includes(time)) {
			dayObject.times.push(time);
		}

		info(`Selected time slot for ${key}: ${time}`);
	}

	function deselectTimeSlot(day: Day, time: string) {
		const key = `${day.year}-${day.month + 1}-${day.day}`;
		const dayObject = selectedTimes.find((d) => d.day === key);

		if (dayObject) {
			const index = dayObject.times.indexOf(time);
			if (index !== -1) {
				dayObject.times.splice(index, 1);
			}
		}

		info(`Deselected time slot for ${key}: ${time}`);
	}

	let isDragging = false;
	let isSelecting = false;

	function handlePointerDown(event: any, day: Day, time: string) {
		isDragging = true;
		const classList = event.target.classList;
		if (classList.contains('bg-tertiary-300')) {
			isSelecting = false;
			deselectTimeSlot(day, time);
			classList.remove('bg-tertiary-300');
		} else {
			isSelecting = true;
			selectTimeSlot(day, time);
			classList.add('bg-tertiary-300');
		}
	}

	async function handlePointerUp() {
		isDragging = false;
		if (isSelecting) {
			isSelecting = false;
			// Save selected times to server
			if (!username || !isAuthenticated) return;
			const selectedTimesArray = selectedTimes.map(({ day, times }) => ({
				day,
				times
			}));

			const response = await fetch(`/api/events/${event?.id}/attendees/${username}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					availability: selectedTimesArray
				})
			});

			const result = await response.json();
			if (response.ok) {
				info(
					`Selected times saved successfully for ${username}: ${JSON.stringify(selectedTimesArray)}`
				);
			} else {
				error(
					`Failed to save selected times for ${username}: ${result.message}`
				);
			}
		}
	}

	function handlePointerEnter(event: any, day: Day, time: string) {
		if (isDragging) {
			const classList = event.target.classList;
			if (isSelecting) {
				selectTimeSlot(day, time);
				classList.add('bg-tertiary-300');
			} else {
				deselectTimeSlot(day, time);
				classList.remove('bg-tertiary-300');
			}
		}
	}

	async function setTimezone(tz: string) {
		timezone = tz;

		// Save selected timezone to server
		if (!username || !isAuthenticated) return;
		const response = await fetch(`/api/events/${event?.id}/attendees/${username}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				timezone
			})
		});

		const result = await response.json();
		if (response.ok) {
			info(`Timezone saved successfully for ${username}: ${timezone}`);
		} else {
			error(`Failed to save timezone for ${username}: ${result.message}`);
			errorMsg = result.message;
		}
	}

	onMount(() => {
		// Handles pointer up event outside of the time selectors
		window.addEventListener('pointerup', handlePointerUp);
	});

	/*
	 * Authentication logic
	 */

	let username = $state('');
	let isAuthenticated: boolean | null = $state(null);
	let errorMsg = $state('');
	let showNameError = $state(false);

	function handleSubmit(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const password = formData.get('password') as string;

		authenticate(username, password);
	}

	// i don't think this is how i should authenticate lmao, i should move this to server
	async function authenticate(username: string, password: string) {
		showNameError = false;
		isAuthenticated = null;
		if (!username) {
			info('Username is required');
			showNameError = true;
			return;
		}

		const response = await fetch(`/api/events/${event?.id}/attendees`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});

		// TODO: return specific error messages (invalid pass, internal server error, etc)
		const result = await response.json();
		if (response.ok) {
			info(`Authenticated successfully as ${result.attendee.name}`);
			isAuthenticated = true;

			if (result.attendee.timezone) {
				info(`Attendee timezone: ${result.attendee.timezone}`);
				timezone = result.attendee.timezone;
			} else {
				info('No timezone found for attendee');
				setTimezone(timezone);
			}

			if (result.attendee.availability) {
				selectedTimes = result.attendee.availability;

				for (const [_, value] of Object.entries(selectedTimes)) {
					const json = value as unknown as { day: string; times: string[] };
					info(`Day: ${json.day}, times: ${json.times}`);
					const day = json.day;
					const times = json.times;
					const dayElement = document.querySelector(`[data-day="${day}"]`);
					if (dayElement) {
						for (const time of times) {
							const timeSlotElement = dayElement.querySelector(`[aria-label="${time}"]`);
							if (timeSlotElement) {
								timeSlotElement.classList.add('bg-tertiary-300');
							}
						}
					}
				}
			}
		} else {
			isAuthenticated = false;
			error(`Authentication failed: ${result.message}`);
			errorMsg = result.message;
		}
	}

	// TODO: somehow link the elements and time slots together, so i don't have to remove from selectedTimes and search for the element (make a method / map)
	function signout() {
		isAuthenticated = null;
		username = '';

		// reset selected times
		selectedTimes = [];

		// set all time slots to unselected
		const timeSlotElements = document.querySelectorAll('.bg-tertiary-300');
		timeSlotElements.forEach((element) => element.classList.remove('bg-tertiary-300'));
	}
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<h1 class="text-center text-4xl font-bold">Event: {event?.name}</h1>
	<div class="flex flex-col items-center gap-4 rounded border-2 border-primary-500 bg-gray-500 p-6">
		{#if isAuthenticated === null || !isAuthenticated}
			<h1 class="text-center text-3xl font-bold">Sign in to select times</h1>
			<form onsubmit={handleSubmit} class="flex flex-col items-center">
				<div class="flex flex-col items-center gap-2 md:flex-row md:items-end">
					<div class="flex flex-col gap-1">
						<label class="text-left text-base" for="name">Name</label>
						<input
							name="name"
							type="text"
							class="w-full rounded border border-gray-300 p-2"
							bind:value={username}
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-left text-base" for="password">Password (optional)</label>
						<input
							name="password"
							type="password"
							class="w-full rounded border border-gray-300 p-2"
						/>
					</div>
					<button type="submit" class="rounded bg-primary-500 px-4 py-2 text-white">Sign in</button>
				</div>
			</form>

			{#if isAuthenticated === false}
				<p class="text-red-500">{errorMsg}</p>
			{/if}
		{:else if isAuthenticated}
			<div class="flex flex-col items-center gap-4">
				<h2 class="text-3xl font-bold">Welcome, {username}!</h2>
				<button onclick={signout} class="rounded bg-primary-500 px-4 py-2 text-white"
					>Sign out</button
				>
			</div>
		{/if}

		{#if showNameError}
			<p class="text-red-500">Name is required</p>
		{/if}

		<div class="flex flex-col items-center gap-2 text-center">
			<label class="text-xl" for="timezone">Time zone:</label>
			<select
				name="timezone"
				value={timezone}
				onchange={(e) => setTimezone((e.target as HTMLSelectElement).value ?? '')}
				class="w-full rounded border border-gray-300 p-2"
			>
				{#each filteredTimezones as tz}
					<option value={tz}>{tz}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="flex flex-col items-center gap-2">
		<h2 class="text-3xl font-bold">Days</h2>
		<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
			{#each eventDays as day}
				<div class="rounded bg-gray-500 p-4">
					<TimeSelector
						dayObject={day}
						{rangeStart}
						{rangeEnd}
						selected={(day: Day, time: string) => selectTimeSlot(day, time)}
						onpointerdown={handlePointerDown}
						onpointerup={handlePointerUp}
						onpointerenter={handlePointerEnter}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>
