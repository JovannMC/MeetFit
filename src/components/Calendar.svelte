<script lang="ts">
	import { info } from "../routes/log";

    export let startingDay = 'Monday';

    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

    const daysPrevious = daysInMonth(month - 1, year);
    const daysCurrent = daysInMonth(month, year);
    const daysNext = daysInMonth(month + 1, year);

    const daysPreviousObject = Array.from({ length: daysPrevious }, (_, i) => ({
        day: i + 1,
        name: new Date(year, month - 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' }),
    }));

    const daysCurrentObject = Array.from({ length: daysCurrent }, (_, i) => ({
        day: i + 1,
        name: new Date(year, month, i + 1).toLocaleDateString('en-US', { weekday: 'long' }),
    }));

    const daysNextObject = Array.from({ length: daysNext }, (_, i) => ({
        day: i + 1,
        name: new Date(year, month + 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' }),
    }));

    const weekdayMap = new Map([
        ['Monday', 0],
        ['Tuesday', 1],
        ['Wednesday', 2],
        ['Thursday', 3],
        ['Friday', 4],
        ['Saturday', 5],
        ['Sunday', 6],
    ]);

    let calendar: { previousMonth: any; currentMonth: any; nextMonth: any; };
    
    $: startDayIndex = weekdayMap.get(startingDay) ?? 1;

    // FIXME: monday starts on wrong day (24 nov instead of 25)
    $: weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        .slice(startDayIndex)
        .concat(
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, startDayIndex)
        );
    $: info(weekdays);

    $: {
        const firstDayOfWeek = (new Date(year, month, 1).getDay() - startDayIndex + 7) % 7;
        const lastDayOfWeek = (new Date(year, month, daysCurrent).getDay() - startDayIndex + 7) % 7;

        calendar = {
            previousMonth:
                firstDayOfWeek !== 0
                    ? daysPreviousObject.slice(-firstDayOfWeek).map((day) => ({
                          ...day,
                          month: month - 1,
                          year: month === 0 ? year - 1 : year,
                      }))
                    : [],
            currentMonth: daysCurrentObject.map((day) => ({
                ...day,
                month: month,
                year: year,
            })),
            nextMonth:
                lastDayOfWeek !== 6
                    ? daysNextObject.slice(0, 6 - lastDayOfWeek).map((day) => ({
                          ...day,
                          month: month + 1,
                          year: month === 11 ? year + 1 : year,
                      }))
                    : [],
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
        'December',
    ];
</script>

<div class="flex flex-col p-6 bg-surface-800 items-center justify-center gap-1">
    <div class="flex flex-row gap-3">
        <button>&lt;</button>
        <h1>{monthNames[month]} {year}</h1>
        <button>&gt;</button>
    </div>
    <div class="flex flex-col gap-1 text-center">
        <div class="flex flex-row gap-1">
            {#each weekdays as day, index}
                <div class="w-10 {index >= 5 ? 'bg-primary-800' : 'bg-primary-500'}">
                    {day.slice(0, 3)}
                </div>
            {/each}
        </div>
        <div class="grid grid-cols-7 gap-1">
            {#each calendar.previousMonth as day}
                <div
                    class="h-10 w-10 content-center {day.name === 'Saturday' || day.name === 'Sunday'
                        ? 'bg-secondary-900'
                        : 'bg-secondary-800'}"
                >
                    {day.day}
                </div>
            {/each}
            {#each calendar.currentMonth as day}
                <div
                    class="h-10 w-10 content-center {day.name === 'Saturday' || day.name === 'Sunday'
                        ? 'bg-secondary-700'
                        : 'bg-secondary-600'}"
                >
                    {day.day}
                </div>
            {/each}
            {#each calendar.nextMonth as day}
                <div
                    class="h-10 w-10 content-center {day.name === 'Saturday' || day.name === 'Sunday'
                        ? 'bg-secondary-900'
                        : 'bg-secondary-800'}"
                >
                    {day.day}
                </div>
            {/each}
        </div>
    </div>
</div>
