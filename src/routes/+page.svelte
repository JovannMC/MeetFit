<script lang="ts">
	import Calendar from "../components/Calendar.svelte";
	import Dropdown from "../components/Dropdown.svelte";
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>


<form id="create">
    <label for="">Event name:</label>
    <input name="eventName" type="text" />
    <!-- Date range -->

    <!-- Time range -->

    <Dropdown id="timezone" label="timezone" options={["test", "test2"]} />
    <Calendar />
</form>
