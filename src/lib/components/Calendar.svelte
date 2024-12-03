<script lang="ts">
	import { days, months } from '$lib/common';
	let { startingDay = 'Monday' } = $props();

	// Date logic
	const date = new Date();
	let month = $state(date.getMonth());
	let year = $state(date.getFullYear());

	const daysInMonth = (month: number, year: number) => {
		if (month < 0) {
			month = 11;
			year -= 1;
		} else if (month > 11) {
			month = 0;
			year += 1;
		}
		return new Date(year, month + 1, 0).getDate() + 1;
	};

	// Days for the previous, current, and next month
	const daysPrevious = $derived(daysInMonth(month - 1, year));
	const daysCurrent = $derived(daysInMonth(month, year));
	const daysNext = $derived(daysInMonth(month + 1, year));

	const daysPreviousObject = $derived(
		Array.from({ length: daysPrevious }, (_, i) => ({
			day: i + 1,
			name: new Date(year, month - 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
		}))
	);

	const daysCurrentObject = $derived(
		Array.from({ length: daysCurrent }, (_, i) => ({
			day: i + 1,
			name: new Date(year, month, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
		}))
	);

	const daysNextObject = $derived(
		Array.from({ length: daysNext }, (_, i) => ({
			day: i + 1,
			name: new Date(year, month + 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
		}))
	);

	// Calendar logic
	let calendar: { previousMonth: any; currentMonth: any; nextMonth: any } = $state({
		previousMonth: [],
		currentMonth: [],
		nextMonth: []
	});

	const weekdayMap = new Map(days.map((day, index) => [day, index]));
	const startDayIndex = $derived(weekdayMap.get(startingDay) ?? 0);
	const daysInWeek = $derived(days.slice(startDayIndex).concat(days.slice(0, startDayIndex)));

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

<div class="flex flex-col items-center justify-center gap-4 bg-surface-800 p-6">
	<div class="flex flex-row items-center gap-3">
		<button class="h-6 w-6 rounded bg-primary-500 text-white" onclick={() => changeMonth(-1)}
			>&lt;</button
		>
		<h1 class="w-32 text-center">{months[month]} {year}</h1>
		<button class="h-6 w-6 rounded bg-primary-500 text-white" onclick={() => changeMonth(1)}
			>&gt;</button
		>
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
