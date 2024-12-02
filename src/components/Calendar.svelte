<script lang="ts">
	export let startingDay = 'Monday';

	const currentDate = new Date();
	let month = currentDate.getMonth();
	let year = currentDate.getFullYear();

	const daysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();

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

	const weekdayMap = new Map([
		['Monday', 0],
		['Tuesday', 1],
		['Wednesday', 2],
		['Thursday', 3],
		['Friday', 4],
		['Saturday', 5],
		['Sunday', 6]
	]);

	let calendar: { previousMonth: any; currentMonth: any; nextMonth: any };

	const originalWeekdays = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	];
	$: startDayIndex = weekdayMap.get(startingDay) ?? 0;
	$: daysInWeek = originalWeekdays
		.slice(startDayIndex)
		.concat(originalWeekdays.slice(0, startDayIndex));

	$: weekdays = daysInWeek.slice(0, 5);
	$: weekend = weekdays.slice(-2);

	$: {
		const firstDayOfWeek = (new Date(year, month, 1).getDay() - startDayIndex + 7) % 7;
		const lastDayOfWeek = (new Date(year, month, daysCurrent).getDay() - startDayIndex + 7) % 7;

		calendar = {
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
	}

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
		<button on:click={() => changeMonth(-1)}>&lt;</button>
		<h1>{monthNames[month]} {year}</h1>
		<button on:click={() => changeMonth(1)}>&gt;</button>
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
