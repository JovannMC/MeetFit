<script lang="ts">
	import type { Day } from '$lib/common';
	import { info } from '../../routes/log';

	let {
		dayObject,
		rangeStart,
		rangeEnd,
		selected = $bindable()
	}: {
		dayObject: Day;
		rangeStart: number;
		rangeEnd: number;
		selected: { [key: string]: string };
	} = $props();

	const year = dayObject.year;
	const month = dayObject.month;
	const day = dayObject.day;

	const shortMonth = new Date(year, month, day).toLocaleString('default', { month: 'short' });
	const shortDay = new Date(year, month, day).toLocaleString('default', { weekday: 'short' });

	// Calculate amount of time slots
	const timeSlots = (rangeEnd - rangeStart + 0.5) / 0.5;
	info(`Time slots: ${timeSlots}`);
	info(`Range start: ${rangeStart}`);
	info(`Range end: ${rangeEnd}`);

	// Calculate times for each time slot
	const timeSlotTimes = Array(timeSlots)
		.fill(0)
		.map((_, i) => {
			const time = rangeStart + i * 0.5;
			const hours = Math.floor(time);
			let minutes = (time - hours) * 60;
			return `${hours}:${minutes === 0 ? '00' : minutes}`;
		});

	function selectTimeSlot(time: string) {
		selected[`${year}-${month}-${day}`] = time;
		info(`Selected time slot: ${time}`);
	}
</script>

<div class="flex flex-col items-center justify-center">
	<div class="flex flex-col items-center">
		<h1 class="text-2xl">{shortDay}</h1>
		<h1 class="text-base">{day} {shortMonth} {year}</h1>
	</div>

	<div class="flex flex-col items-center justify-center">
		{#each timeSlotTimes as timeSlot}
			<div class="flex flex-row items-center gap-3">
				<p class="w-16 text-right text-sm">{timeSlot}</p>
				<div class="flex w-28 items-center">
					<button
						class="h-6 w-12 border-2 border-secondary-500 bg-primary-500"
						aria-label={timeSlot}
						onclick={() => selectTimeSlot(timeSlot)}
					></button>
				</div>
			</div>
		{/each}
	</div>
</div>
