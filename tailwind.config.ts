import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

import { contentPath, skeleton } from '@skeletonlabs/skeleton/plugin';
import * as themes from '@skeletonlabs/skeleton/themes';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', contentPath(import.meta.url, 'svelte')],

	theme: {
		extend: {},
		container: {
			center: true,
			padding: '2rem'
		}
	},

	plugins: [
		forms,
		skeleton({
			themes: [themes.catppuccin]
		})
	]
} satisfies Config;
