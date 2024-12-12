<script lang="ts">
	import type { Day } from '$lib/common';
	import { info } from '../../routes/log';

	let {
		days,
		availabilityData,
		rangeStart,
		rangeEnd,
		selected,
		onpointerdown,
		onpointerup,
		onpointerenter
	} = $props();

	// Calculate amount of time slots
	const timeSlots = (rangeEnd - rangeStart + 0.25) / 0.25;

	// Calculate times for each time slot
	const timeSlotTimes = Array(timeSlots)
		.fill(0)
		.map((_, i) => {
			const time = rangeStart + i * 0.25;
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

	let heatmapData: { [key: string]: { [key: string]: number | string } } = {};

	if (availabilityData) {
		availabilityData.forEach(
			({ availability }: { availability: { day: string; times: string[] }[] }) => {
				availability.forEach(({ day, times }: { day: string; times: string[] }) => {
					if (!heatmapData[day]) {
						heatmapData[day] = {};
					}
					times.forEach((time) => {
						if (!heatmapData[day][time]) {
							heatmapData[day][time] = 0;
						}
						heatmapData[day][time] = (heatmapData[day][time] as number) + 1;
					});
				});
			}
		);
	
		// Assign colors based on counts
		const maxCount = Math.max(
			...Object.values(heatmapData).flatMap((dayData) =>
				Object.values(dayData).map((count) => count as number)
			)
		);
	
		Object.keys(heatmapData).forEach((day) => {
			Object.keys(heatmapData[day]).forEach((time) => {
				const count = heatmapData[day][time] as number;
				const intensity = Math.floor((count / maxCount) * 7);
				heatmapData[day][time] = `bg-secondary-${100 + intensity * 100}`;
			});
		});
		info('Heatmap data:', JSON.stringify(heatmapData));
	} else {
		info('No availability data');
	}
</script>

<div class="flex flex-row">
	<!-- 
		THIS IS THE WORST FUCKING WORKAROUND TO GET THE TIMES ALIGNED BUT IT WORKS
		I CANT BELIEVE THIS SHIT WORKS, THIS IS THE WORST WORKAROUND IVE EVER DONE.

		I'VE BEEN LOSING MY MIND OVER THIS FUCKING THING I WANNA CRY LMAO

		this uses the same code as the one used for creating the timeSlots, adjusting the margins and making border transparent (marking it as important)
		we can't just remove the border because that would adjust the height (WHICH ISN'T SUPPOSED TO HAPPEN BECAUSE OF FUCKING "border-box" BUT YOU KNOW, FUCK ME!!!)
	-->
	<div class="mr-2 flex flex-col">
		<div class="h-9"></div>
		{#each Array(Math.ceil(timeSlotTimes.length / 4)) as _, groupIndex}
			<div class="group flex flex-col !border-transparent">
				{#each timeSlotTimes.slice(groupIndex * 4, (groupIndex + 1) * 4) as timeSlot, i}
					<div class="h-3 w-16 text-right text-sm">
						{#if i % 4 === 0}
							{timeSlot}
						{/if}
					</div>
					{#if (i + 1) % 2 === 0 && (i + 1) % 4 !== 0}
						<div class="box-border border-t-2 border-transparent"></div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
	{#each days as dayObject}
		<div
			class="flex w-16 flex-col"
			data-day="{dayObject.year}-{dayObject.month + 1}-{dayObject.day}"
		>
			<div class="flex flex-col items-center">
				<h1 class="text-lg">{shortDay(dayObject)}</h1>
				<h1 class="text-xs">{shortDate(dayObject)}</h1>
			</div>
			<div class="flex flex-col items-center">
				{#each Array(Math.ceil((timeSlotTimes.length - 1) / 4)) as _, groupIndex}
				<div class="group flex flex-col">
					{#each timeSlotTimes.slice(groupIndex * 4, (groupIndex + 1) * 4) as timeSlot, i}
						<button
							class="time-slot h-3 w-16 {heatmapData[dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day]?.[timeSlot] ?? 'bg-gray-400'}"
							aria-label={timeSlot}
							onclick={() => selected(dayObject, timeSlot)}
							onpointerdown={(e) => onpointerdown(e, dayObject, timeSlot)}
							{onpointerup}
							onpointerenter={(e) => onpointerenter(e, dayObject, timeSlot)}
						></button>
						{#if (i + 1) % 2 === 0 && (i + 1) % 4 !== 0}
							<div class="box-border border-t-2 border-dashed border-secondary-500"></div>
						{/if}
					{/each}
				</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	/* very weird workaround so the borders are the same size of 2px, because again this code is great */
	.group {
		box-sizing: border-box;
		border-top: 1px solid theme('colors.secondary.500');
		border-bottom: 1px solid theme('colors.secondary.500');
		border-left: 2px solid theme('colors.secondary.500');
		border-right: 2px solid theme('colors.secondary.500');
	}

	.group:first-child {
		border-top: 2px solid theme('colors.secondary.500');
	}

	.group:last-child {
		border-bottom: 2px solid theme('colors.secondary.500');
	}
</style>
