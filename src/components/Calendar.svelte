<script lang="ts">
	import { onMount } from 'svelte';
	import { info } from '../routes/log';

	let startingDay = 'Monday';

	const date = new Date();
	const month = date.getMonth();
	const year = date.getFullYear();

	const daysPrevious = daysInMonth(month - 1, year);
	const daysCurrent = daysInMonth(month, year);
	const daysNext = daysInMonth(month + 1, year);

	const daysPreviousObject = Array.from({ length: daysPrevious }, (_, i) => ({
		day: i + 1,
		name: new Date(year, month - 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
	}));

	const daysCurrentObject = Array.from({ length: daysCurrent }, (_, i) => ({
		day: i + 1,
		name: new Date(year, month, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
	}));

	const daysNextObject = Array.from({ length: daysNext }, (_, i) => ({
		day: i + 1,
		name: new Date(year, month + 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' })
	}));

	const firstDayOfWeek = new Date(year, month, 1).getDay();
	const lastDayOfWeek = new Date(year, month, daysCurrent).getDay();

	const calendar = {
		previousMonth:
			firstDayOfWeek !== 0
				? daysPreviousObject.slice(-firstDayOfWeek).map((day) => ({
						...day,
						month: month - 1,
						year: month === 0 ? year - 1 : year
					}))
				: [],
		currentMonth: daysCurrentObject.map((day) => ({
			...day,
			month: month,
			year: year
		})),
		nextMonth:
			lastDayOfWeek !== 6
				? daysNextObject.slice(0, 6 - lastDayOfWeek).map((day) => ({
						...day,
						month: month + 1,
						year: month === 11 ? year + 1 : year
					}))
				: []
	};

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

	function daysInMonth(month: number, year: number) {
		// 0-indexed months
		return new Date(year, month + 1, 1).getDate();
	}

	onMount(() => {
		info(`Date: ${date}`);
		info(`Days in month of ${monthNames[month - 1]}: ${daysPrevious}`);
		info(`Days in month of ${monthNames[month]}: ${daysCurrent}`);
		info(`Days in month of ${monthNames[month + 1]}: ${daysNext}`);

		info(
			`Days in month of previous month (${monthNames[month - 1]}): ${JSON.stringify(daysPreviousObject)}`
		);
		info(
			`Days in month of current month (${monthNames[month]}): ${JSON.stringify(daysCurrentObject)}`
		);
		info(
			`Days in month of next month (${monthNames[month + 1]}): ${JSON.stringify(daysNextObject)}`
		);
	});
</script>

<div class="flex flex-col p-6 bg-surface-800 items-center justify-center gap-1">
	<div class="flex flex-row gap-3">
		<button>&lt;</button>
		<h1>{monthNames[month]} {year}</h1>
		<button>&gt;</button>
	</div>
	<div class="flex flex-col gap-1 text-center">
		<div class="flex flex-row gap-1">
			<div class="w-10 bg-primary-500">Mon</div>
			<div class="w-10 bg-primary-500">Tue</div>
			<div class="w-10 bg-primary-500">Wed</div>
			<div class="w-10 bg-primary-500">Thu</div>
			<div class="w-10 bg-primary-500">Fri</div>
			<div class="w-10 bg-primary-800">Sat</div>
			<div class="w-10 bg-primary-800">Sun</div>
		</div>
		<div class="grid grid-cols-7 gap-1">
			{#each Array(calendar.previousMonth.length).fill(0) as _, i}
				<div
					class="h-10 w-10 content-center {calendar.previousMonth[i].name === 'Saturday' ||
					calendar.previousMonth[i].name === 'Sunday'
						? 'bg-secondary-900'
						: 'bg-secondary-800'}"
				>
					{calendar.previousMonth[i].day}
				</div>
			{/each}
			{#each Array(calendar.currentMonth.length).fill(0) as _, i}
				<div
					class="h-10 w-10 content-center {calendar.currentMonth[i].name === 'Saturday' ||
					calendar.currentMonth[i].name === 'Sunday'
						? 'bg-secondary-700'
						: 'bg-secondary-600'}"
				>
					{calendar.currentMonth[i].day}
				</div>
			{/each}
			{#each Array(calendar.nextMonth.length).fill(0) as _, i}
				<div
					class="h-10 w-10 content-center {calendar.nextMonth[i].name === 'Saturday' ||
					calendar.nextMonth[i].name === 'Sunday'
						? 'bg-secondary-900'
						: 'bg-secondary-800'}"
				>
					{calendar.nextMonth[i].day}
				</div>
			{/each}
		</div>
	</div>
</div>
