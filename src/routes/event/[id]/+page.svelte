<script lang="ts">
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import { days } from '$lib/common';
    import { info } from '../../log';

    let { data } = $props();

    const timezones = Intl.supportedValuesOf('timeZone');
    const filteredTimezones = timezones.filter(
        (timezone) => timezone.includes('/') && !timezone.includes('Etc')
    );
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let timezone = $state(currentTimezone);

    const id = get(page).params.id;

    $effect(() => {
        info(`Event ID: ${id}`);
    });
</script>

<div class="flex flex-col items-center justify-center gap-2">
    <h1 class="text-center text-4xl font-bold">Event: {data.props?.event.name}</h1>
    <div class="flex flex-col items-center gap-2">
        <label class="text-xl" for="timezone">Time zone:</label>
        <select
            name="timezone"
            bind:value={timezone}
            class="w-full rounded border border-gray-300 p-2"
        >
            {#each filteredTimezones as tz}
                <option value={tz}>{tz}</option>
            {/each}
        </select>
    </div>
</div>