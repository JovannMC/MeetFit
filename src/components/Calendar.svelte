<script lang="ts">
	
	let { startingDay = 'Monday' } = $props();

	const date = new Date();
	let month = $state(date.getMonth()); // Current month (0-11)
	let year = $state(date.getFullYear()); // Current year

	// Function to calculate days in a given month, adjusting for overflow/underflow
	const daysInMonth = (month: number, year: number) => {
		// Wrap months into valid ranges
		if (month < 0) {
			month = 11;
			year -= 1;
		} else if (month > 11) {
			month = 0;
			year += 1;
		}
		// Return the number of days in the month
		return (new Date(year, month + 1, 0).getDate()) + 1;
	};

	// Days in current, previous, and next months
	const daysCurrent = $derived(daysInMonth(month, year));
	const daysPrevious = $derived(daysInMonth(month - 1, year));
	const daysNext = $derived(daysInMonth(month + 1, year));

	const daysPreviousObject = $derived(Array.from({ length: daysPrevious }, (_, i) => ({
		day: i + 1,
		name: new Date(year, month - 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
	})));

	const daysCurrentObject = $derived(Array.from({ length: daysCurrent }, (_, i) => ({
		day: i + 1,
		name: new Date(year, month, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
	})));

	const daysNextObject = $derived(Array.from({ length: daysNext }, (_, i) => ({
		day: i + 1,
		name: new Date(year, month + 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
	})));

	const weekdayMap = new Map([
		['Monday', 0],
		['Tuesday', 1],
		['Wednesday', 2],
		['Thursday', 3],
		['Friday', 4],
		['Saturday', 5],
		['Sunday', 6]
	]);

	let calendar: { previousMonth: any; currentMonth: any; nextMonth: any } = $state({
		previousMonth: [],
		currentMonth: [],
		nextMonth: []
	});

	const originalWeekdays = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	];

	const startDayIndex = $derived(weekdayMap.get(startingDay) ?? 0);
	const daysInWeek = $derived(
		originalWeekdays.slice(startDayIndex).concat(originalWeekdays.slice(0, startDayIndex))
	);

	const weekdays = $derived(daysInWeek.slice(0, 5));
	const weekend = $derived(daysInWeek.slice(-2));

	$effect(() => {
		const firstDayOfWeek = (new Date(year, month, 1).getDay() - startDayIndex + 7) % 7;
		const lastDayOfWeek = (new Date(year, month, daysCurrent).getDay() - startDayIndex + 7) % 7;

		const adjustMonthYear = (month: number, year: number) => {
			if (month < 0) return { month: 11, year: year - 1 };
			if (month > 11) return { month: 0, year: year + 1 };
			return { month, year };
		};

		calendar = {
			previousMonth:
				firstDayOfWeek !== 0
					? daysPreviousObject.slice(-firstDayOfWeek).map((day) => {
							const { month: adjMonth, year: adjYear } = adjustMonthYear(month - 1, year);
							return { ...day, month: adjMonth, year: adjYear };
						})
					: [],
			currentMonth: daysCurrentObject.map((day) => ({
				...day,
				month,
				year
			})),
			nextMonth:
				lastDayOfWeek !== 6
					? daysNextObject.slice(0, 6 - lastDayOfWeek).map((day) => {
							const { month: adjMonth, year: adjYear } = adjustMonthYear(month + 1, year);
							return { ...day, month: adjMonth, year: adjYear };
						})
					: []
		};
	});

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	// Change month logic
	const changeMonth = (direction: number) => {
		if (direction === -1) {
			month -= 1;
			if (month < 0) {
				month = 11;
				year -= 1;
			}
		} else {
			month += 1;
			if (month > 11) {
				month = 0;
				year += 1;
			}
		}
	};
</script>

<div class="flex flex-col items-center justify-center gap-1 bg-surface-800 p-6">
	<div class="flex flex-row gap-3">
		<button onclick={() => changeMonth(-1)}>&lt;</button>
		<h1>{monthNames[month]} {year}</h1>
		<button onclick={() => changeMonth(1)}>&gt;</button>
	</div>
	<div class="flex flex-col gap-1 text-center">
		<div class="flex flex-row gap-1">
			{#each daysInWeek as day, index}
				<div class="w-10 {index >= 5 ? 'bg-primary-800' : 'bg-primary-500'}">{day.slice(0, 3)}</div>
			{/each}
		</div>
		<div class="grid grid-cols-7 gap-1">
			{#each calendar.previousMonth as day}
				<div
					class="h-10 w-10 content-center {weekend.includes(day.name)
						? 'bg-secondary-900'
						: 'bg-secondary-800'}"
				>
					{day.day}
				</div>
			{/each}
			{#each calendar.currentMonth as day}
				<div
					class="h-10 w-10 content-center {weekend.includes(day.name)
						? 'bg-secondary-700'
						: 'bg-secondary-600'}"
				>
					{day.day}
				</div>
			{/each}
			{#each calendar.nextMonth as day}
				<div
					class="h-10 w-10 content-center {weekend.includes(day.name)
						? 'bg-secondary-900'
						: 'bg-secondary-800'}"
				>
					{day.day}
				</div>
			{/each}
		</div>
	</div>
</div>
