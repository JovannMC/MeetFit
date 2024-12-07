<script lang="ts">
	import { days, type Day } from '$lib/common';
	import Calendar from '$lib/components/Calendar.svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import { info } from './log';

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	let eventName = $state('');
	let startingDay = $state('Monday');
	let timezone = $state(currentTimezone);
	let selectedDays: Day[] = $state([]);

	let timeValue = $state([6, 18]);

	// TODO: use later maybe
	const userId = 0;

	$effect(() => {
		info(`Time range: ${timeValue[0]} - ${timeValue[1]}`);
	});

	async function createEvent() {
		info('Creating event...');
		const response = await fetch('/api/events', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: eventName,
				timezone,
				timeRangeStart: timeValue[0],
				timeRangeEnd: timeValue[1],
				days: selectedDays
			})
		});

		const result = await response.json();
		if (result.success) {
			info('Event created successfully:', JSON.stringify(result));
		} else {
			info('Failed to create event');
		}
	}

	let apiEndpoint = $state('/api/events');

	async function checkAPIResponse() {
		info(`Checking API response for: ${apiEndpoint}`);
		const response = await fetch(`${apiEndpoint}`);
		const result = await response.json();
		info('API response:', JSON.stringify(result));
	}
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<h1 class="text-center text-4xl font-bold">Create an event</h1>
	<div class="flex max-w-md flex-col gap-4">
		<!-- Event name -->
		<div class="col-span-1 flex flex-col items-center gap-2 text-center">
			<label class="text-xl" for="eventName">Event name:</label>
			<input
				name="eventName"
				type="text"
				class="w-full rounded border border-gray-300 p-2"
				bind:value={eventName}
			/>
		</div>

		<!-- Starting day and Time zone -->
		<div class="col-span-1 grid w-full grid-cols-2 gap-4">
			<div class="flex flex-col items-center gap-2">
				<label class="text-xl" for="startingDay">Starting day:</label>
				<select
					name="startingDay"
					bind:value={startingDay}
					class="w-full rounded border border-gray-300 p-2"
				>
					{#each days as day}
						<option value={day}>{day}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-col items-center gap-2">
				<label class="text-xl" for="timezone">Time zone:</label>
				<select
					name="timezone"
					bind:value={timezone}
					class="w-full rounded border border-gray-300 p-2"
				>
					{#each filteredTimezones as tz}
						<option value={tz}>{tz}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Time range -->
		<div class="col-span-1 flex w-full flex-col items-center">
			<p class="text-xl">Time range:</p>
			<p class="text-lg">{timeValue[0]}:00 - {timeValue[1]}:00</p>
			<Slider
				name="Event duration:"
				step={1}
				min={0}
				max={24}
				bind:value={timeValue}
				classes={'p-4'}
			/>
			<div class="flex w-full justify-between" style="width: 416px;">
				{#each [12, 3, 6, 9, 12, 3, 6, 9, 12] as marker}
					<span>{marker}</span>
				{/each}
			</div>
		</div>

		<!-- Date range -->
		<div class="col-span-1 rounded bg-surface-800">
			<Calendar {startingDay} bind:selected={selectedDays} />
		</div>

		<!-- Submit button -->
		<div class="col-span-1 flex justify-center">
			<button class="rounded bg-primary-800 p-2 text-white" onclick={createEvent}
				>Create event</button
			>
		</div>

		<!-- API Check (TO REMOVE lATER) -->
		<div class="col-span-1 flex flex-col items-center gap-2 text-center">
			<label class="text-xl" for="apiEndpoint">API Endpoint:</label>
			<input
				name="apiEndpoint"
				type="text"
				class="w-full rounded border border-gray-300 p-2"
				bind:value={apiEndpoint}
			/>
			<button class="rounded bg-primary-800 p-2 text-white" onclick={checkAPIResponse}
				>Check API</button
			>
		</div>
	</div>
</div>
