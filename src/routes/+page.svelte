<script lang="ts">
	import { goto } from '$app/navigation';
	import { addEvent, fetchHelper } from '$lib/api';
	import { formatTime, type Day } from '$lib/common';
	import Calendar from '$lib/components/Calendar.svelte';
	import { languageStore, startingDayStore, themeStore, timeFormatStore } from '$lib/stores';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import { get } from 'svelte/store';
	import { error, info } from './log';

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	let startingDay = $state(get(startingDayStore));
	let lang = $state(get(languageStore));
	let theme = $state(get(themeStore));
	let timeFormat = $state(get(timeFormatStore));

	let eventName = $state('');
	let eventType = $state('dates');
	let timezone = $state(currentTimezone);
	let selectedDays: Day[] = $state([]);

	let timeValue = $state([6, 18]);

	// TODO: show error msg in UI (notification on bottom right or just show text)
	let errorMsg = $state('');

	// TODO: use later maybe, for "global" accounts
	// users = global accounts
	// attendees = event accounts
	let userId = 0;

	$effect(() => {
		info(`Time range: ${timeValue[0]} - ${timeValue[1]}`);
	});

	async function createEvent() {
		info(`Creating event: ${eventName}`);
		const result = await addEvent({
			name: eventName,
			timezone,
			timeRangeStart: timeValue[0],
			timeRangeEnd: timeValue[1],
			days: selectedDays
		});

		if (result) {
			info('Event created successfully:', JSON.stringify(result));
			goto(`/event/${result.event.id}`);
		} else {
			error(`Failed to create event: ${result.message}`);
			errorMsg = result.message;
		}
	}

	let apiEndpoint = $state('/api/events');
	let apiResponse = $state({});

	async function checkAPIResponse() {
		info(`Checking API response for: ${apiEndpoint}`);
		const result = await fetchHelper(apiEndpoint, 'GET');
		info('API response:', JSON.stringify(result));

		apiResponse = result;
	}

	// Subscribing to settings changes (store)
	$effect(() => {
		startingDayStore.subscribe((value) => {
			startingDay = value;
		});

		languageStore.subscribe((value) => {
			lang = value;
		});

		themeStore.subscribe((value) => {
			theme = value;
		});

		timeFormatStore.subscribe((value) => {
			timeFormat = value;
		});

		info(`Language: ${$languageStore}`);
		info(`Theme: ${$themeStore}`);
		info(`Starting day: ${$startingDayStore}`);
		info(`Time format: ${$timeFormatStore}`);
	});
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<h1 class="text-center text-4xl font-bold">Create an event</h1>
	<div class="flex w-full max-w-md flex-col gap-6">
		<!-- Event name -->
		<div class="col-span-1 flex flex-col items-center gap-2 text-center">
			<label class="text-xl" for="eventName">Event name:</label>
			<input
				name="eventName"
				type="text"
				class="w-full rounded-lg border border-gray-300 p-2"
				bind:value={eventName}
			/>
		</div>
		<!-- Event type & time zone -->
		<div class="col-span-1 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="flex flex-col items-center gap-2">
				<label class="text-xl" for="startingDay">Event type:</label>
				<select
					name="type"
					bind:value={eventType}
					class="w-full rounded-lg border border-gray-300 p-2"
				>
					<option value="dates">Specific dates</option>
					<option value="times">Days of the week</option>
				</select>
			</div>
			<div class="flex flex-col items-center gap-2">
				<label class="text-xl" for="timezone">Time zone:</label>
				<select
					name="timezone"
					bind:value={timezone}
					class="w-full rounded-lg border border-gray-300 p-2"
				>
					{#each filteredTimezones as tz}
						<option value={tz}>{tz}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Time range -->
		<div class="col-span-1 flex w-full flex-col items-center gap-1">
			<p class="text-2xl">Time range:</p>
			{#if timeFormat === 12}
				<p class="text-lg">
					{formatTime(`${timeValue[0]}:00`, false)} - {formatTime(`${timeValue[1]}:00`, false)}
				</p>
			{:else}
				<p class="text-lg">{timeValue[0]}:00 - {timeValue[1]}:00</p>
			{/if}
			<Slider
				name="Event duration:"
				step={1}
				min={0}
				max={24}
				bind:value={timeValue}
				classes={'mt-6 mb-8'}
				markers={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
				markClasses={'text-sm !opacity-100'}
			/>
		</div>

		<!-- Date range -->
		<div class="col-span-1 rounded-lg border-2 border-primary-500 bg-gray-500">
			<Calendar {startingDay} bind:selected={selectedDays} />
		</div>

		<!-- Submit button -->
		<div class="col-span-1 flex justify-center">
			<button class="rounded-lg bg-primary-800 p-2 text-white" onclick={createEvent}
				>Create event</button
			>
		</div>

		<!-- API Check (TO REMOVE lATER) -->
		<div class="col-span-1 flex flex-col items-center gap-2 text-center">
			<label class="text-xl" for="apiEndpoint">API Endpoint:</label>
			<input
				name="apiEndpoint"
				type="text"
				class="w-full rounded-lg border border-gray-300 p-2"
				bind:value={apiEndpoint}
			/>
			<button class="rounded-lg bg-primary-800 p-2 text-white" onclick={checkAPIResponse}
				>Check API</button
			>
			{#if apiResponse}
				<pre class="whitespace-pre-wrap text-left">{JSON.stringify(apiResponse, null, 2)}</pre>
			{/if}
		</div>
	</div>
</div>
