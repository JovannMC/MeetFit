<script lang="ts">
    import { onMount } from 'svelte';
    import { log, LogLevel } from '../routes/log';

    let date = new Date();
    let month = date.getMonth();
    let year = date.getFullYear();
    let days = daysInMonth(month, year);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function daysInMonth(month: number, year: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    onMount(() => {
        log(LogLevel.INFO, `Date: ${date}`);
        log(LogLevel.INFO, `Days in month of ${monthNames[month]}: ${days}`);
    });
</script>

<div class="container">
    
</div>