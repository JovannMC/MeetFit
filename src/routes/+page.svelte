<script lang="ts">
	import { days } from '$lib/common';
	import Calendar from '$lib/components/Calendar.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { info } from './log';

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	let startingDay = $state('Monday');
	let timezone = $state(currentTimezone);

	function handleSelectedDays(selectedDays: string[]) {
		info(`Selected days: ${selectedDays.join(', ')}`);
	}
</script>

<form id="create">
	<label for="">Event name:</label>
	<input name="eventName" type="text" />
	
	<!-- Time range -->
	<Dropdown
		id="startingDay"
		label="Weekday start:"
		options={days}
		selected={startingDay}
		onChange={(day: string) => {
			startingDay = day;
		}}
	/>

	<Dropdown
		id="timezone"
		label="Time zone:"
		options={filteredTimezones}
		selected={currentTimezone}
		onChange={(tz: string) => {
			tz = timezone;
		}}
	/>

	<!-- Date range -->
	<Calendar {startingDay} selected={(days: string[]) => handleSelectedDays(days)} />
</form>
