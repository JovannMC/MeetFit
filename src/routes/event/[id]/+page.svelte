<script lang="ts">
	import type { Day } from '$lib/common';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
	import { onMount } from 'svelte';
	import { info } from '../../log';

	let { data } = $props();

	const event = data.props?.event;

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	let timezone = $state(currentTimezone);

	$effect(() => {
		info(`Event data: ${JSON.stringify(event)}`);
	});

	const eventDays: Day[] = JSON.parse(event?.days ?? '[]');
	const rangeStart = event?.timeRangeStart ?? 0;
	const rangeEnd = event?.timeRangeEnd ?? 24;

	let selectedTimes: { [key: string]: string[] } = $state({});

	$effect(() => {
		info(`Selected times: ${JSON.stringify(selectedTimes)}`);
	});

	/*
	 * Selection logic
	 */
	function selectTimeSlot(day: Day, time: string) {
		const key = `${day.year}-${day.month}-${day.day}`;
		if (!selectedTimes[key]) {
			selectedTimes[key] = [];
		}
		if (!selectedTimes[key].includes(time)) {
			selectedTimes[key].push(time);
		}
		info(`Selected time slot for ${key}: ${time}`);
	}

	function deselectTimeSlot(day: Day, time: string) {
		const key = `${day.year}-${day.month}-${day.day}`;
		if (selectedTimes[key]) {
			selectedTimes[key] = selectedTimes[key].filter((t) => t !== time);
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

	function handlePointerUp() {
		isDragging = false;
		isSelecting = false;
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

	onMount(() => {
		// Handles pointer up event outside of the time selectors
		window.addEventListener('pointerup', handlePointerUp);
	});

	let username = $state('');
	let isAuthenticated: boolean | null = $state(null);
	let showNameError = $state(false);

	function handleSubmit(event: Event) {
		const formData = new FormData(event.target as HTMLFormElement);
		const password = formData.get('password') as string;

		authenticate(username, password);
	}

	// i don't think this is how i should authenticate lmao, i should move this to server
	async function authenticate(username: string, password: string) {
		showNameError = false;
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

		const result = await response.json();
		if (result.success) {
			info('Authentication successful:', JSON.stringify(result));
			isAuthenticated = true;
		} else {
			info('Authentication failed:', JSON.stringify(result));
			isAuthenticated = false;
		}
	}
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<h1 class="text-center text-4xl font-bold">Event: {event?.name}</h1>
	<div class="flex flex-col items-center gap-4 rounded border-2 border-primary-500 bg-gray-500 p-6">
		{#if isAuthenticated === null || !isAuthenticated}
			<h1 class="text-center text-3xl font-bold">Sign in to event:</h1>
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
				<p class="text-red-500">Authentication failed</p>
			{/if}
		{:else if isAuthenticated}
			<p class="text-green-500">Authenticated</p>
		{/if}

		{#if showNameError}
			<p class="text-red-500">Name is required</p>
		{/if}
	</div>

	<div class="flex flex-col items-center gap-2 text-center">
		<label class="text-xl" for="timezone">Time zone:</label>
		<select name="timezone" bind:value={timezone} class="w-full rounded border border-gray-300 p-2">
			{#each filteredTimezones as tz}
				<option value={tz}>{tz}</option>
			{/each}
		</select>
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
