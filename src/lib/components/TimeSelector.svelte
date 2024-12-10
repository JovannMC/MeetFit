<script lang="ts">
	import type { Day } from '$lib/common';
	import { info } from '../../routes/log';

	let { days, rangeStart, rangeEnd, selected, onpointerdown, onpointerup, onpointerenter } =
		$props();

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

	info(`Time slot count: ${timeSlots}`);

	const shortDay = (dayObject: Day) =>
		new Date(dayObject.year, dayObject.month, dayObject.day).toLocaleString('default', {
			weekday: 'short'
		});

	const shortDate = (dayObject: Day) =>
		`${dayObject.day} ${new Date(dayObject.year, dayObject.month, dayObject.day).toLocaleString(
			'default',
			{
				month: 'short'
			}
		)} '${String(dayObject.year).slice(2)}`;
</script>

<div class="flex flex-row">
	<div class="flex flex-row">
		<div class="mr-4 flex flex-col gap-2">
			<div class="h-10"></div>
			{#each timeSlotTimes as timeSlot}
				<p class="text-right text-sm">{timeSlot}</p>
			{/each}
		</div>
		{#each days as dayObject}
			<div
				class="flex w-16 flex-col"
				data-day="{dayObject.year}-{dayObject.month + 1}-{dayObject.day}"
			>
				<div class="flex flex-col items-center">
					<h1 class="text-lg">
						{shortDay(dayObject)}
					</h1>
					<h1 class="text-xs">
						{shortDate(dayObject)}
					</h1>
				</div>
				<div class="flex flex-col items-center">
					{#each timeSlotTimes as timeSlot}
						<button
							class="time-slot h-7 w-16 border-2 border-secondary-500 bg-primary-500"
							aria-label={timeSlot}
							onclick={() => selected(dayObject, timeSlot)}
							onpointerdown={(e) => onpointerdown(e, dayObject, timeSlot)}
							{onpointerup}
							onpointerenter={(e) => onpointerenter(e, dayObject, timeSlot)}
						></button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
