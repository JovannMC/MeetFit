<script lang="ts">
	import Calendar from '../components/Calendar.svelte';
	import Dropdown from '../components/Dropdown.svelte';

	const timezones = Intl.supportedValuesOf('timeZone');
	const filteredTimezones = timezones.filter(
		(timezone) => timezone.includes('/') && !timezone.includes('Etc')
	);
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
</script>

<form id="create">
	<label for="">Event name:</label>
	<input name="eventName" type="text" />
	<!-- Date range -->

	<!-- Time range -->
	<Dropdown id="startingDay" label="Weekday start:" options={days} selected={days[1]} />

	<Dropdown
		id="timezone"
		label="Time zone:"
		options={filteredTimezones}
		selected={currentTimezone}
	/>
	<Calendar />
</form>
