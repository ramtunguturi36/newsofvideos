/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
			},
		},
	},
	plugins: [],
}
