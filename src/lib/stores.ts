import { writable } from 'svelte/store';

export const startDay = writable('Monday');
export const timeFormat = writable('24h');
export const theme = writable('dark');
export const language = writable('en');
