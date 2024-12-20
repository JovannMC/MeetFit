import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

export const startingDayStore = writable('Monday');
export const timeFormatStore = writable(24);
export const themeStore = writable('dark');
export const languageStore = writable('en');

if (isBrowser) {
    startingDayStore.set(localStorage.getItem('startingDay') || 'Monday');
    timeFormatStore.set(parseInt(localStorage.getItem('timeFormat') || '24'));
    themeStore.set(localStorage.getItem('theme') || 'dark');
    languageStore.set(localStorage.getItem('language') || 'en');

    startingDayStore.subscribe(value => localStorage.setItem('startingDay', value));
    timeFormatStore.subscribe(value => localStorage.setItem('timeFormat', value.toString()));
    themeStore.subscribe(value => localStorage.setItem('theme', value));
    languageStore.subscribe(value => localStorage.setItem('language', value));
}