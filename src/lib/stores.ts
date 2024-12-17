import { writable } from 'svelte/store';

export const startingDayStore = writable('Monday');
export const timeFormatStore = writable(24);
export const themeStore = writable('dark');
export const languageStore = writable('en');
