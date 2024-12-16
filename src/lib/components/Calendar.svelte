<script lang="ts">
	import { type Day, days, months } from '$lib/common';
	import { onMount } from 'svelte';
	import { info } from '../../routes/log';

	interface Props {
		startingDay: string;
		selected: Day[];
	}

	let { startingDay = 'Monday', selected = $bindable() }: Props = $props();

	const date = new Date();
	let month = $state(date.getMonth());
	let year = $state(date.getFullYear());

	/*
	 * Calendar logic
	 */
	let calendar: { previousMonth: Day[]; currentMonth: Day[]; nextMonth: Day[] } = $state({
		previousMonth: [],
		currentMonth: [],
		nextMonth: []
	});

	const weekdayMap = new Map(days.map((day, i) => [day, i]));
	const startDayIndex = $derived(weekdayMap.get(startingDay) ?? 0);
	const daysInWeek = $derived(days.slice(startDayIndex).concat(days.slice(0, startDayIndex)));

	const weekdays = $derived(daysInWeek.slice(0, 5));
	const weekend = $derived(daysInWeek.slice(-2));

	$effect(() => {
		const daysCurrent = daysInMonth(month, year);
		info(`Current month, ${months[month]} ${year}, has ${daysCurrent} days.`);
		const daysPrevious = daysInMonth(month - 1, year);
		info(`Previous month, ${months[month - 1]} ${year}, has ${daysPrevious} days.`);

		const firstDayOfWeek = (new Date(year, month, 0).getDay() - startDayIndex + 7) % 7;
		const lastDayOfWeek = (new Date(year, month, daysCurrent).getDay() - startDayIndex + 7) % 7;

		// Function to calculate how many days needed to fill in
		const calculateAdjacentMonthDays = (
			length: number,
			startDay: number,
			monthOffset: number,
			year: number
		) => {
			return Array.from({ length }, (_, i) => {
				const { month: adjMonth, year: adjYear } = adjustMonthYear(month + monthOffset, year);
				const day = startDay + i + 1;
				return createDayObject(day, adjMonth, adjYear);
			});
		};

		calendar = {
			// Check if first day of the month is not the first day of the week, to calculate how many days to fill in
			previousMonth:
				firstDayOfWeek !== 0
					? calculateAdjacentMonthDays(firstDayOfWeek, daysPrevious - firstDayOfWeek, -1, year)
					: [],
			currentMonth: Array.from({ length: daysCurrent }, (_, i) =>
				createDayObject(i + 1, month, year)
			),
			// Check if last day of the month is not the last day of the week, to calculate how many days to fill in
			nextMonth:
				lastDayOfWeek !== 6 ? calculateAdjacentMonthDays(7 - lastDayOfWeek, 0, 1, year) : []
		};
	});

	const changeMonth = (direction: number) => {
		const { month: newMonth, year: newYear } = adjustMonthYear(month + direction, year);
		month = newMonth;
		year = newYear;
	};

	/*
	 * Selection logic
	 */
	const isSameDay = (day1: Day, day2: Day) => {
		return day1.day === day2.day && day1.month === day2.month && day1.year === day2.year;
	};

	const select = (day: Day) => {
		if (![...selected].some((selectedDay: Day) => isSameDay(selectedDay, day))) {
			selected.push(day);
		}
	};

	const deselect = (day: Day) => {
		selected.forEach((selectedDay: Day) => {
			if (isSameDay(selectedDay, day)) {
				selected.splice(selected.indexOf(selectedDay), 1);
			}
		});
	};

	let isDragging = false;
	let isSelecting = false;
	let isDeselecting = false;
	let startDrag: Day;
	let startDragIndex: number;

	function handlePointerDown(event: any) {
		isDragging = true;
		startDrag = JSON.parse(event.target.getAttribute('data-day')) as Day;
		startDragIndex = Array.from(document.querySelectorAll('.day')).indexOf(event.target);

		const classList = event.target.classList;
		if (classList.contains('!bg-primary-800')) {
			isSelecting = false;
			isDeselecting = true;
			deselect(startDrag);
			classList.remove('!bg-primary-800');
			info(`Starting deselection from ${startDrag.year}/${startDrag.month + 1}/${startDrag.day}`);
		} else {
			isSelecting = true;
			isDeselecting = false;
			select(startDrag);
			classList.add('!bg-primary-800');
			info(`Starting selection from ${startDrag.year}/${startDrag.month + 1}/${startDrag.day}`);
		}
	}

	function handlePointerUp() {
		isSelecting = false;
		isDeselecting = false;

		if (isDragging) {
			info(
				`Selected days: ${selected.map((day: Day) => `${day.year}/${day.month + 1}/${day.day}`).join(', ')}`
			);
			isDragging = false;
		}
	}

	function handlePointerEnter(event: any) {
		const currentIndex = Array.from(document.querySelectorAll('.day')).indexOf(event.target);

		if (isDragging) {
			const startRow = Math.floor(startDragIndex / 7);
			const startCol = startDragIndex % 7;
			const currentRow = Math.floor(currentIndex / 7);
			const currentCol = currentIndex % 7;

			const rowStart = Math.min(startRow, currentRow);
			const rowEnd = Math.max(startRow, currentRow);
			const colStart = Math.min(startCol, currentCol);
			const colEnd = Math.max(startCol, currentCol);

			for (let row = rowStart; row <= rowEnd; row++) {
				for (let col = colStart; col <= colEnd; col++) {
					const index = row * 7 + col;
					const dayElement = document.querySelectorAll('.day')[index];
					const day = JSON.parse(dayElement.getAttribute('data-day') || '{}') as Day;

					if (dayElement) {
						if (isSelecting) {
							select(day);
							dayElement.classList.add('!bg-primary-800');
						} else {
							deselect(day);
							dayElement.classList.remove('!bg-primary-800');
						}
					}
				}
			}
		}
	}

	onMount(() => {
		// Handles pointer up event outside of the calendar
		window.addEventListener('pointerup', handlePointerUp);
	});

	/*
	 * Helper functions
	 */
	const adjustMonthYear = (month: number, year: number) => {
		if (month < 0) return { month: 11, year: year - 1 };
		if (month > 11) return { month: 0, year: year + 1 };
		return { month, year };
	};

	const daysInMonth = (month: number, year: number) => {
		const { month: newMonth, year: newYear } = adjustMonthYear(month, year);
		return new Date(newYear, newMonth + 1, 0).getDate();
	};

	const createDayObject = (day: number, month: number, year: number): Day => {
		const date = new Date(year, month, day);
		const name = date.toLocaleDateString('en-US', { weekday: 'long' });
		const today = new Date();
		const isToday = date.toDateString() === today.toDateString();
		const isWeekend = weekend.includes(name);
		const isPast = date < today;

		return {
			name,
			day,
			month,
			year,
			isWeekend,
			isToday,
			isPast
		};
	};
