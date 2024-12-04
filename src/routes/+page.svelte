<script lang="ts">
	import { days } from '$lib/common';
	import Calendar from '$lib/components/Calendar.svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import { info } from './log';

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	let startingDay = $state('Monday');
	let timezone = $state(currentTimezone);

	function handleSelectedDays(selectedDays: string[]) {
		info(`Selected days: ${selectedDays.join(', ')}`);
	}

	let timeValue = $state([30, 90]);

	$effect(() => {
		info(`Time range: ${timeValue[0]} - ${timeValue[1]}`);
	});
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<h1 class="text-center text-4xl font-bold">Create an event</h1>
	<div class="flex max-w-md flex-col gap-4">
		<!-- Event name -->
		<div class="col-span-1 flex flex-col items-center text-center">
			<label for="eventName">Event name:</label>
			<input name="eventName" type="text" class="w-full rounded border border-gray-300 p-2" />
		</div>

		<!-- Starting day and Time zone -->
		<div class="col-span-1 grid w-full grid-cols-2 gap-4">
			<div class="flex flex-col items-center">
				<label for="startingDay">Starting day:</label>
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
			<div class="flex flex-col items-center">
				<label for="timezone">Time zone:</label>
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
			<p>Time range:</p>
			<Slider name="Event duration:" step={10} max={120} bind:value={timeValue} classes={'p-4'} />
		</div>

		<!-- Date range -->
		<div class="col-span-1 bg-surface-800 rounded">
			<Calendar {startingDay} selected={(days: string[]) => handleSelectedDays(days)} />
		</div>
	</div>
</div>
