<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
</script>

<AppBar>
	{#snippet lead()}
		<h1 class="text-3xl">MeetFit</h1>
	{/snippet}
	{#snippet trail()}
		<div class="flex items-center gap-8">
			<a href="/" id="home"> Home </a>
			<a href="/about" id="videos"> About </a>
			<a href="https://github.com/JovannMC/MeetFit" target="_blank"> GitHub </a>
		</div>
	{/snippet}
</AppBar>
