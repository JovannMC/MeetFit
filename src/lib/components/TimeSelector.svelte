<script lang="ts">
	import { updateAttendee } from '$lib/api';
	import type { Availability, Day } from '$lib/common';
	import { formatTime } from '$lib/common';
	import { onMount } from 'svelte';
	import { error, info } from '../../routes/log';

	interface Props {
		days: Day[];
		// idk why Availability[] doesn't work here but it's fine in the event page
		availabilityData: any;
		rangeStart: number;
		rangeEnd: number;
		timeFormat: number;
		selectedTimes: { day: string; times: string[] }[];
		isAuthenticated: boolean | null;
		username: string;
		eventId: string;
	}

	let {
		days,
		availabilityData,
		rangeStart,
		rangeEnd,
		timeFormat,
		selectedTimes = $bindable(),
		isAuthenticated = $bindable(),
		username = $bindable(),
		eventId = $bindable()
	}: Props = $props();

	// intentionally unused. this is so tailwind can generate the css for these colours as it doesn't detect if it's dynamically loaded
	// this would lead to the colours not being generated in the final css file by tailwind
	const colourVariants = [
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
	let excludedNames: string[] = $state([]);

	export function loadHeatmapData() {
		heatmapData = {};
		if (availabilityData) {
			availabilityData.forEach(
				({ name, availability }: { name: string; availability: Availability[] }) => {
					if (!availability || excludedNames.includes(name)) return;
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
		} else {
			info('No availability data for heatmap');
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
	let isLocked = false;
	let highlighted: HTMLElement | null = null;

	const removeHighlighted = () => {
		const timeSlots = document.querySelectorAll('.time-slot');
		timeSlots.forEach((slot) => {
			slot.classList.remove('highlighted');
		});

		if (highlighted) highlighted = null;
	};

	let hoveredTimeslot = $state({
		startTime: '0:00',
		endTime: '0:00',
		availability: {
			maxAttendees: 0,
			attending: 0,
			names: ['']
		}
	});

	const updateTimeSlot = (day: Day, time: string) => {
		const key = `${day.year}-${day.month + 1}-${day.day}`;
		const [hours, minutes] = time.split(':').map(Number);
		const endTimeHours = minutes + 15 >= 60 ? hours + 1 : hours;
		const endTimeMinutes = (minutes + 15) % 60;
		const endTime = `${endTimeHours}:${endTimeMinutes < 10 ? '0' : ''}${endTimeMinutes}`;

		const attending =
			availabilityData?.filter(
				({ availability, name }: { availability?: Availability[]; name: string }) =>
					!excludedNames.includes(name) &&
					availability?.some((a) => a.day === key && a.times.includes(time))
			).length ?? 0;

		const maxAttendees =
			availabilityData?.filter(({ name }: { name: string }) => !excludedNames.includes(name))
				.length ?? 0;

		const names =
			availabilityData
				?.filter(
					({ availability, name }: { availability?: Availability[]; name: string }) =>
						!excludedNames.includes(name) &&
						availability?.some((a) => a.day === key && a.times.includes(time))
				)
				.map(({ name }: { name: string }) => name) ?? [];

		hoveredTimeslot = {
			startTime: time,
			endTime,
			availability: {
				maxAttendees,
				attending,
				names
			}
		};
	};

	function handleClickSlot(event: Event, day: Day, time: string) {
		if (isAuthenticated) return;
		const classList = (event.target as HTMLElement).classList;

		if (!isLocked) {
			removeHighlighted();
			classList.add('highlighted');
			highlighted = event.target as HTMLElement;
			isLocked = true;
			updateTimeSlot(day, time);
		} else if (isLocked && highlighted === (event.target as HTMLElement)) {
			highlighted?.classList.remove('highlighted');
			isLocked = false;
		} else {
			highlighted?.classList.remove('highlighted');
			classList.add('highlighted');
			highlighted = event.target as HTMLElement;
			isLocked = true;
			updateTimeSlot(day, time);
		}
	}

	function handlePointerDownSlot(event: Event, day: Day, time: string) {
		const classList = (event.target as HTMLElement).classList;

		if (!isAuthenticated) return;
		isDragging = true;
		info(`Starting selection from ${day.year}-${day.month + 1}-${day.day} ${time}`);
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

	async function handlePointerUpSlot() {
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
	function handlePointerEnterSlot(event: Event, day: Day, time: string) {
		if (!isLocked) updateTimeSlot(day, time);

		if (!isAuthenticated) return;
		if (isDragging) {
			const classList = (event.target as HTMLElement).classList;
			if (isSelecting) {
				selectTimeSlot(day, time);
				classList.add('selected');
			} else {
				deselectTimeSlot(day, time);
				classList.remove('selected');
			}
		}
	}

	/*
	 * Attendee name logic
	 */

	function handleClickName(event: Event) {
		if (isAuthenticated) return;

		// exclude the clicked name from the list
		const name = (event.target as HTMLElement).getAttribute('title') ?? '';
		if (excludedNames.includes(name)) {
			excludedNames.splice(excludedNames.indexOf(name), 1);
			info(`Including ${name} in heatmap`);

			// increment attending count
			if (hoveredTimeslot.availability.names.includes(name)) {
				hoveredTimeslot.availability.attending += 1;
			}
		} else {
			excludedNames.push(name);
			info(`Excluding ${name} from heatmap`);

			// decrement attending count
			if (hoveredTimeslot.availability.names.includes(name)) {
				hoveredTimeslot.availability.attending -= 1;
			}
		}

		// update max attendees count
		hoveredTimeslot.availability.maxAttendees = availabilityData.filter(
			({ name }: { name: string }) => !excludedNames.includes(name)
		).length;

		// update heatmap
		loadHeatmapData();
	}

	function handlePointerEnterName(name: string) {
		if (isAuthenticated) return;

		// Reset all time slots to !bg-gray-500
		const timeSlots = document.querySelectorAll('.time-slot');
		timeSlots.forEach((slot) => {
			slot.classList.add('!bg-gray-500');
			slot.classList.remove('!bg-primary-500');
		});

		// Highlight the time slots that the user is attending
		availabilityData?.forEach(
			({ name: attendeeName, availability }: { name: string; availability: Availability[] }) => {
				if (attendeeName === name) {
					availability.forEach(({ day, times }: { day: string; times: string[] }) => {
						times.forEach((time) => {
							const dayElement = document.querySelector(`[data-day="${day}"]`);
							if (dayElement) {
								const timeSlotElement = dayElement.querySelector(`[aria-label="${time}"]`);
								if (timeSlotElement) {
									timeSlotElement.classList.add('!bg-primary-500');
									timeSlotElement.classList.remove('!bg-gray-500');
								}
							}
						});
					});
				}
			}
		);
	}

	function handlePointerLeaveName() {
		if (isAuthenticated) return;

		// Restore the original heatmap data
		const timeSlots = document.querySelectorAll('.time-slot');
		timeSlots.forEach((slot) => {
			slot.classList.remove('!bg-gray-500', '!bg-primary-500');
			const day = slot.closest('[data-day]')?.getAttribute('data-day');
			const time = slot.getAttribute('aria-label');
			if (day && time && heatmapData[day]?.[time]) {
				slot.classList.add(String(heatmapData[day][time]));
			}
		});
	}

	onMount(() => {
		window.addEventListener('pointerup', handlePointerUpSlot);
		window.addEventListener('pointerdown', (event) => {
			const classList = (event.target as HTMLElement).classList;
			if (!classList.contains('time-slot')) {
				removeHighlighted();
				isLocked = false;
			}
		});
	});

	$effect(() => {
		info(`Attendees: ${JSON.stringify(attendees)}`);
	});
</script>

<div class="flex flex-col gap-4 max-sm:container">
	<div
		class="flex flex-col items-center gap-1 rounded-lg border-2 border-secondary-500 p-4 text-center"
	>
		<h1 class="text-sm">
			{#if timeFormat === 12}
				{@const { startTime, endTime } = hoveredTimeslot}
				{formatTime(startTime)} - {formatTime(endTime)}
			{:else}
				{hoveredTimeslot.startTime} - {hoveredTimeslot.endTime}
			{/if}
		</h1>
		{#if !isAuthenticated}
			{@const { maxAttendees, attending, names } = hoveredTimeslot.availability}
			<h1 class="text-sm">
				{attending}/{maxAttendees} available
			</h1>
			<div class="flex flex-row flex-wrap gap-1">
				{#each attendees as name}
					<button
						type="button"
						class="fade-in rounded-md border-2 border-primary-500 px-1 text-sm {names.includes(name)
							? 'bg-primary-500'
							: ''}
							{excludedNames.includes(name) ? 'text-gray-400' : ''}"
						title={name}
						onpointerenter={() => handlePointerEnterName(name)}
						onpointerleave={handlePointerLeaveName}
						onclick={(e) => handleClickName(e)}
						onfocus={() => handlePointerEnterName(name)}
						onblur={handlePointerLeaveName}
					>
						{name.length > 10 ? name.slice(0, 10) + '...' : name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex flex-row gap-1 max-sm:overflow-x-auto max-sm:overflow-y-hidden">
		<div class="z-10 mr-2 flex flex-col bg-gray-500 max-sm:sticky max-sm:left-0 max-sm:pr-2">
			<div class="h-8"></div>
			<!-- ok look, i don't have any idea how this works either -->
			{#each Array(Math.ceil(timeSlotTimes.length / 4)) as _, groupIndex}
				<div class="group flex flex-col !border-transparent">
					{#each timeSlotTimes.slice(groupIndex * 4, (groupIndex + 1) * 4) as timeSlot, i}
						<div class="h-3 text-right text-sm" style="margin-bottom: -2px;">
							{#if i % 4 === 0}
								{#if timeFormat === 12}
									{formatTime(timeSlot, false)}
								{:else}
									{timeSlot}
								{/if}
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
										class="time-slot fade-in h-3 w-16 {heatmapData[
											dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day
										]?.[timeSlot] ?? 'bg-gray-500'}"
										aria-label={timeSlot}
										onpointerdown={(e) => handlePointerDownSlot(e, dayObject, timeSlot)}
										onpointerup={handlePointerUpSlot}
										onpointerenter={(e) => handlePointerEnterSlot(e, dayObject, timeSlot)}
										onfocus={(e) => handlePointerEnterSlot(e, dayObject, timeSlot)}
										onclick={(e) => handleClickSlot(e, dayObject, timeSlot)}
										style="margin-bottom: -2px;"
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
		/* how tf do you fix the inconsistent borders */
		border: 2px solid theme('colors.secondary.500');
	}

	.group:last-child {
		border-bottom: 4px solid theme('colors.secondary.500');
	}

	.time-slot:hover {
		filter: brightness(1.2);
	}
</style>
