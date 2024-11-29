<script lang="ts">
	import { onMount } from 'svelte';
	import { info } from '../routes/log';

	let date = new Date();
	let month = date.getMonth();
	let year = date.getFullYear();
	let days = daysInMonth(month, year);

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
		return new Date(year, month + 1, 1).getDate();
	}

	onMount(() => {
		info(`Date: ${date}`);
		info(`Days in month of ${monthNames[month]}: ${days}`);
	});
</script>

<div class="flex flex-col items-center justify-center bg-primary-800">
	<div class="flex flex-row gap-2">
		<button>&lt;</button>
		<h1>{monthNames[month]} {year}</h1>
		<button>&gt;</button>
	</div>
	<div class="flex flex-col text-center">
		<div class="flex flex-row gap-1">
			<div class="calendar-day">Sun</div>
			<div class="calendar-day">Mon</div>
			<div class="calendar-day">Tue</div>
			<div class="calendar-day">Wed</div>
			<div class="calendar-day">Thu</div>
			<div class="calendar-day">Fri</div>
			<div class="calendar-day">Sat</div>
		</div>
		<div class="grid grid-cols-7 gap-1">
			{#each Array(days) as _, i}
				<div class="calendar-day">{i + 1}</div>
			{/each}
		</div>
	</div>
</div>
