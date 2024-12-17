<script lang="ts">
	import { days } from '$lib/common';
	import { languageStore, startingDayStore, themeStore, timeFormatStore } from '$lib/stores';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { get } from 'svelte/store';
	import SettingsIcon from './icons/SettingsIcon.svelte';

	let showSettings = $state(false);

	function toggleSettings() {
		showSettings = !showSettings;
	}

	const setTimeFormat = (format: boolean) => {
		timeFormatStore.set(format ? 24 : 12);
	};

	const setTheme = (theme: string) => {
		themeStore.set(theme);
	};

	const setStartingDay = (day: string) => {
		startingDayStore.set(day);
	};

	const setLanguage = (lang: string) => {
		languageStore.set(lang);
	};
</script>

<div>
	<button
		class="fixed bottom-5 right-5 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary-900 text-white shadow-md"
		onclick={toggleSettings}
	>
		<SettingsIcon classes={showSettings ? 'rotate' : ''} />
	</button>

	{#if showSettings}
		<div
			class="fixed bottom-20 right-5 flex w-72 flex-col gap-2 rounded-lg border-2 border-primary-500 bg-gray-500 p-5 shadow-md"
		>
			<h3 class="text-center text-2xl">Settings</h3>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col items-center gap-2">
					<label class="text-lg" for="theme">Theme:</label>
					<select
						name="theme"
						class="w-full rounded-lg border border-gray-300 p-2"
						value={get(themeStore)}
						onchange={(e) => setTheme((e.target as HTMLSelectElement).value)}
					>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
				</div>
				<div class="flex flex-col gap-3">
					<div class="flex items-center">
						<Switch
							name="format"
							onCheckedChange={(details) => setTimeFormat(details.checked)}
							checked={get(timeFormatStore) === 24}
						/>
						<label for="format">12/24 Hour Time</label>
					</div>
					<div class="flex items-center">
						<Switch name="meow" />
						<label for="meow">Enable meowing</label>
					</div>
					<div class="flex items-center">
						<Switch name="bark" />
						<label for="bark">Enable barking</label>
					</div>
				</div>
				<div class="flex flex-col items-center gap-2">
					<label class="text-lg" for="startingDay">Starting day:</label>
					<select
						name="startingDay"
						value={get(startingDayStore)}
						class="w-full rounded-lg border border-gray-300 p-2"
						onchange={(e) => setStartingDay((e.target as HTMLSelectElement).value)}
					>
						{#each days as day}
							<option value={day}>{day}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col items-center gap-2">
					<label class="text-lg" for="startingDay">Language:</label>
					<select
						name="language"
						value={get(languageStore)}
						class="w-full rounded-lg border border-gray-300 p-2"
						onchange={(e) => setLanguage((e.target as HTMLSelectElement).value)}
					>
						<option value="en">English</option>
					</select>
				</div>
			</div>
		</div>
	{/if}
</div>
