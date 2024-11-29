<script lang="ts">
	import { onMount } from 'svelte';
	import { info } from '../routes/log';

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

        info(`Days in month of previous month (${monthNames[month - 1]}): ${JSON.stringify(daysPreviousObject)}`);
        info(`Days in month of current month (${monthNames[month]}): ${JSON.stringify(daysCurrentObject)}`);
        info(`Days in month of next month (${monthNames[month + 1]}): ${JSON.stringify(daysNextObject)}`);
	});
</script>

<div class="flex flex-col items-center justify-center bg-primary-800">
	<div class="flex flex-row gap-2">
		<button>&lt;</button>
		<h1>{monthNames[month]} {year}</h1>
		<button>&gt;</button>
	</div>
	<div class="flex flex-col text-center gap-1">
		<div class="flex flex-row gap-1">
			<div class="bg-secondary-800 w-10">Sun</div>
			<div class="bg-secondary-800 w-10">Mon</div>
			<div class="bg-secondary-800 w-10">Tue</div>
			<div class="bg-secondary-800 w-10">Wed</div>
			<div class="bg-secondary-800 w-10">Thu</div>
			<div class="bg-secondary-800 w-10">Fri</div>
			<div class="bg-secondary-800 w-10">Sat</div>
		</div>
        <div class="grid grid-cols-7 gap-1 justify-items-center">
            {#each Array(daysCurrent) as _, i}
                <div class="bg-tertiary-800 w-7 text-center">{i + 1}</div>
            {/each}
        </div>
	</div>
</div>
