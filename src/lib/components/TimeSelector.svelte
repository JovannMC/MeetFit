<script lang="ts">
	import { updateAttendee } from '$lib/api';
	import type { Availability, Day } from '$lib/common';
	import { onMount } from 'svelte';
	import { error, info } from '../../routes/log';

	let {
		days,
		availabilityData,
		rangeStart,
		rangeEnd,
		selectedTimes = $bindable(),
		isAuthenticated = $bindable(),
		username = $bindable(),
		eventId = $bindable()
	} = $props();

	// intentionally unused. this is so tailwind can generate the css for these colours as it doesn't detect if it's dynamically loaded
	// this would lead to the colours not being generated in the final css file by tailwind
	const colorVariants = [
		'bg-gray-500',
		'bg-primary-100',
		'bg-primary-200',
		'bg-primary-300',
		'bg-primary-400',
		'bg-primary-500',
		'bg-primary-600',
		'bg-primary-700',
		'bg-primary-800',
		'bg-primary-900'
	];

	let attendees = availabilityData?.map(({ name }: { name: string }) => name) ?? [''];
	info(`Attendees: ${JSON.stringify(attendees)}`);
	let hoveredTimeslot = $state({
		startTime: '0:00',
		endTime: '0:00',
		availability: {
			attending: 0,
			maxAttendees: 0,
			names: ['']
		}
	});

	// Calculate amount of time slots
	const timeSlots = (rangeEnd - rangeStart + 0.25) / 0.25;
	info(`Time slot count: ${timeSlots}`);
	const timeSlotTimes = Array(timeSlots)
		.fill(0)
		.map((_, i) => {
			const time = rangeStart + i * 0.25;
			const hours = Math.floor(time);
			let minutes = (time - hours) * 60;
			return `${hours}:${minutes === 0 ? '00' : minutes}`;
		});

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

	/*
	 * Heatmap logic
	 */

	let heatmapData: { [key: string]: { [key: string]: number | string } } = $state({});

	export function loadHeatmapData() {
		heatmapData = {};
		if (availabilityData) {
			availabilityData.forEach(({ availability }: { availability: Availability[] }) => {
				if (!availability) return;
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
			});

			const maxCount = Math.max(
				...Object.values(heatmapData).flatMap((dayData) =>
					Object.values(dayData).map((count) => count as number)
				)
			);

			Object.keys(heatmapData).forEach((day) => {
				Object.keys(heatmapData[day]).forEach((time) => {
					const count = heatmapData[day][time] as number;
					const intensity = Math.floor((count / maxCount) * 7);
					heatmapData[day][time] = `bg-primary-${100 + intensity * 100}`;
				});
			});
			info('Heatmap data:', JSON.stringify(heatmapData));
		} else {
			info('No availability data');
		}
	}

	loadHeatmapData();

	/*
	 * Time slot selection logic
	 */

	function selectTimeSlot(day: Day, time: string) {
		const key = `${day.year}-${day.month + 1}-${day.day}`;
		let dayObject = selectedTimes.find((d: { day: string }) => d.day === key);

		if (!dayObject) {
			dayObject = { day: key, times: [] };
			selectedTimes = [...selectedTimes, dayObject];
		}

		if (!dayObject.times.includes(time)) {
			dayObject.times = [...dayObject.times, time];
			selectedTimes = [...selectedTimes];
		}

		info(`Selected time slot for ${key}: ${time}`);
	}

	function deselectTimeSlot(day: Day, time: string) {
		const key = `${day.year}-${day.month + 1}-${day.day}`;
		const dayObject = selectedTimes.find((d: { day: string }) => d.day === key);

		if (dayObject) {
			const index = dayObject.times.indexOf(time);
			if (index !== -1) {
				dayObject.times = [...dayObject.times.slice(0, index), ...dayObject.times.slice(index + 1)];
				selectedTimes = [...selectedTimes];
			}
		}

		info(`Deselected time slot for ${key}: ${time}`);
	}

	let isDragging = false;
	let isSelecting = false;
	let isDeselecting = false;

	function handlePointerDown(event: any, day: Day, time: string) {
		if (!isAuthenticated) return;
		isDragging = true;
		const classList = event.target.classList;
		if (classList.contains('selected')) {
			isSelecting = false;
			isDeselecting = true;
			deselectTimeSlot(day, time);
			classList.remove('selected');
		} else {
			isSelecting = true;
			isDeselecting = false;
			selectTimeSlot(day, time);
			classList.add('selected');
		}
	}

	async function handlePointerUp() {
		isDragging = false;
		if (isSelecting || isDeselecting) {
			isSelecting = false;
			isDeselecting = false;
			if (!username || !isAuthenticated) return;
			const availability = selectedTimes.map(
				({ day, times }: { day: string; times: string[] }) => ({
					day,
					times
				})
			);

			const result = await updateAttendee(eventId, username, { availability });

			if (result) {
				info(`Selected times saved successfully for ${username}: ${JSON.stringify(availability)}`);
			} else {
				error(`Failed to save selected times for ${username}: ${result.message}`);
			}
		}
	}

	// TODO: click and drag selection box/rectangle like Calendar.svelte
	function handlePointerEnter(event: any, day: Day, time: string) {
		if (!isAuthenticated) {
			const key = `${day.year}-${day.month + 1}-${day.day}`;
			const [hours, minutes] = time.split(':').map(Number);
			const endTimeHours = minutes + 15 >= 60 ? hours + 1 : hours;
			const endTimeMinutes = (minutes + 15) % 60;
			const endTime = `${endTimeHours}:${endTimeMinutes < 10 ? '0' : ''}${endTimeMinutes}`;

			const attending =
				availabilityData?.filter(({ availability }: { availability?: Availability[] }) =>
					availability?.some((a) => a.day === key && a.times.includes(time))
				).length ?? 0;

			const maxAttendees = availabilityData?.length ?? 0;

			const names =
				availabilityData
					?.filter(({ availability }: { availability?: Availability[] }) =>
						availability?.some((a) => a.day === key && a.times.includes(time))
					)
					.map(({ name }: { name: string }) => name) ?? [];

			hoveredTimeslot = {
				startTime: time,
				endTime,
				availability: {
					attending,
					maxAttendees,
					names
				}
			};
		} else {
			if (isDragging) {
				const classList = event.target.classList;
				if (isSelecting) {
					selectTimeSlot(day, time);
					classList.add('selected');
				} else {
					deselectTimeSlot(day, time);
					classList.remove('selected');
				}
			}
		}
	}

	onMount(() => {
		window.addEventListener('pointerup', handlePointerUp);
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col items-center gap-1 border-2 border-secondary-500 p-4 text-center">
		<h1 class="text-sm">{hoveredTimeslot.startTime}-{hoveredTimeslot.endTime}</h1>
		<h1 class="text-sm">
			{hoveredTimeslot.availability.attending}/{hoveredTimeslot.availability.maxAttendees} available
		</h1>
		<div class="flex flex-row gap-1">
			{#each attendees as name}
				<h1
					class="border-2 border-primary-500 px-1 text-sm {hoveredTimeslot.availability.names.includes(
						name
					)
						? 'bg-primary-500'
						: ''}"
					title={name}
				>
					{name.length > 10 ? name.slice(0, 10) + '...' : name}
				</h1>
			{/each}
		</div>
	</div>

	<div class="flex flex-row">
		<div class="mr-2 flex flex-col">
			<div class="h-9"></div>
			{#each Array(Math.ceil(timeSlotTimes.length / 4)) as _, groupIndex}
				<div class="group flex flex-col !border-transparent">
					{#each timeSlotTimes.slice(groupIndex * 4, (groupIndex + 1) * 4) as timeSlot, i}
						<div class="h-3 text-right text-sm">
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
								{#key heatmapData}
									<button
										class="time-slot h-3 w-16 {heatmapData[
											dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day
										]?.[timeSlot] ?? 'bg-gray-500'}"
										aria-label={timeSlot}
										onpointerdown={(e) => handlePointerDown(e, dayObject, timeSlot)}
										onpointerup={handlePointerUp}
										onpointerenter={(e) => handlePointerEnter(e, dayObject, timeSlot)}
									></button>
								{/key}
								{#if (i + 1) % 2 === 0 && (i + 1) % 4 !== 0}
									<div class="box-border border-t-2 border-dotted border-secondary-500"></div>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
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

	.time-slot {
		transition: background-color 0.2s ease;
	}
</style>
