<script lang="ts">
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #ffffff;
		color: #1a1a1a;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		overflow-x: hidden;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	:global(::selection) {
		background: rgba(122, 133, 64, 0.15);
		color: #1a1a1a;
	}
</style>
