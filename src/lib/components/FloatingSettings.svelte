<script lang="ts">
	import SettingsIcon from './icons/SettingsIcon.svelte';
	let showSettings = false;

	function toggleSettings() {
		showSettings = !showSettings;
	}
</script>

<div>
	<button class="floating-button {showSettings ? 'rotate' : ''}" on:click={toggleSettings}>
		<SettingsIcon />
	</button>

	{#if showSettings}
		<div class="settings-window">
			<h3 class="text-center text-2xl">Settings</h3>
			<!-- Placeholder settings -->
			<div>
				<label>
					<input type="checkbox" /> Enable meowing
				</label>
			</div>
			<div>
				<label>
					<input type="checkbox" /> Enable barking
				</label>
			</div>
		</div>
	{/if}
</div>

<style>
    .floating-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease;
        @apply bg-primary-900;
    }

    .floating-button.rotate {
        transform: rotate(90deg);
    }

    .settings-window {
        position: fixed;
        bottom: 80px;
        right: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        width: 300px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        @apply border-2 border-primary-500 bg-gray-500;
    }
</style>