</script>

<!-- TODO: use skeleton's pagination? -->
<div class="flex flex-col items-center justify-center gap-4 p-6">
	<div class="flex flex-row items-center gap-3">
		<button class="h-7 w-7 rounded-lg bg-primary-500 text-white" onclick={() => changeMonth(-1)}
			>&lt;</button
		>
		<h1 class="w-48 text-center text-lg">{months[month]} {year}</h1>
		<button class="h-7 w-7 rounded-lg bg-primary-500 text-white" onclick={() => changeMonth(1)}
			>&gt;</button
		>
	</div>
	<div class="flex flex-col gap-1 text-center">
		<div class="flex flex-row gap-1">
			{#each daysInWeek as day, i}
				<div class="w-10 sm:w-12 {i >= 5 ? 'bg-primary-800' : 'bg-primary-500'}">
					{day.slice(0, 3)}
				</div>
			{/each}
		</div>
		<div class="grid grid-cols-7 gap-1">
			{#each calendar.previousMonth as day}
				<button
					class="day h-10 w-10 content-center bg-secondary-800 text-xl sm:h-12 sm:w-12
					{day.isPast ? 'text-gray-400' : ''}"
					onpointerdown={handlePointerDown}
					onpointerenter={handlePointerEnter}
					onpointerup={handlePointerUp}
					data-day={JSON.stringify(day)}
				>
					{day.day}
				</button>
			{/each}
			{#each calendar.currentMonth as day}
				<button
					class="day h-10 w-10 content-center text-xl sm:h-12 sm:w-12
						{day.isWeekend ? 'bg-secondary-700' : 'bg-secondary-600'}
						{day.isToday ? 'text-green-400' : ''}
						{day.isPast ? 'text-gray-400' : ''}"
					onpointerdown={handlePointerDown}
					onpointerenter={handlePointerEnter}
					onpointerup={handlePointerUp}
					data-day={JSON.stringify(day)}
				>
					{day.day}
				</button>
			{/each}
			<!-- FIXME for some reason, some months don't fill in the rest of the calendar (e.g. november 2024 on monday starting day) -->
			{#each calendar.nextMonth as day}
				<button
					class="day h-10 w-10 content-center bg-secondary-800 text-xl sm:h-12 sm:w-12
					{day.isPast ? 'text-gray-400' : ''}"
					onpointerdown={handlePointerDown}
					onpointerenter={handlePointerEnter}
					onpointerup={handlePointerUp}
					data-day={JSON.stringify(day)}
				>
					{day.day}
				</button>
			{/each}
		</div>
	</div>
</div>
