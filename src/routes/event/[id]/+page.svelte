<script lang="ts">
	import type { Day } from '$lib/common';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
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

	let selectedTimes: { [key: string]: string } = $state({});

	$effect(() => {
		info(`Selected times: ${JSON.stringify(selectedTimes)}`);
	});
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<h1 class="text-center text-4xl font-bold">Event: {event?.name}</h1>
	<div class="flex flex-col items-center gap-2">
		<label class="text-xl" for="timezone">Time zone:</label>
		<select name="timezone" bind:value={timezone} class="w-full rounded border border-gray-300 p-2">
			{#each filteredTimezones as tz}
				<option value={tz}>{tz}</option>
			{/each}
		</select>

		<div class="flex flex-col items-center gap-2">
			<h2 class="text-3xl font-bold">Days</h2>
			<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{#each eventDays as day}
					<div class="rounded bg-gray-500 p-4">
						<TimeSelector dayObject={day} {rangeStart} {rangeEnd} bind:selected={selectedTimes} />
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
