<script lang="ts">
	import FloatingSettings from '$lib/components/FloatingSettings.svelte';
	import Header from '$lib/components/Header.svelte';
	import { i18n } from '$lib/i18n';
	import '$lib/initStores';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { ToastProvider } from '@skeletonlabs/skeleton-svelte';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<!-- Favicons
	<link rel="manifest" href="/site.webmanifest" />
	<link rel="icon" type="image/png" sizes="192x192" href="/images/favicons/android-chrome-192x192.png" />
	<link rel="icon" type="image/png" sizes="512x512" href="/images/favicons/android-chrome-512x512.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/images/favicons/favicon-16x16.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/images/favicons/favicon-32x32.png" />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" /> -->

	<!-- SEO -->
	<meta name="description" content="MeetFit" />
	<meta name="keywords" content="MeetFit" />
	<meta name="author" content="JovannMC" />

	<!-- Open Graph Tags -->
	<meta content="MeetFit" property="og:title" />
	<meta content="MeetFit" property="og:description" />
	<meta content="https://jovann.me" property="og:url" />
	<meta content="https://jovann.me/images/jovannmc_white.png" property="og:image" />
	<meta content="#dddddd" data-react-helmet="true" name="theme-color" />
</svelte:head>

<Header />

<ParaglideJS {i18n}>
	<ToastProvider>
		<div class="p-6">
			{@render children()}
		</div>
	</ToastProvider>
</ParaglideJS>

<FloatingSettings />
