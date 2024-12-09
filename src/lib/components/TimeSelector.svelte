<script lang="ts">
	import { info } from '../../routes/log';

	let { dayObject, rangeStart, rangeEnd, selected, onpointerdown, onpointerup, onpointerenter } =
		$props();

	const year = dayObject.year;
	const month = dayObject.month;
	const day = dayObject.day;

	const shortMonth = new Date(year, month, day).toLocaleString('default', { month: 'short' });
	const shortDay = new Date(year, month, day).toLocaleString('default', { weekday: 'short' });

	// Calculate amount of time slots
	const timeSlots = (rangeEnd - rangeStart + 0.5) / 0.5;

	// Calculate times for each time slot
	const timeSlotTimes = Array(timeSlots)
		.fill(0)
		.map((_, i) => {
			const time = rangeStart + i * 0.5;
			const hours = Math.floor(time);
			let minutes = (time - hours) * 60;
			return `${hours}:${minutes === 0 ? '00' : minutes}`;
		});

	info(`Time slot count for ${year}-${month + 1}-${day}: ${timeSlots}`);
</script>

<div class="flex flex-col items-center justify-center" data-day="{year}-{month + 1}-{day}">
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
						onclick={() => selected(dayObject, timeSlot)}
						onpointerdown={(e) => onpointerdown(e, dayObject, timeSlot)}
						{onpointerup}
						onpointerenter={(e) => onpointerenter(e, dayObject, timeSlot)}
					></button>
				</div>
			</div>
		{/each}
	</div>
</div>
