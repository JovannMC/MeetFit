import { languageStore, startingDayStore, themeStore, timeFormatStore } from './stores';

if (typeof window !== 'undefined') {
    startingDayStore.set(localStorage.getItem('startingDay') || 'Monday');
    timeFormatStore.set(parseInt(localStorage.getItem('timeFormat') || '24'));
    themeStore.set(localStorage.getItem('theme') || 'dark');
    languageStore.set(localStorage.getItem('language') || 'en');

    startingDayStore.subscribe(value => localStorage.setItem('startingDay', value));
    timeFormatStore.subscribe(value => localStorage.setItem('timeFormat', value.toString()));
    themeStore.subscribe(value => localStorage.setItem('theme', value));
    languageStore.subscribe(value => localStorage.setItem('language', value));
}