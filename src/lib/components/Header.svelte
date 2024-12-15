<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
</script>

<AppBar leadBase="flex items-center justify-center gap-8">
	{#snippet lead()}
		<a href="/" class="text-3xl">MeetFit</a>
	{/snippet}
	{#snippet trail()}
		<!-- settings icon -->
		<div class="flex items-center gap-8">
			<a href="/about" id="videos"> About </a>
			<a href="https://github.com/JovannMC/MeetFit" target="_blank" class="hidden sm:block">
				GitHub
			</a>
			<a
				href="/"
				id="create"
				class="rounded bg-primary-500 px-4 py-2 text-white transition duration-300 hover:bg-primary-700"
			>
				Create event
			</a>
		</div>
	{/snippet}
</AppBar>
