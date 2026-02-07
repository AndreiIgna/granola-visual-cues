<script lang="ts">
	import { onMount } from 'svelte';

	let scrollY = $state(0);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		const handleScroll = () => {
			scrollY = window.scrollY;
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<svelte:head>
	<title>Granola — Visual Cues</title>
</svelte:head>

<!-- Nav -->
<div class="nav-wrapper">
	<nav class="nav" class:scrolled={scrollY > 50}>
		<a href="/" class="logo">
			<svg width="111" height="24" viewBox="0 0 148 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#nav-logo)"><path d="M15.0685 31.9176C18.3692 31.9176 21.8285 31.1864 23.2219 30.1724C24.1117 29.5378 24.5532 29.5999 25.3464 28.8411C25.5672 28.6204 25.6637 28.5549 25.7258 28.4928C28.7402 26.0164 30.4854 22.8124 30.4854 18.6564C30.4854 11.8964 25.6948 7.29547 18.8417 7.29547C12.8129 7.29547 8.21198 11.1342 8.21198 16.0524C8.21198 20.5257 11.7023 23.7298 16.6826 23.7298C16.9689 23.7298 17.0965 23.5711 17.4138 23.5711C18.621 23.5711 19.6039 23.2228 20.2385 22.5571C20.5558 22.2088 21.1594 21.5086 21.2215 21.4776C21.5077 21.2224 21.5698 20.843 21.6354 20.6843C21.6974 20.5257 21.825 20.4291 21.8906 20.2084C21.9527 19.9532 21.8595 19.6359 21.8595 19.353C21.8595 18.846 22.0803 18.3391 22.0803 17.8631C22.0803 16.5318 20.4937 15.197 19.0659 15.197C18.9072 15.197 18.9072 15.0694 18.8107 15.0694C18.7141 15.0694 18.621 15.166 18.5244 15.166C18.4278 15.166 18.3037 15.0074 18.176 15.0074C18.0484 15.0074 17.9863 15.135 17.7967 15.135C17.3828 15.135 17.3517 15.197 17.0344 15.197C16.9379 15.197 16.7792 15.2281 16.7171 15.2591C16.5895 15.3212 16.5895 15.4178 16.4619 15.4178C16.2918 15.4178 16.2067 15.45 16.2067 15.5143C16.2067 15.8627 16.2377 15.8006 16.0791 15.8006C15.9089 15.8006 15.8032 15.811 15.7618 15.8317C15.6342 15.8937 15.7307 16.0524 15.6031 16.149C15.4755 16.211 15.4445 16.3076 15.4134 16.4973C15.3824 16.687 15.1927 16.7525 15.1927 16.9422C15.1927 17.0388 15.2237 17.1009 15.2237 17.163C15.2237 17.3526 14.8443 17.2906 14.8443 17.4803C14.8443 17.6079 14.9409 17.701 14.9409 17.8286C14.9409 17.9252 14.8788 17.9873 14.8788 18.0838C14.8788 18.1804 14.9409 18.2425 14.9409 18.3046C14.9409 18.4632 14.7202 18.4943 14.7202 18.6219C14.7202 18.7495 14.8478 18.8426 14.8478 18.9392C14.8478 19.0013 14.7512 19.0357 14.7512 19.1289C14.7512 19.222 14.7202 19.0668 14.9099 19.3496C15.0375 19.5393 15.0375 19.6359 14.9099 19.7945C14.7823 19.9532 14.5305 20.0497 14.2132 20.0497C12.8819 20.0497 12.7232 18.6839 11.9921 18.4632C11.7713 18.4011 11.7368 18.3666 11.7368 18.2735C11.7368 18.1804 11.7368 18.2114 11.8644 18.0838C11.992 17.9562 12.0231 17.8631 12.0231 17.7665C12.0231 17.67 12.0231 17.6389 11.961 17.5768C11.7058 17.163 11.5816 16.656 11.5816 16.0869C11.5816 13.1691 15.1341 10.7237 18.5002 10.7237C19.5142 10.7237 19.3556 10.979 19.9592 10.979C20.1178 10.979 20.0557 10.979 20.2765 10.9479C20.849 10.8513 21.894 11.0755 22.7183 11.486C25.0015 12.6276 26.4949 15.3247 26.4949 18.4667C26.4949 23.8298 21.7354 27.7306 15.3893 27.7306C11.93 27.7306 9.55018 26.6511 7.20144 24.0195C6.94621 23.7332 7.32905 24.0816 6.91517 23.3538C6.40818 22.464 6.47026 23.0365 6.47026 23.0365C6.3116 22.8468 6.02534 22.3054 5.86669 22.1157C5.677 21.8949 5.42177 21.926 5.32865 21.7984C5.20104 21.6397 5.39073 21.3534 5.32865 21.1948C5.26657 20.9396 4.72508 20.5602 4.663 20.3705C4.60092 20.1808 4.37674 18.9737 4.37674 18.7529C4.37674 18.4977 4.56643 18.4667 4.56643 18.308C4.56643 18.0873 4.28016 18.0217 4.12151 17.7044C3.96286 17.3871 3.86629 16.656 3.86629 15.8627C3.86629 15.4488 3.86629 15.2902 3.9939 14.3383C4.02494 14.0209 4.5009 14.0209 4.5009 13.6726C4.5009 13.545 4.43882 13.3863 4.43882 13.2932C4.43882 13.1656 4.43882 13.1346 4.46986 13.038C5.80116 7.45412 11.7679 3.29812 18.4002 3.29812C20.6834 3.29812 22.4286 3.71199 25.1257 4.8536C26.0155 5.23299 27.3158 4.56734 27.3158 3.87064C27.3779 3.64991 27.2537 3.58438 27.2192 3.45677C27.1882 3.32916 27.0606 3.17051 26.933 3.13946C26.8709 3.10842 26.8364 3.01185 26.7743 2.91873C26.6777 2.76008 26.5846 2.698 26.3294 2.63247C26.2018 2.60143 26.1397 2.57039 26.0742 2.50485C25.9776 2.37724 25.9155 2.31516 25.7879 2.24963C25.6603 2.18755 25.5672 2.24963 25.5016 2.21859C25.4396 2.18755 25.4051 2.12202 25.343 2.09098C25.3119 2.05994 25.2464 2.05994 25.1533 2.05994C21.9527 0.345803 19.8591 0.0905796 17.0689 0.0905796C11.0401 0.0905796 5.64595 2.69455 2.31425 7.22994C2.02799 7.60932 2.18664 8.24393 1.77622 8.62677C0.982955 9.35795 0 13.3553 0 15.8937C0 18.0183 0.506998 20.843 1.17265 22.3985C2.47291 25.4439 1.90383 24.1747 2.09352 24.461C2.47291 25.0645 2.79021 25.1266 2.94886 25.3163C2.94886 25.3163 3.04544 25.506 3.04544 25.6957C3.04544 25.8233 3.04544 25.8543 3.07648 25.9164C3.17305 26.1061 3.61451 26.4234 3.74213 26.551C4.02839 26.8373 4.24912 27.4409 4.72508 27.9168C5.45626 28.648 6.5013 29.2171 9.833 30.7726C11.0056 31.3106 10.34 31.0278 10.4676 31.0588C10.7539 31.1554 11.1333 31.1554 11.3574 31.3141C11.4851 31.4106 11.3264 31.3761 11.6747 31.3761C11.7368 31.3761 11.7368 31.4072 11.8024 31.4382C11.8644 31.4693 11.93 31.5658 12.0231 31.5658C12.0852 31.5658 12.1197 31.5037 12.2128 31.5348C12.3059 31.5658 12.5301 31.7245 12.7198 31.8211C12.8784 31.9176 12.9095 31.9176 12.975 31.8521C13.1647 31.7245 13.2923 31.8831 13.482 31.8831C13.5441 31.8831 13.6407 31.8521 13.8303 31.8521C14.0856 31.8521 14.0856 31.9142 15.0685 31.9142" fill="#292929"/><path d="M138.987 22.0217C137.4 22.0217 136.162 21.2582 136.162 19.859C136.162 18.7155 136.893 17.9209 138.763 17.3785C139.587 17.1228 141.302 16.7428 142.223 16.5528C142.602 16.456 142.826 16.615 142.826 16.9328V18.8088C142.826 21.0958 140.953 22.0183 138.987 22.0183M137.939 25.9636C139.684 25.9636 141.367 25.4558 142.254 24.789C142.474 24.6301 142.571 24.599 142.699 24.599C142.888 24.599 143.016 24.6957 143.143 25.0136C143.302 25.3625 143.399 25.4903 143.778 25.4903H147.365C147.745 25.4903 148 25.2347 148 24.8547C148 24.409 147.81 23.4866 147.81 22.0908V13.0634C147.81 8.19905 144.892 6.16763 140.036 6.16763C135.783 6.16763 131.975 8.2336 131.595 11.6331C131.564 11.9821 131.816 12.2066 132.168 12.2066H136.104C136.642 12.2066 136.835 12.0477 137.025 11.5709C137.404 10.6174 138.325 10.1717 139.912 10.1717C141.912 10.1717 142.768 11.0631 142.768 11.9821C142.768 12.6177 142.45 13.0323 141.56 13.3156C140.705 13.6024 139.529 13.7924 138.132 14.0135C134.196 14.5524 131.023 16.1106 131.023 19.9903C131.023 23.3898 133.817 25.9671 137.942 25.9671M128.991 25.4869H125.28C124.9 25.4869 124.645 25.2312 124.645 24.8512V0.695223C124.645 0.315195 124.9 0.0595398 125.28 0.0595398H128.991C129.371 0.0595398 129.626 0.315195 129.626 0.695223V24.8512C129.626 25.2312 129.371 25.4869 128.991 25.4869ZM113.504 21.8939C110.838 21.8939 108.965 19.6379 108.965 16.1105C108.965 12.5832 110.838 10.3583 113.504 10.3583C116.17 10.3583 118.043 12.6143 118.043 16.1105C118.043 19.6068 116.17 21.8939 113.504 21.8939ZM113.504 26.0915C119.564 26.0915 123.245 21.545 123.245 16.2384C123.245 10.9318 119.564 6.16418 113.504 6.16418C107.444 6.16418 103.764 10.994 103.764 16.2384C103.764 21.4828 107.444 26.0915 113.504 26.0915ZM86.5001 25.4869H90.2114C90.5909 25.4869 90.8461 25.2312 90.8461 24.8512V14.4902C90.8461 12.0753 92.1775 10.5483 94.3367 10.5483C96.2718 10.5483 97.3824 11.6608 97.3824 13.6646V24.8512C97.3824 25.2312 97.6377 25.4869 98.0171 25.4869H101.728C102.108 25.4869 102.363 25.2312 102.363 24.8512V14.1068C102.363 8.76564 100.269 6.16072 95.9199 6.16072C93.9194 6.16072 92.4293 6.8275 91.5394 7.43209C91.2531 7.6221 91.16 7.68774 91.0324 7.68774C90.8116 7.68774 90.715 7.55992 90.5564 7.24207C90.3977 6.89314 90.2701 6.76531 89.8596 6.76531H86.4966C86.1172 6.76531 85.862 7.02097 85.862 7.40099V24.8512C85.862 25.2312 86.1172 25.4869 86.4966 25.4869M75.3314 22.0217C73.7448 22.0217 72.5065 21.2582 72.5065 19.859C72.5065 18.7155 73.2377 17.9209 75.1072 17.3785C75.9316 17.1228 77.6459 16.7428 78.5668 16.5528C78.9462 16.456 79.1704 16.615 79.1704 16.9328V18.8088C79.1704 21.0958 77.2975 22.0183 75.3314 22.0183M74.2829 25.9636C76.0282 25.9636 77.7114 25.4558 78.5979 24.789C78.8186 24.6301 78.9152 24.599 79.0428 24.599C79.2325 24.599 79.3601 24.6957 79.4878 25.0136C79.6464 25.3625 79.743 25.4903 80.1224 25.4903H83.7096C84.089 25.4903 84.3443 25.2347 84.3443 24.8547C84.3443 24.409 84.1546 23.4866 84.1546 22.0908V13.0634C84.1546 8.19905 81.2365 6.16763 76.38 6.16763C72.1271 6.16763 68.3191 8.2336 67.9397 11.6331C67.9087 11.9821 68.1605 12.2066 68.5123 12.2066H72.4479C72.986 12.2066 73.1791 12.0477 73.3688 11.5709C73.7482 10.6174 74.6692 10.1717 76.2558 10.1717C78.2564 10.1717 79.1118 11.0631 79.1118 11.9821C79.1118 12.6177 78.7945 13.0323 77.9046 13.3156C77.0492 13.6024 75.873 13.7924 74.476 14.0135C70.5404 14.5524 67.3671 16.1106 67.3671 19.9903C67.3671 23.3898 70.161 25.9671 74.2863 25.9671M61.7173 7.43209C61.4 7.6532 61.3034 7.71884 61.1447 7.71884C60.924 7.71884 60.7963 7.59101 60.6377 7.24207C60.479 6.89314 60.3514 6.76531 59.9409 6.76531H56.5779C56.1985 6.76531 55.9433 7.02097 55.9433 7.40099V24.8512C55.9433 25.2312 56.1985 25.4869 56.5779 25.4869H60.2893C60.6687 25.4869 60.924 25.2312 60.924 24.8512V15.0603C60.924 12.6454 61.9725 11.3084 64.3525 11.3084H66.4772C66.8256 11.3084 67.0498 11.0873 67.0498 10.7349V7.0486C67.0498 6.57184 66.7946 6.38183 65.5597 6.38183C64.2283 6.38183 62.6417 6.7964 61.7207 7.43209M44.9954 20.6571C42.4567 20.6571 40.6804 18.6222 40.6804 15.4127C40.6804 12.2032 42.4567 10.1994 44.9954 10.1994C47.534 10.1994 49.3104 12.2343 49.3104 15.4127C49.3104 18.5911 47.503 20.6571 44.9954 20.6571ZM44.8367 31.9405C51.1833 31.9405 54.2945 28.5064 54.2945 22.343V7.40099C54.2945 7.02097 54.0393 6.76531 53.6599 6.76531H50.1692C49.7553 6.76531 49.6311 6.89314 49.4725 7.24207C49.3138 7.55992 49.2172 7.68774 48.9965 7.68774C48.8689 7.68774 48.7757 7.62556 48.4239 7.43209C46.8373 6.5753 45.4403 6.28855 43.9192 6.28855C38.5246 6.28855 35.4789 10.4205 35.4789 15.5371C35.4789 20.6536 38.5246 24.7856 43.9192 24.7856C45.7266 24.7856 47.5995 24.022 48.4239 23.3864C48.6136 23.2585 48.7102 23.2274 48.8033 23.2274C48.993 23.2274 49.1207 23.3553 49.1207 23.642C49.1207 26.4404 47.5961 28.1229 44.8988 28.1229C43.2156 28.1229 42.3291 27.5494 41.8531 26.8204C41.5979 26.4404 41.4737 26.2815 40.9632 26.2815H37.2829C36.9345 26.2815 36.7103 26.5026 36.7103 26.855C36.7103 29.0177 39.1524 31.9405 44.8333 31.9405" fill="#292929"/></g><defs><clipPath id="nav-logo"><rect width="148" height="32" fill="white"/></clipPath></defs></svg>
		</a>
		<div class="nav-links">
			<a href="#features">Features</a>
			<a href="#how-it-works">How it works</a>
			<a href="#use-cases">Use cases</a>
		</div>
		<a href="/meeting-demo" class="nav-download">
			Try now
		</a>
	</nav>
</div>

<!-- Hero -->
<section class="hero" class:visible={mounted}>
	<div class="container">
		<a href="#features" class="badge">
			Visual Cues is here &rarr;
		</a>

		<h1>
			Your meeting notes<br />learned to <span class="italic-accent">see.</span>
		</h1>

		<p class="hero-sub">
			Granola now analyzes the visual recording of your meetings and weaves<br class="hide-mobile" />
			what was shown into your notes and AI chat
		</p>

		<div class="hero-actions">
			<a href="/meeting-demo" class="btn btn-primary">Try now</a>
		</div>
	</div>
</section>

<!-- Visual demo -->
<section class="demo">
	<div class="container">
		<div class="demo-cards">
			<div class="demo-card">
				<div class="demo-card-header">Your notes + transcript</div>
				<div class="demo-lines">
					<div class="demo-line" style="width: 100%"></div>
					<div class="demo-line" style="width: 68%"></div>
					<div class="demo-line" style="width: 85%"></div>
					<div class="demo-line" style="width: 55%"></div>
					<div class="demo-line" style="width: 92%"></div>
					<div class="demo-line" style="width: 40%"></div>
				</div>
			</div>
			<div class="demo-card demo-card-enhanced">
				<div class="demo-card-header">
					<span class="sparkle">&#10024;</span>
					Visual Cues enhanced
				</div>
				<div class="demo-window">
					<div class="demo-window-dots">
						<span class="dot dot-red"></span>
						<span class="dot dot-yellow"></span>
						<span class="dot dot-green"></span>
					</div>
					<div class="demo-insights">
						<div class="demo-insight">
							<span class="demo-insight-tag tag-chart">Chart</span>
							<p>Q3 revenue chart — 23% YoY growth highlighted</p>
						</div>
						<div class="demo-insight">
							<span class="demo-insight-tag tag-design">Design</span>
							<p>Homepage mockup v3 — team liked new layout</p>
						</div>
						<div class="demo-insight">
							<span class="demo-insight-tag tag-reaction">Reaction</span>
							<p>Sarah skeptical during pricing, nodded at revision</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section id="features" class="features">
	<div class="container">
		<div class="section-header">
			<h2>Everything your eyes catch,<br /><span class="italic-accent">now your notes do too.</span></h2>
			<p class="section-sub">Visual Cues extends Granola beyond the transcript. It watches what's happening on screen and on camera so your notes capture the full picture.</p>
		</div>

		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="3" width="20" height="14" rx="2" />
						<path d="M8 21h8" />
						<path d="M12 17v4" />
					</svg>
				</div>
				<h3>Screen content analysis</h3>
				<p>Identifies and summarizes slides, documents, spreadsheets, and anything shared on screen during the meeting.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 3v18h18" />
						<path d="M7 16l4-8 4 4 4-10" />
					</svg>
				</div>
				<h3>Charts &amp; data capture</h3>
				<p>Reads charts, graphs, and dashboards. Key metrics and trends are extracted and included in your summary.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 19l7-7 3 3-7 7-3-3z" />
						<path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
						<path d="M2 2l7.586 7.586" />
						<circle cx="11" cy="11" r="2" />
					</svg>
				</div>
				<h3>Design &amp; mockup review</h3>
				<p>Captures shared mockups and prototypes, tying feedback directly to what was shown on screen.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="8" r="5" />
						<path d="M20 21a8 8 0 00-16 0" />
					</svg>
				</div>
				<h3>Body language &amp; reactions</h3>
				<p>Picks up on nods, frowns, enthusiasm, and hesitation. Know how people truly felt — not just what they said.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
						<path d="M19 10v2a7 7 0 01-14 0v-2" />
						<line x1="12" y1="19" x2="12" y2="22" />
					</svg>
				</div>
				<h3>Tone &amp; sentiment</h3>
				<p>Combines vocal tone with facial expressions for a richer understanding of engagement across topics.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
					</svg>
				</div>
				<h3>Visual-aware AI chat</h3>
				<p>Ask Granola about anything visual. "What chart did they show?" or "How did the team react?"</p>
			</div>
		</div>
	</div>
</section>

<!-- How it works -->
<section id="how-it-works" class="how-it-works">
	<div class="container">
		<div class="section-header">
			<h2>Same Granola workflow.<br /><span class="italic-accent">Dramatically richer output.</span></h2>
			<p class="section-sub">Visual Cues runs in the background — no extra setup, no extra steps.</p>
		</div>

		<div class="steps-grid">
			<div class="step-card">
				<div class="step-number">1</div>
				<h3>Join your meeting as usual</h3>
				<p>Granola sits in the background of your Zoom, Google Meet, or Teams call. Visual Cues activates automatically.</p>
			</div>

			<div class="step-card">
				<div class="step-number">2</div>
				<h3>AI watches alongside you</h3>
				<p>While you focus, Granola analyzes what's on screen and on camera — slides, demos, reactions — in real time.</p>
			</div>

			<div class="step-card">
				<div class="step-number">3</div>
				<h3>Get enriched notes</h3>
				<p>Your summary includes visual context woven in naturally. The AI chat becomes visual-aware too.</p>
			</div>
		</div>
	</div>
</section>

<!-- Use cases -->
<section id="use-cases" class="use-cases">
	<div class="container">
		<div class="section-header">
			<h2>For every meeting where<br /><span class="italic-accent">visuals matter.</span></h2>
		</div>

		<div class="cases-grid">
			<div class="case-card">
				<div class="case-content">
					<h3>Quarterly reviews</h3>
					<p>Every data point and chart presented is captured and linked to the discussion around it.</p>
				</div>
			</div>
			<div class="case-card">
				<div class="case-content">
					<h3>Design critiques</h3>
					<p>Each mockup is captured alongside feedback. "The version Sarah liked" — Granola knows which one.</p>
				</div>
			</div>
			<div class="case-card">
				<div class="case-content">
					<h3>Client presentations</h3>
					<p>Know exactly how your client reacted to each part of the pitch. Spot what you missed live.</p>
				</div>
			</div>
			<div class="case-card">
				<div class="case-content">
					<h3>Sprint planning</h3>
					<p>Architecture diagrams and tech specs shared on screen become part of your notes automatically.</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section id="cta" class="cta">
	<div class="container">
		<div class="cta-inner">
			<h2>See your meetings<br /><span class="italic-accent">in a new light.</span></h2>
			<p class="cta-sub">Visual Cues is rolling out soon. Be among the first to try it.</p>
			<form class="cta-form" onsubmit={(e) => e.preventDefault()}>
				<input type="email" placeholder="you@company.com" class="cta-input" />
				<button type="submit" class="btn btn-primary">Join waitlist</button>
			</form>
			<span class="cta-note">Free during early access &middot; Works with your existing Granola plan</span>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="footer">
	<div class="container footer-inner">
		<div class="footer-left">
			<a href="/" class="footer-logo">
				<svg width="93" height="20" viewBox="0 0 148 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#footer-logo)"><path d="M15.0685 31.9176C18.3692 31.9176 21.8285 31.1864 23.2219 30.1724C24.1117 29.5378 24.5532 29.5999 25.3464 28.8411C25.5672 28.6204 25.6637 28.5549 25.7258 28.4928C28.7402 26.0164 30.4854 22.8124 30.4854 18.6564C30.4854 11.8964 25.6948 7.29547 18.8417 7.29547C12.8129 7.29547 8.21198 11.1342 8.21198 16.0524C8.21198 20.5257 11.7023 23.7298 16.6826 23.7298C16.9689 23.7298 17.0965 23.5711 17.4138 23.5711C18.621 23.5711 19.6039 23.2228 20.2385 22.5571C20.5558 22.2088 21.1594 21.5086 21.2215 21.4776C21.5077 21.2224 21.5698 20.843 21.6354 20.6843C21.6974 20.5257 21.825 20.4291 21.8906 20.2084C21.9527 19.9532 21.8595 19.6359 21.8595 19.353C21.8595 18.846 22.0803 18.3391 22.0803 17.8631C22.0803 16.5318 20.4937 15.197 19.0659 15.197C18.9072 15.197 18.9072 15.0694 18.8107 15.0694C18.7141 15.0694 18.621 15.166 18.5244 15.166C18.4278 15.166 18.3037 15.0074 18.176 15.0074C18.0484 15.0074 17.9863 15.135 17.7967 15.135C17.3828 15.135 17.3517 15.197 17.0344 15.197C16.9379 15.197 16.7792 15.2281 16.7171 15.2591C16.5895 15.3212 16.5895 15.4178 16.4619 15.4178C16.2918 15.4178 16.2067 15.45 16.2067 15.5143C16.2067 15.8627 16.2377 15.8006 16.0791 15.8006C15.9089 15.8006 15.8032 15.811 15.7618 15.8317C15.6342 15.8937 15.7307 16.0524 15.6031 16.149C15.4755 16.211 15.4445 16.3076 15.4134 16.4973C15.3824 16.687 15.1927 16.7525 15.1927 16.9422C15.1927 17.0388 15.2237 17.1009 15.2237 17.163C15.2237 17.3526 14.8443 17.2906 14.8443 17.4803C14.8443 17.6079 14.9409 17.701 14.9409 17.8286C14.9409 17.9252 14.8788 17.9873 14.8788 18.0838C14.8788 18.1804 14.9409 18.2425 14.9409 18.3046C14.9409 18.4632 14.7202 18.4943 14.7202 18.6219C14.7202 18.7495 14.8478 18.8426 14.8478 18.9392C14.8478 19.0013 14.7512 19.0357 14.7512 19.1289C14.7512 19.222 14.7202 19.0668 14.9099 19.3496C15.0375 19.5393 15.0375 19.6359 14.9099 19.7945C14.7823 19.9532 14.5305 20.0497 14.2132 20.0497C12.8819 20.0497 12.7232 18.6839 11.9921 18.4632C11.7713 18.4011 11.7368 18.3666 11.7368 18.2735C11.7368 18.1804 11.7368 18.2114 11.8644 18.0838C11.992 17.9562 12.0231 17.8631 12.0231 17.7665C12.0231 17.67 12.0231 17.6389 11.961 17.5768C11.7058 17.163 11.5816 16.656 11.5816 16.0869C11.5816 13.1691 15.1341 10.7237 18.5002 10.7237C19.5142 10.7237 19.3556 10.979 19.9592 10.979C20.1178 10.979 20.0557 10.979 20.2765 10.9479C20.849 10.8513 21.894 11.0755 22.7183 11.486C25.0015 12.6276 26.4949 15.3247 26.4949 18.4667C26.4949 23.8298 21.7354 27.7306 15.3893 27.7306C11.93 27.7306 9.55018 26.6511 7.20144 24.0195C6.94621 23.7332 7.32905 24.0816 6.91517 23.3538C6.40818 22.464 6.47026 23.0365 6.47026 23.0365C6.3116 22.8468 6.02534 22.3054 5.86669 22.1157C5.677 21.8949 5.42177 21.926 5.32865 21.7984C5.20104 21.6397 5.39073 21.3534 5.32865 21.1948C5.26657 20.9396 4.72508 20.5602 4.663 20.3705C4.60092 20.1808 4.37674 18.9737 4.37674 18.7529C4.37674 18.4977 4.56643 18.4667 4.56643 18.308C4.56643 18.0873 4.28016 18.0217 4.12151 17.7044C3.96286 17.3871 3.86629 16.656 3.86629 15.8627C3.86629 15.4488 3.86629 15.2902 3.9939 14.3383C4.02494 14.0209 4.5009 14.0209 4.5009 13.6726C4.5009 13.545 4.43882 13.3863 4.43882 13.2932C4.43882 13.1656 4.43882 13.1346 4.46986 13.038C5.80116 7.45412 11.7679 3.29812 18.4002 3.29812C20.6834 3.29812 22.4286 3.71199 25.1257 4.8536C26.0155 5.23299 27.3158 4.56734 27.3158 3.87064C27.3779 3.64991 27.2537 3.58438 27.2192 3.45677C27.1882 3.32916 27.0606 3.17051 26.933 3.13946C26.8709 3.10842 26.8364 3.01185 26.7743 2.91873C26.6777 2.76008 26.5846 2.698 26.3294 2.63247C26.2018 2.60143 26.1397 2.57039 26.0742 2.50485C25.9776 2.37724 25.9155 2.31516 25.7879 2.24963C25.6603 2.18755 25.5672 2.24963 25.5016 2.21859C25.4396 2.18755 25.4051 2.12202 25.343 2.09098C25.3119 2.05994 25.2464 2.05994 25.1533 2.05994C21.9527 0.345803 19.8591 0.0905796 17.0689 0.0905796C11.0401 0.0905796 5.64595 2.69455 2.31425 7.22994C2.02799 7.60932 2.18664 8.24393 1.77622 8.62677C0.982955 9.35795 0 13.3553 0 15.8937C0 18.0183 0.506998 20.843 1.17265 22.3985C2.47291 25.4439 1.90383 24.1747 2.09352 24.461C2.47291 25.0645 2.79021 25.1266 2.94886 25.3163C2.94886 25.3163 3.04544 25.506 3.04544 25.6957C3.04544 25.8233 3.04544 25.8543 3.07648 25.9164C3.17305 26.1061 3.61451 26.4234 3.74213 26.551C4.02839 26.8373 4.24912 27.4409 4.72508 27.9168C5.45626 28.648 6.5013 29.2171 9.833 30.7726C11.0056 31.3106 10.34 31.0278 10.4676 31.0588C10.7539 31.1554 11.1333 31.1554 11.3574 31.3141C11.4851 31.4106 11.3264 31.3761 11.6747 31.3761C11.7368 31.3761 11.7368 31.4072 11.8024 31.4382C11.8644 31.4693 11.93 31.5658 12.0231 31.5658C12.0852 31.5658 12.1197 31.5037 12.2128 31.5348C12.3059 31.5658 12.5301 31.7245 12.7198 31.8211C12.8784 31.9176 12.9095 31.9176 12.975 31.8521C13.1647 31.7245 13.2923 31.8831 13.482 31.8831C13.5441 31.8831 13.6407 31.8521 13.8303 31.8521C14.0856 31.8521 14.0856 31.9142 15.0685 31.9142" fill="#292929"/><path d="M138.987 22.0217C137.4 22.0217 136.162 21.2582 136.162 19.859C136.162 18.7155 136.893 17.9209 138.763 17.3785C139.587 17.1228 141.302 16.7428 142.223 16.5528C142.602 16.456 142.826 16.615 142.826 16.9328V18.8088C142.826 21.0958 140.953 22.0183 138.987 22.0183M137.939 25.9636C139.684 25.9636 141.367 25.4558 142.254 24.789C142.474 24.6301 142.571 24.599 142.699 24.599C142.888 24.599 143.016 24.6957 143.143 25.0136C143.302 25.3625 143.399 25.4903 143.778 25.4903H147.365C147.745 25.4903 148 25.2347 148 24.8547C148 24.409 147.81 23.4866 147.81 22.0908V13.0634C147.81 8.19905 144.892 6.16763 140.036 6.16763C135.783 6.16763 131.975 8.2336 131.595 11.6331C131.564 11.9821 131.816 12.2066 132.168 12.2066H136.104C136.642 12.2066 136.835 12.0477 137.025 11.5709C137.404 10.6174 138.325 10.1717 139.912 10.1717C141.912 10.1717 142.768 11.0631 142.768 11.9821C142.768 12.6177 142.45 13.0323 141.56 13.3156C140.705 13.6024 139.529 13.7924 138.132 14.0135C134.196 14.5524 131.023 16.1106 131.023 19.9903C131.023 23.3898 133.817 25.9671 137.942 25.9671M128.991 25.4869H125.28C124.9 25.4869 124.645 25.2312 124.645 24.8512V0.695223C124.645 0.315195 124.9 0.0595398 125.28 0.0595398H128.991C129.371 0.0595398 129.626 0.315195 129.626 0.695223V24.8512C129.626 25.2312 129.371 25.4869 128.991 25.4869ZM113.504 21.8939C110.838 21.8939 108.965 19.6379 108.965 16.1105C108.965 12.5832 110.838 10.3583 113.504 10.3583C116.17 10.3583 118.043 12.6143 118.043 16.1105C118.043 19.6068 116.17 21.8939 113.504 21.8939ZM113.504 26.0915C119.564 26.0915 123.245 21.545 123.245 16.2384C123.245 10.9318 119.564 6.16418 113.504 6.16418C107.444 6.16418 103.764 10.994 103.764 16.2384C103.764 21.4828 107.444 26.0915 113.504 26.0915ZM86.5001 25.4869H90.2114C90.5909 25.4869 90.8461 25.2312 90.8461 24.8512V14.4902C90.8461 12.0753 92.1775 10.5483 94.3367 10.5483C96.2718 10.5483 97.3824 11.6608 97.3824 13.6646V24.8512C97.3824 25.2312 97.6377 25.4869 98.0171 25.4869H101.728C102.108 25.4869 102.363 25.2312 102.363 24.8512V14.1068C102.363 8.76564 100.269 6.16072 95.9199 6.16072C93.9194 6.16072 92.4293 6.8275 91.5394 7.43209C91.2531 7.6221 91.16 7.68774 91.0324 7.68774C90.8116 7.68774 90.715 7.55992 90.5564 7.24207C90.3977 6.89314 90.2701 6.76531 89.8596 6.76531H86.4966C86.1172 6.76531 85.862 7.02097 85.862 7.40099V24.8512C85.862 25.2312 86.1172 25.4869 86.4966 25.4869M75.3314 22.0217C73.7448 22.0217 72.5065 21.2582 72.5065 19.859C72.5065 18.7155 73.2377 17.9209 75.1072 17.3785C75.9316 17.1228 77.6459 16.7428 78.5668 16.5528C78.9462 16.456 79.1704 16.615 79.1704 16.9328V18.8088C79.1704 21.0958 77.2975 22.0183 75.3314 22.0183M74.2829 25.9636C76.0282 25.9636 77.7114 25.4558 78.5979 24.789C78.8186 24.6301 78.9152 24.599 79.0428 24.599C79.2325 24.599 79.3601 24.6957 79.4878 25.0136C79.6464 25.3625 79.743 25.4903 80.1224 25.4903H83.7096C84.089 25.4903 84.3443 25.2347 84.3443 24.8547C84.3443 24.409 84.1546 23.4866 84.1546 22.0908V13.0634C84.1546 8.19905 81.2365 6.16763 76.38 6.16763C72.1271 6.16763 68.3191 8.2336 67.9397 11.6331C67.9087 11.9821 68.1605 12.2066 68.5123 12.2066H72.4479C72.986 12.2066 73.1791 12.0477 73.3688 11.5709C73.7482 10.6174 74.6692 10.1717 76.2558 10.1717C78.2564 10.1717 79.1118 11.0631 79.1118 11.9821C79.1118 12.6177 78.7945 13.0323 77.9046 13.3156C77.0492 13.6024 75.873 13.7924 74.476 14.0135C70.5404 14.5524 67.3671 16.1106 67.3671 19.9903C67.3671 23.3898 70.161 25.9671 74.2863 25.9671M61.7173 7.43209C61.4 7.6532 61.3034 7.71884 61.1447 7.71884C60.924 7.71884 60.7963 7.59101 60.6377 7.24207C60.479 6.89314 60.3514 6.76531 59.9409 6.76531H56.5779C56.1985 6.76531 55.9433 7.02097 55.9433 7.40099V24.8512C55.9433 25.2312 56.1985 25.4869 56.5779 25.4869H60.2893C60.6687 25.4869 60.924 25.2312 60.924 24.8512V15.0603C60.924 12.6454 61.9725 11.3084 64.3525 11.3084H66.4772C66.8256 11.3084 67.0498 11.0873 67.0498 10.7349V7.0486C67.0498 6.57184 66.7946 6.38183 65.5597 6.38183C64.2283 6.38183 62.6417 6.7964 61.7207 7.43209M44.9954 20.6571C42.4567 20.6571 40.6804 18.6222 40.6804 15.4127C40.6804 12.2032 42.4567 10.1994 44.9954 10.1994C47.534 10.1994 49.3104 12.2343 49.3104 15.4127C49.3104 18.5911 47.503 20.6571 44.9954 20.6571ZM44.8367 31.9405C51.1833 31.9405 54.2945 28.5064 54.2945 22.343V7.40099C54.2945 7.02097 54.0393 6.76531 53.6599 6.76531H50.1692C49.7553 6.76531 49.6311 6.89314 49.4725 7.24207C49.3138 7.55992 49.2172 7.68774 48.9965 7.68774C48.8689 7.68774 48.7757 7.62556 48.4239 7.43209C46.8373 6.5753 45.4403 6.28855 43.9192 6.28855C38.5246 6.28855 35.4789 10.4205 35.4789 15.5371C35.4789 20.6536 38.5246 24.7856 43.9192 24.7856C45.7266 24.7856 47.5995 24.022 48.4239 23.3864C48.6136 23.2585 48.7102 23.2274 48.8033 23.2274C48.993 23.2274 49.1207 23.3553 49.1207 23.642C49.1207 26.4404 47.5961 28.1229 44.8988 28.1229C43.2156 28.1229 42.3291 27.5494 41.8531 26.8204C41.5979 26.4404 41.4737 26.2815 40.9632 26.2815H37.2829C36.9345 26.2815 36.7103 26.5026 36.7103 26.855C36.7103 29.0177 39.1524 31.9405 44.8333 31.9405" fill="#292929"/></g><defs><clipPath id="footer-logo"><rect width="148" height="32" fill="white"/></clipPath></defs></svg>
			</a>
		</div>
		<span class="footer-copy">&copy; {new Date().getFullYear()} Granola. All rights reserved.</span>
	</div>
</footer>

<style>
	/* ---- Tokens ---- */
	:root {
		--olive: #7a8540;
		--olive-dark: #6b7535;
		--olive-light: #e9e8d8;
		--olive-50: #f4f3ec;
		--text-primary: #1a1a1a;
		--text-secondary: #9ca3af;
		--text-tertiary: #c0c0c0;
		--border: #e8e8e8;
		--border-light: #f0f0f0;
		--bg: #ffffff;
		--bg-subtle: #fafaf8;
		--font-serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
		--font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	/* ---- Layout ---- */
	.container {
		max-width: 1120px;
		margin: 0 auto;
		padding: 0 24px;
	}

	/* ---- Nav ---- */
	.nav-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		display: flex;
		justify-content: center;
		padding: 20px 24px;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 12px 12px 20px;
		border-radius: 100px;
		border: 1px solid var(--border);
		background: var(--bg);
		transition: box-shadow 0.3s ease;
	}

	.nav.scrolled {
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
	}

	.logo {
		display: flex;
		align-items: center;
		margin-right: 20px;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 28px;
		font-size: 15px;
		color: var(--text-secondary);
		margin-right: 20px;
	}

	.nav-links a {
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: var(--text-primary);
	}

	.nav-download {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 22px;
		border-radius: 100px;
		border: 1px solid var(--border);
		font-size: 14px;
		font-weight: 500;
		color: var(--text-primary);
		transition: all 0.2s;
	}

	.nav-download:hover {
		border-color: var(--text-secondary);
	}

	/* ---- Hero ---- */
	.hero {
		padding: 180px 24px 80px;
		text-align: center;
		opacity: 0;
		transition: opacity 0.6s ease;
	}

	.hero.visible {
		opacity: 1;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 22px;
		border-radius: 100px;
		background: var(--olive-light);
		font-size: 15px;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 48px;
		transition: background 0.2s;
	}

	.badge:hover {
		background: #e0dfcc;
	}

	h1 {
		font-family: var(--font-serif);
		font-size: clamp(48px, 7vw, 84px);
		font-weight: 400;
		letter-spacing: -0.03em;
		line-height: 1.05;
		margin-bottom: 32px;
		color: var(--text-primary);
	}

	.italic-accent {
		font-family: var(--font-serif);
		font-style: italic;
	}

	.hero-sub {
		font-size: 20px;
		line-height: 1.6;
		color: var(--text-secondary);
		max-width: 640px;
		margin: 0 auto 48px;
	}

	.hide-mobile {
		display: inline;
	}

	.hero-actions {
		display: flex;
		justify-content: center;
	}

	/* ---- Buttons ---- */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 18px 36px;
		border-radius: 100px;
		font-size: 18px;
		font-weight: 500;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn-primary {
		background: var(--olive);
		color: #fff;
	}

	.btn-primary:hover {
		background: var(--olive-dark);
	}

	/* ---- Demo ---- */
	.demo {
		padding: 40px 24px 120px;
	}

	.demo-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		max-width: 880px;
		margin: 0 auto;
	}

	.demo-card {
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
		background: var(--bg);
	}

	.demo-card-enhanced {
		background: var(--bg);
	}

	.demo-card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 24px;
	}

	.sparkle {
		font-size: 18px;
	}

	.demo-lines {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.demo-line {
		height: 10px;
		background: var(--border-light);
		border-radius: 5px;
	}

	.demo-window {
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
		background: var(--bg);
	}

	.demo-window-dots {
		display: flex;
		gap: 6px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--border-light);
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.dot-red { background: #f87171; }
	.dot-yellow { background: #fbbf24; }
	.dot-green { background: #4ade80; }

	.demo-insights {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.demo-insight {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px;
		border-bottom: 1px solid var(--border-light);
	}

	.demo-insight:last-child {
		border-bottom: none;
	}

	.demo-insight-tag {
		flex-shrink: 0;
		font-size: 11px;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-top: 1px;
	}

	.tag-chart {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.tag-design {
		background: #fce7f3;
		color: #be185d;
	}

	.tag-reaction {
		background: #fef3c7;
		color: #92400e;
	}

	.demo-insight p {
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-primary);
	}

	/* ---- Section shared ---- */
	.section-header {
		text-align: center;
		margin-bottom: 64px;
	}

	.section-header h2 {
		font-family: var(--font-serif);
		font-size: clamp(36px, 4.5vw, 56px);
		font-weight: 400;
		letter-spacing: -0.025em;
		line-height: 1.1;
		color: var(--text-primary);
		margin-bottom: 24px;
	}

	.section-sub {
		font-size: 19px;
		line-height: 1.6;
		color: var(--text-secondary);
		max-width: 580px;
		margin: 0 auto;
	}

	/* ---- Features ---- */
	.features {
		padding: 120px 24px;
		border-top: 1px solid var(--border-light);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	.feature-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 32px;
		transition: border-color 0.2s;
	}

	.feature-card:hover {
		border-color: #c0c0c0;
	}

	.feature-icon {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--olive-50);
		border-radius: 12px;
		margin-bottom: 20px;
		color: var(--olive);
	}

	.feature-card h3 {
		font-family: var(--font-sans);
		font-size: 17px;
		font-weight: 600;
		margin-bottom: 10px;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	.feature-card p {
		font-size: 15px;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	/* ---- How it works ---- */
	.how-it-works {
		padding: 120px 24px;
		background: var(--bg-subtle);
		border-top: 1px solid var(--border-light);
	}

	.steps-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		max-width: 1000px;
		margin: 0 auto;
	}

	.step-card {
		text-align: center;
		padding: 40px 32px;
		border: 1px solid var(--border);
		border-radius: 16px;
		background: var(--bg);
	}

	.step-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 100px;
		background: var(--olive-light);
		color: var(--olive-dark);
		font-weight: 700;
		font-size: 16px;
		margin-bottom: 24px;
	}

	.step-card h3 {
		font-family: var(--font-sans);
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	.step-card p {
		font-size: 15px;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	/* ---- Use cases ---- */
	.use-cases {
		padding: 120px 24px;
		border-top: 1px solid var(--border-light);
	}

	.cases-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	.case-card {
		display: flex;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 16px;
		overflow: hidden;
		transition: border-color 0.2s;
	}

	.case-card:hover {
		border-color: #c0c0c0;
	}

	.case-content {
		padding: 36px;
	}

	.case-card h3 {
		font-family: var(--font-sans);
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 10px;
		color: var(--text-primary);
		letter-spacing: -0.01em;
	}

	.case-card p {
		font-size: 15px;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	/* ---- CTA ---- */
	.cta {
		padding: 120px 24px 140px;
		background: var(--bg-subtle);
		border-top: 1px solid var(--border-light);
	}

	.cta-inner {
		text-align: center;
		max-width: 560px;
		margin: 0 auto;
	}

	.cta-inner h2 {
		font-family: var(--font-serif);
		font-size: clamp(36px, 4.5vw, 52px);
		font-weight: 400;
		letter-spacing: -0.025em;
		line-height: 1.1;
		color: var(--text-primary);
		margin-bottom: 20px;
	}

	.cta-sub {
		font-size: 19px;
		line-height: 1.6;
		color: var(--text-secondary);
		margin-bottom: 40px;
	}

	.cta-form {
		display: flex;
		gap: 10px;
		justify-content: center;
		max-width: 440px;
		margin: 0 auto;
	}

	.cta-input {
		flex: 1;
		padding: 16px 22px;
		border-radius: 100px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text-primary);
		font-size: 16px;
		font-family: var(--font-sans);
		outline: none;
		transition: border-color 0.2s;
	}

	.cta-input::placeholder {
		color: var(--text-tertiary);
	}

	.cta-input:focus {
		border-color: var(--olive);
	}

	.cta-note {
		display: block;
		margin-top: 20px;
		font-size: 14px;
		color: var(--text-tertiary);
	}

	/* ---- Footer ---- */
	.footer {
		border-top: 1px solid var(--border-light);
		padding: 32px 24px;
	}

	.footer-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.footer-logo {
		display: flex;
		align-items: center;
	}

	.footer-copy {
		font-size: 14px;
		color: var(--text-tertiary);
	}

	/* ---- Responsive ---- */
	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}

		.hero {
			padding: 140px 20px 60px;
		}

		.hide-mobile {
			display: none;
		}

		.demo-cards {
			grid-template-columns: 1fr;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.steps-grid {
			grid-template-columns: 1fr;
		}

		.cases-grid {
			grid-template-columns: 1fr;
		}

		.cta-form {
			flex-direction: column;
		}

		.footer-inner {
			flex-direction: column;
			gap: 16px;
			text-align: center;
		}
	}
</style>
