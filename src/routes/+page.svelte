<script lang="ts">
	import { days } from '$lib/common';
	import Calendar from '$lib/components/Calendar.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	let startingDay = $state('Monday');
	let timezone = $state(currentTimezone);
</script>

<form id="create">
	<label for="">Event name:</label>
	<input name="eventName" type="text" />
	<!-- Date range -->

	<!-- Time range -->
	<Dropdown
		id="startingDay"
		label="Weekday start:"
		options={days}
		selected={days[1]}
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
	<Calendar {startingDay} />
</form>
