<script lang="ts">
	import { tick } from 'svelte';
	import type { Participant, KeyMoment, AnalysisResult, ChatMessage, VideoSource } from '$lib/types';

	// ---- Video state ----
	let urlInput = $state('');
	let youtubeId = $state('');
	let videoFile = $state<File | null>(null);
	let videoSrc = $state('');
	let fileInputEl: HTMLInputElement;

	// ---- Analysis state ----
	let analysisResult = $state<AnalysisResult | null>(null);
	let isAnalyzing = $state(false);
	let analysisError = $state('');
	let videoSource = $state<VideoSource | null>(null);

	// Derived data from analysis
	let participants = $derived<Participant[]>(analysisResult?.participants ?? []);
	let keyMoments = $derived<KeyMoment[]>(analysisResult?.keyMoments ?? []);
	let summaryTopics = $derived(analysisResult?.summary ?? []);
	let meetingDuration = $derived(analysisResult?.meetingDuration ?? 1500);

	// ---- Chat state ----
	type UIMessage = { role: 'user' | 'ai' | 'system'; text: string };
	let messages = $state<UIMessage[]>([
		{
			role: 'system',
			text: 'Welcome to Visual Cues Chat. Add a meeting recording above, then ask me anything about what was shown — slides, charts, reactions, body language.'
		}
	]);
	let chatInput = $state('');
	let chatMessagesEl: HTMLDivElement;
	let isTyping = $state(false);
	let chatHistory = $state<ChatMessage[]>([]);

	// ---- YouTube URL parsing ----
	function extractYoutubeId(url: string): string | null {
		const patterns = [
			/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
			/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
			/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
			/(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
		];
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1];
		}
		return null;
	}

	// ---- Analysis ----
	async function triggerAnalysis(source: 'youtube' | 'file') {
		isAnalyzing = true;
		analysisError = '';
		analysisResult = null;

		try {
			let res: Response;
			if (source === 'youtube') {
				res = await fetch('/api/analyze', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ youtubeUrl: urlInput })
				});
			} else {
				const formData = new FormData();
				formData.append('file', videoFile!);
				res = await fetch('/api/analyze', {
					method: 'POST',
					body: formData
				});
			}

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Analysis failed' }));
				throw new Error(err.message || `Server error (${res.status})`);
			}

			const data = await res.json();

			// Extract fileUri/mimeType for chat if it was a file upload
			if (source === 'file' && data.fileUri) {
				videoSource = { type: 'file', fileUri: data.fileUri, mimeType: data.mimeType };
			} else if (source === 'youtube') {
				videoSource = { type: 'youtube', url: urlInput };
			}

			analysisResult = data as AnalysisResult;
			messages = [
				...messages,
				{ role: 'system', text: 'Analysis complete! Ask me anything about what happened in this meeting.' }
			];
		} catch (e) {
			analysisError = e instanceof Error ? e.message : 'Analysis failed';
			messages = [
				...messages,
				{ role: 'system', text: `Analysis failed: ${analysisError}` }
			];
		} finally {
			isAnalyzing = false;
		}
	}

	function handleUrlSubmit() {
		const id = extractYoutubeId(urlInput);
		if (id) {
			youtubeId = id;
			videoFile = null;
			videoSrc = '';
			messages = [
				...messages,
				{ role: 'system', text: 'YouTube video loaded. Analyzing visual content...' }
			];
			triggerAnalysis('youtube');
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			videoFile = file;
			videoSrc = URL.createObjectURL(file);
			youtubeId = '';
			urlInput = '';
			messages = [
				...messages,
				{ role: 'system', text: `"${file.name}" loaded. Analyzing visual content...` }
			];
			triggerAnalysis('file');
		}
	}

	async function sendMessage() {
		const text = chatInput.trim();
		if (!text || !videoSource) return;

		messages = [...messages, { role: 'user', text }];
		chatInput = '';
		isTyping = true;

		await tick();
		scrollChat();

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					videoSource,
					history: chatHistory,
					message: text
				})
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Chat failed' }));
				throw new Error(err.message || `Server error (${res.status})`);
			}

			const data = await res.json();
			const reply = data.reply;

			// Update chat history for multi-turn
			chatHistory = [...chatHistory, { role: 'user', text }, { role: 'model', text: reply }];

			messages = [...messages, { role: 'ai', text: reply }];
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : 'Chat failed';
			messages = [...messages, { role: 'system', text: `Error: ${errorMsg}` }];
		} finally {
			isTyping = false;
			await tick();
			scrollChat();
		}
	}

	function scrollChat() {
		if (chatMessagesEl) {
			chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function handleClear() {
		youtubeId = '';
		videoSrc = '';
		videoFile = null;
		urlInput = '';
		videoClipStart = null;
		activePopover = null;
		analysisResult = null;
		analysisError = '';
		isAnalyzing = false;
		videoSource = null;
		chatHistory = [];
		messages = [
			{
				role: 'system',
				text: 'Welcome to Visual Cues Chat. Add a meeting recording above, then ask me anything about what was shown — slides, charts, reactions, body language.'
			}
		];
	}

	let hasMedia = $derived(!!youtubeId || !!videoSrc);
	let hasAnalysis = $derived(!!analysisResult);


	// SVG graph dimensions
	const graphWidth = 700;
	const graphHeight = 210;
	const graphPadX = 38;
	const graphPadTop = 16;
	const graphPadBottom = 30;
	const plotWidth = graphWidth - graphPadX * 2;
	const plotHeight = graphHeight - graphPadTop - graphPadBottom;

	// Build smooth path with points at start, each moment, and end
	let graphPoints = $derived([
		{ x: 0, y: 50 },
		...keyMoments.map(m => ({
			x: m.timeSeconds / meetingDuration,
			y: m.emotionalValue
		})),
		{ x: 1, y: 70 }
	]);

	function toSvgX(ratio: number) {
		return graphPadX + ratio * plotWidth;
	}

	function toSvgY(value: number) {
		return graphPadTop + plotHeight - (value / 100) * plotHeight;
	}

	// Build smooth bezier path
	function buildSmoothPath(pts: { x: number; y: number }[]): string {
		if (pts.length < 2) return '';
		let d = `M ${toSvgX(pts[0].x)} ${toSvgY(pts[0].y)}`;
		for (let i = 1; i < pts.length; i++) {
			const prev = pts[i - 1];
			const curr = pts[i];
			const cpx = (toSvgX(prev.x) + toSvgX(curr.x)) / 2;
			d += ` C ${cpx} ${toSvgY(prev.y)}, ${cpx} ${toSvgY(curr.y)}, ${toSvgX(curr.x)} ${toSvgY(curr.y)}`;
		}
		return d;
	}

	// Build area fill path (same curve but closed to bottom)
	function buildAreaPath(pts: { x: number; y: number }[]): string {
		const linePath = buildSmoothPath(pts);
		const lastPt = pts[pts.length - 1];
		const firstPt = pts[0];
		return `${linePath} L ${toSvgX(lastPt.x)} ${toSvgY(0)} L ${toSvgX(firstPt.x)} ${toSvgY(0)} Z`;
	}

	let journeyLinePath = $derived(buildSmoothPath(graphPoints));
	let journeyAreaPath = $derived(buildAreaPath(graphPoints));

	// X-axis time ticks
	let xAxisTicks = $derived.by(() => {
		const count = Math.min(6, Math.max(3, Math.ceil(meetingDuration / 300)));
		return Array.from({ length: count + 1 }, (_, i) => {
			const ratio = i / count;
			return { x: toSvgX(ratio), seconds: Math.round(ratio * meetingDuration) };
		});
	});

	let hoveredMoment = $state<number | null>(null);
	let hoveredParticipant = $state<number | null>(null);

	// Format duration as "XX min"
	function formatDuration(seconds: number): string {
		const mins = Math.round(seconds / 60);
		return `${mins} min`;
	}

	let meetingTitle = $derived(analysisResult?.title ?? 'Meeting Analysis');

	// Parse inline visual cue markers from bullet text
	// Format: {{type|MM:SS|label}}
	type TextSegment = { kind: 'text'; value: string } | { kind: 'badge'; type: string; time: string; label: string };
	function parseBulletText(text: string): TextSegment[] {
		const regex = /\{\{(slide|chart|reaction|decision|action)\|(\d{1,2}:\d{2})\|([^}]+)\}\}/g;
		const segments: TextSegment[] = [];
		let lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = regex.exec(text)) !== null) {
			if (match.index > lastIndex) {
				segments.push({ kind: 'text', value: text.slice(lastIndex, match.index) });
			}
			segments.push({ kind: 'badge', type: match[1], time: match[2], label: match[3] });
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < text.length) {
			segments.push({ kind: 'text', value: text.slice(lastIndex) });
		}
		return segments;
	}

	const badgeIcons: Record<string, string> = {
		slide: '📄',
		chart: '📊',
		reaction: '👀',
		decision: '✅',
		action: '📌',
	};

	// Emotion → color + emoji mapping (each emotion gets a unique emoji)
	const emotionMap: Record<string, { emoji: string; color: string }> = {
		// Positive / upbeat
		happy: { emoji: '😊', color: '#22c55e' },
		excited: { emoji: '🤩', color: '#f59e0b' },
		enthusiastic: { emoji: '🔥', color: '#f97316' },
		passionate: { emoji: '❤️‍🔥', color: '#ef4444' },
		confident: { emoji: '😎', color: '#3b82f6' },
		proud: { emoji: '🏆', color: '#eab308' },
		amused: { emoji: '😄', color: '#34d399' },
		joyful: { emoji: '😃', color: '#22c55e' },
		optimistic: { emoji: '🌟', color: '#f59e0b' },
		relieved: { emoji: '😌', color: '#10b981' },
		grateful: { emoji: '🙏', color: '#10b981' },
		hopeful: { emoji: '🌱', color: '#34d399' },
		inspired: { emoji: '💡', color: '#f59e0b' },
		positive: { emoji: '👍', color: '#22c55e' },
		agreement: { emoji: '🤝', color: '#22c55e' },
		accepting: { emoji: '✅', color: '#16a34a' },
		supportive: { emoji: '💚', color: '#10b981' },
		collaborative: { emoji: '🫱🏼‍🫲🏽', color: '#10b981' },
		// Engaged / focused
		focused: { emoji: '🧐', color: '#3b82f6' },
		engaged: { emoji: '👂', color: '#6366f1' },
		attentive: { emoji: '👀', color: '#6366f1' },
		curious: { emoji: '🤔', color: '#f97316' },
		interested: { emoji: '🔍', color: '#8b5cf6' },
		determined: { emoji: '💪', color: '#2563eb' },
		analytical: { emoji: '📊', color: '#6366f1' },
		pragmatic: { emoji: '⚙️', color: '#64748b' },
		// Thoughtful / reflective
		reflective: { emoji: '🪞', color: '#8b5cf6' },
		thoughtful: { emoji: '💭', color: '#a855f7' },
		contemplative: { emoji: '🧘', color: '#8b5cf6' },
		mixed: { emoji: '🎭', color: '#a855f7' },
		ambivalent: { emoji: '⚖️', color: '#64748b' },
		// Uncertain / skeptical
		confused: { emoji: '😵‍💫', color: '#a855f7' },
		uncertain: { emoji: '❓', color: '#f97316' },
		skeptical: { emoji: '🤨', color: '#f59e0b' },
		hesitant: { emoji: '😬', color: '#f59e0b' },
		surprised: { emoji: '😮', color: '#c084fc' },
		amazed: { emoji: '😲', color: '#c084fc' },
		impressed: { emoji: '🤯', color: '#7c3aed' },
		// Concerned / anxious
		worried: { emoji: '😟', color: '#f97316' },
		anxious: { emoji: '😰', color: '#fb923c' },
		concerned: { emoji: '😕', color: '#ea580c' },
		stressed: { emoji: '😫', color: '#ef4444' },
		overwhelmed: { emoji: '🤯', color: '#dc2626' },
		// Negative
		bored: { emoji: '😒', color: '#94a3b8' },
		frustrated: { emoji: '😤', color: '#ef4444' },
		disappointed: { emoji: '😞', color: '#dc2626' },
		annoyed: { emoji: '😑', color: '#f87171' },
		impatient: { emoji: '⏰', color: '#fb923c' },
		// Neutral / calm
		neutral: { emoji: '😐', color: '#94a3b8' },
		calm: { emoji: '🧘', color: '#10b981' },
		reserved: { emoji: '🤐', color: '#94a3b8' },
	};

	const defaultEmotion = { emoji: '💬', color: '#94a3b8' };

	function getEmotionConfig(emotion: string): { emoji: string; color: string } {
		return emotionMap[emotion.toLowerCase()] ?? defaultEmotion;
	}

	// Top 5 emotions for legend (by frequency)
	let uniqueEmotions = $derived.by(() => {
		const counts = new Map<string, { count: number; emoji: string; color: string }>();
		for (const m of keyMoments) {
			const key = m.emotion.toLowerCase();
			const cfg = getEmotionConfig(m.emotion);
			const existing = counts.get(key);
			if (existing) existing.count++;
			else counts.set(key, { count: 1, ...cfg });
		}
		return [...counts.entries()]
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 5)
			.map(([name, cfg]) => ({ name, emoji: cfg.emoji, color: cfg.color }));
	});


	// Convert MM:SS to total seconds
	function timeToSeconds(time: string): number {
		const parts = time.split(':').map(Number);
		return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
	}

	// Format seconds as MM:SS
	function formatTimestamp(s: number): string {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	// ---- Evidence popover ----
	type PopoverData = {
		type: string;
		time: string;
		timeSeconds: number;
		label: string;
		left: number;
		top: number;
	};

	let activePopover = $state<PopoverData | null>(null);
	let popoverHoverTimer: ReturnType<typeof setTimeout> | null = null;
	let popoverCloseTimer: ReturnType<typeof setTimeout> | null = null;
	let linkCopied = $state(false);

	function openPopover(el: HTMLElement, segment: { type: string; time: string; label: string }) {
		if (popoverCloseTimer) { clearTimeout(popoverCloseTimer); popoverCloseTimer = null; }
		if (popoverHoverTimer) { clearTimeout(popoverHoverTimer); popoverHoverTimer = null; }
		popoverHoverTimer = setTimeout(() => {
			const rect = el.getBoundingClientRect();
			const popW = 390;
			const left = Math.max(12, Math.min(rect.left + rect.width / 2 - popW / 2, window.innerWidth - popW - 12));
			const spaceBelow = window.innerHeight - rect.bottom;
			const top = spaceBelow > 380 ? rect.bottom + 8 : rect.top - 8; // flip if no room
			activePopover = {
				type: segment.type,
				time: segment.time,
				timeSeconds: timeToSeconds(segment.time),
				label: segment.label,
				left,
				top,
			};
			linkCopied = false;
		}, 200);
	}

	function startClosePopover() {
		if (popoverHoverTimer) { clearTimeout(popoverHoverTimer); popoverHoverTimer = null; }
		popoverCloseTimer = setTimeout(() => { activePopover = null; }, 150);
	}

	function cancelClosePopover() {
		if (popoverCloseTimer) { clearTimeout(popoverCloseTimer); popoverCloseTimer = null; }
	}

	function closePopoverNow() {
		if (popoverHoverTimer) { clearTimeout(popoverHoverTimer); popoverHoverTimer = null; }
		if (popoverCloseTimer) { clearTimeout(popoverCloseTimer); popoverCloseTimer = null; }
		activePopover = null;
	}

	// ---- Video clip playback ----
	let videoClipStart = $state<number | null>(null);

	let videoEmbedSrc = $derived(
		youtubeId
			? videoClipStart !== null
				? `https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0&start=${videoClipStart}&end=${videoClipStart + 18}&autoplay=1`
				: `https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0`
			: ''
	);

	function playClip(seconds: number) {
		videoClipStart = seconds;
		closePopoverNow();
		tick().then(() => {
			const player = document.querySelector('.doc-video-player');
			if (player) player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		});
	}

	function copyEvidenceLink(seconds: number) {
		if (youtubeId) {
			navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${youtubeId}&t=${seconds}`);
			linkCopied = true;
			setTimeout(() => { linkCopied = false; }, 1500);
		}
	}
</script>

<svelte:head>
	<title>Meeting Analyzer — Granola Visual Cues</title>
</svelte:head>

<!-- Top bar -->
<header class="topbar">
	<a href="/" class="topbar-logo">
		<svg width="100" height="22" viewBox="0 0 148 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#topbar-logo)"><path d="M15.0685 31.9176C18.3692 31.9176 21.8285 31.1864 23.2219 30.1724C24.1117 29.5378 24.5532 29.5999 25.3464 28.8411C25.5672 28.6204 25.6637 28.5549 25.7258 28.4928C28.7402 26.0164 30.4854 22.8124 30.4854 18.6564C30.4854 11.8964 25.6948 7.29547 18.8417 7.29547C12.8129 7.29547 8.21198 11.1342 8.21198 16.0524C8.21198 20.5257 11.7023 23.7298 16.6826 23.7298C16.9689 23.7298 17.0965 23.5711 17.4138 23.5711C18.621 23.5711 19.6039 23.2228 20.2385 22.5571C20.5558 22.2088 21.1594 21.5086 21.2215 21.4776C21.5077 21.2224 21.5698 20.843 21.6354 20.6843C21.6974 20.5257 21.825 20.4291 21.8906 20.2084C21.9527 19.9532 21.8595 19.6359 21.8595 19.353C21.8595 18.846 22.0803 18.3391 22.0803 17.8631C22.0803 16.5318 20.4937 15.197 19.0659 15.197C18.9072 15.197 18.9072 15.0694 18.8107 15.0694C18.7141 15.0694 18.621 15.166 18.5244 15.166C18.4278 15.166 18.3037 15.0074 18.176 15.0074C18.0484 15.0074 17.9863 15.135 17.7967 15.135C17.3828 15.135 17.3517 15.197 17.0344 15.197C16.9379 15.197 16.7792 15.2281 16.7171 15.2591C16.5895 15.3212 16.5895 15.4178 16.4619 15.4178C16.2918 15.4178 16.2067 15.45 16.2067 15.5143C16.2067 15.8627 16.2377 15.8006 16.0791 15.8006C15.9089 15.8006 15.8032 15.811 15.7618 15.8317C15.6342 15.8937 15.7307 16.0524 15.6031 16.149C15.4755 16.211 15.4445 16.3076 15.4134 16.4973C15.3824 16.687 15.1927 16.7525 15.1927 16.9422C15.1927 17.0388 15.2237 17.1009 15.2237 17.163C15.2237 17.3526 14.8443 17.2906 14.8443 17.4803C14.8443 17.6079 14.9409 17.701 14.9409 17.8286C14.9409 17.9252 14.8788 17.9873 14.8788 18.0838C14.8788 18.1804 14.9409 18.2425 14.9409 18.3046C14.9409 18.4632 14.7202 18.4943 14.7202 18.6219C14.7202 18.7495 14.8478 18.8426 14.8478 18.9392C14.8478 19.0013 14.7512 19.0357 14.7512 19.1289C14.7512 19.222 14.7202 19.0668 14.9099 19.3496C15.0375 19.5393 15.0375 19.6359 14.9099 19.7945C14.7823 19.9532 14.5305 20.0497 14.2132 20.0497C12.8819 20.0497 12.7232 18.6839 11.9921 18.4632C11.7713 18.4011 11.7368 18.3666 11.7368 18.2735C11.7368 18.1804 11.7368 18.2114 11.8644 18.0838C11.992 17.9562 12.0231 17.8631 12.0231 17.7665C12.0231 17.67 12.0231 17.6389 11.961 17.5768C11.7058 17.163 11.5816 16.656 11.5816 16.0869C11.5816 13.1691 15.1341 10.7237 18.5002 10.7237C19.5142 10.7237 19.3556 10.979 19.9592 10.979C20.1178 10.979 20.0557 10.979 20.2765 10.9479C20.849 10.8513 21.894 11.0755 22.7183 11.486C25.0015 12.6276 26.4949 15.3247 26.4949 18.4667C26.4949 23.8298 21.7354 27.7306 15.3893 27.7306C11.93 27.7306 9.55018 26.6511 7.20144 24.0195C6.94621 23.7332 7.32905 24.0816 6.91517 23.3538C6.40818 22.464 6.47026 23.0365 6.47026 23.0365C6.3116 22.8468 6.02534 22.3054 5.86669 22.1157C5.677 21.8949 5.42177 21.926 5.32865 21.7984C5.20104 21.6397 5.39073 21.3534 5.32865 21.1948C5.26657 20.9396 4.72508 20.5602 4.663 20.3705C4.60092 20.1808 4.37674 18.9737 4.37674 18.7529C4.37674 18.4977 4.56643 18.4667 4.56643 18.308C4.56643 18.0873 4.28016 18.0217 4.12151 17.7044C3.96286 17.3871 3.86629 16.656 3.86629 15.8627C3.86629 15.4488 3.86629 15.2902 3.9939 14.3383C4.02494 14.0209 4.5009 14.0209 4.5009 13.6726C4.5009 13.545 4.43882 13.3863 4.43882 13.2932C4.43882 13.1656 4.43882 13.1346 4.46986 13.038C5.80116 7.45412 11.7679 3.29812 18.4002 3.29812C20.6834 3.29812 22.4286 3.71199 25.1257 4.8536C26.0155 5.23299 27.3158 4.56734 27.3158 3.87064C27.3779 3.64991 27.2537 3.58438 27.2192 3.45677C27.1882 3.32916 27.0606 3.17051 26.933 3.13946C26.8709 3.10842 26.8364 3.01185 26.7743 2.91873C26.6777 2.76008 26.5846 2.698 26.3294 2.63247C26.2018 2.60143 26.1397 2.57039 26.0742 2.50485C25.9776 2.37724 25.9155 2.31516 25.7879 2.24963C25.6603 2.18755 25.5672 2.24963 25.5016 2.21859C25.4396 2.18755 25.4051 2.12202 25.343 2.09098C25.3119 2.05994 25.2464 2.05994 25.1533 2.05994C21.9527 0.345803 19.8591 0.0905796 17.0689 0.0905796C11.0401 0.0905796 5.64595 2.69455 2.31425 7.22994C2.02799 7.60932 2.18664 8.24393 1.77622 8.62677C0.982955 9.35795 0 13.3553 0 15.8937C0 18.0183 0.506998 20.843 1.17265 22.3985C2.47291 25.4439 1.90383 24.1747 2.09352 24.461C2.47291 25.0645 2.79021 25.1266 2.94886 25.3163C2.94886 25.3163 3.04544 25.506 3.04544 25.6957C3.04544 25.8233 3.04544 25.8543 3.07648 25.9164C3.17305 26.1061 3.61451 26.4234 3.74213 26.551C4.02839 26.8373 4.24912 27.4409 4.72508 27.9168C5.45626 28.648 6.5013 29.2171 9.833 30.7726C11.0056 31.3106 10.34 31.0278 10.4676 31.0588C10.7539 31.1554 11.1333 31.1554 11.3574 31.3141C11.4851 31.4106 11.3264 31.3761 11.6747 31.3761C11.7368 31.3761 11.7368 31.4072 11.8024 31.4382C11.8644 31.4693 11.93 31.5658 12.0231 31.5658C12.0852 31.5658 12.1197 31.5037 12.2128 31.5348C12.3059 31.5658 12.5301 31.7245 12.7198 31.8211C12.8784 31.9176 12.9095 31.9176 12.975 31.8521C13.1647 31.7245 13.2923 31.8831 13.482 31.8831C13.5441 31.8831 13.6407 31.8521 13.8303 31.8521C14.0856 31.8521 14.0856 31.9142 15.0685 31.9142" fill="#292929"/><path d="M138.987 22.0217C137.4 22.0217 136.162 21.2582 136.162 19.859C136.162 18.7155 136.893 17.9209 138.763 17.3785C139.587 17.1228 141.302 16.7428 142.223 16.5528C142.602 16.456 142.826 16.615 142.826 16.9328V18.8088C142.826 21.0958 140.953 22.0183 138.987 22.0183M137.939 25.9636C139.684 25.9636 141.367 25.4558 142.254 24.789C142.474 24.6301 142.571 24.599 142.699 24.599C142.888 24.599 143.016 24.6957 143.143 25.0136C143.302 25.3625 143.399 25.4903 143.778 25.4903H147.365C147.745 25.4903 148 25.2347 148 24.8547C148 24.409 147.81 23.4866 147.81 22.0908V13.0634C147.81 8.19905 144.892 6.16763 140.036 6.16763C135.783 6.16763 131.975 8.2336 131.595 11.6331C131.564 11.9821 131.816 12.2066 132.168 12.2066H136.104C136.642 12.2066 136.835 12.0477 137.025 11.5709C137.404 10.6174 138.325 10.1717 139.912 10.1717C141.912 10.1717 142.768 11.0631 142.768 11.9821C142.768 12.6177 142.45 13.0323 141.56 13.3156C140.705 13.6024 139.529 13.7924 138.132 14.0135C134.196 14.5524 131.023 16.1106 131.023 19.9903C131.023 23.3898 133.817 25.9671 137.942 25.9671M128.991 25.4869H125.28C124.9 25.4869 124.645 25.2312 124.645 24.8512V0.695223C124.645 0.315195 124.9 0.0595398 125.28 0.0595398H128.991C129.371 0.0595398 129.626 0.315195 129.626 0.695223V24.8512C129.626 25.2312 129.371 25.4869 128.991 25.4869ZM113.504 21.8939C110.838 21.8939 108.965 19.6379 108.965 16.1105C108.965 12.5832 110.838 10.3583 113.504 10.3583C116.17 10.3583 118.043 12.6143 118.043 16.1105C118.043 19.6068 116.17 21.8939 113.504 21.8939ZM113.504 26.0915C119.564 26.0915 123.245 21.545 123.245 16.2384C123.245 10.9318 119.564 6.16418 113.504 6.16418C107.444 6.16418 103.764 10.994 103.764 16.2384C103.764 21.4828 107.444 26.0915 113.504 26.0915ZM86.5001 25.4869H90.2114C90.5909 25.4869 90.8461 25.2312 90.8461 24.8512V14.4902C90.8461 12.0753 92.1775 10.5483 94.3367 10.5483C96.2718 10.5483 97.3824 11.6608 97.3824 13.6646V24.8512C97.3824 25.2312 97.6377 25.4869 98.0171 25.4869H101.728C102.108 25.4869 102.363 25.2312 102.363 24.8512V14.1068C102.363 8.76564 100.269 6.16072 95.9199 6.16072C93.9194 6.16072 92.4293 6.8275 91.5394 7.43209C91.2531 7.6221 91.16 7.68774 91.0324 7.68774C90.8116 7.68774 90.715 7.55992 90.5564 7.24207C90.3977 6.89314 90.2701 6.76531 89.8596 6.76531H86.4966C86.1172 6.76531 85.862 7.02097 85.862 7.40099V24.8512C85.862 25.2312 86.1172 25.4869 86.4966 25.4869M75.3314 22.0217C73.7448 22.0217 72.5065 21.2582 72.5065 19.859C72.5065 18.7155 73.2377 17.9209 75.1072 17.3785C75.9316 17.1228 77.6459 16.7428 78.5668 16.5528C78.9462 16.456 79.1704 16.615 79.1704 16.9328V18.8088C79.1704 21.0958 77.2975 22.0183 75.3314 22.0183M74.2829 25.9636C76.0282 25.9636 77.7114 25.4558 78.5979 24.789C78.8186 24.6301 78.9152 24.599 79.0428 24.599C79.2325 24.599 79.3601 24.6957 79.4878 25.0136C79.6464 25.3625 79.743 25.4903 80.1224 25.4903H83.7096C84.089 25.4903 84.3443 25.2347 84.3443 24.8547C84.3443 24.409 84.1546 23.4866 84.1546 22.0908V13.0634C84.1546 8.19905 81.2365 6.16763 76.38 6.16763C72.1271 6.16763 68.3191 8.2336 67.9397 11.6331C67.9087 11.9821 68.1605 12.2066 68.5123 12.2066H72.4479C72.986 12.2066 73.1791 12.0477 73.3688 11.5709C73.7482 10.6174 74.6692 10.1717 76.2558 10.1717C78.2564 10.1717 79.1118 11.0631 79.1118 11.9821C79.1118 12.6177 78.7945 13.0323 77.9046 13.3156C77.0492 13.6024 75.873 13.7924 74.476 14.0135C70.5404 14.5524 67.3671 16.1106 67.3671 19.9903C67.3671 23.3898 70.161 25.9671 74.2863 25.9671M61.7173 7.43209C61.4 7.6532 61.3034 7.71884 61.1447 7.71884C60.924 7.71884 60.7963 7.59101 60.6377 7.24207C60.479 6.89314 60.3514 6.76531 59.9409 6.76531H56.5779C56.1985 6.76531 55.9433 7.02097 55.9433 7.40099V24.8512C55.9433 25.2312 56.1985 25.4869 56.5779 25.4869H60.2893C60.6687 25.4869 60.924 25.2312 60.924 24.8512V15.0603C60.924 12.6454 61.9725 11.3084 64.3525 11.3084H66.4772C66.8256 11.3084 67.0498 11.0873 67.0498 10.7349V7.0486C67.0498 6.57184 66.7946 6.38183 65.5597 6.38183C64.2283 6.38183 62.6417 6.7964 61.7207 7.43209M44.9954 20.6571C42.4567 20.6571 40.6804 18.6222 40.6804 15.4127C40.6804 12.2032 42.4567 10.1994 44.9954 10.1994C47.534 10.1994 49.3104 12.2343 49.3104 15.4127C49.3104 18.5911 47.503 20.6571 44.9954 20.6571ZM44.8367 31.9405C51.1833 31.9405 54.2945 28.5064 54.2945 22.343V7.40099C54.2945 7.02097 54.0393 6.76531 53.6599 6.76531H50.1692C49.7553 6.76531 49.6311 6.89314 49.4725 7.24207C49.3138 7.55992 49.2172 7.68774 48.9965 7.68774C48.8689 7.68774 48.7757 7.62556 48.4239 7.43209C46.8373 6.5753 45.4403 6.28855 43.9192 6.28855C38.5246 6.28855 35.4789 10.4205 35.4789 15.5371C35.4789 20.6536 38.5246 24.7856 43.9192 24.7856C45.7266 24.7856 47.5995 24.022 48.4239 23.3864C48.6136 23.2585 48.7102 23.2274 48.8033 23.2274C48.993 23.2274 49.1207 23.3553 49.1207 23.642C49.1207 26.4404 47.5961 28.1229 44.8988 28.1229C43.2156 28.1229 42.3291 27.5494 41.8531 26.8204C41.5979 26.4404 41.4737 26.2815 40.9632 26.2815H37.2829C36.9345 26.2815 36.7103 26.5026 36.7103 26.855C36.7103 29.0177 39.1524 31.9405 44.8333 31.9405" fill="#292929"/></g><defs><clipPath id="topbar-logo"><rect width="148" height="32" fill="white"/></clipPath></defs></svg>
	</a>
	<span class="topbar-divider">/</span>
	<span class="topbar-title">Meeting Analyzer</span>
	<div class="topbar-right">
		<span class="topbar-badge">Visual Cues</span>
	</div>
</header>

<!-- Main layout -->
<div class="layout">
	<!-- Left panel -->
	<div class="panel-left">
		{#if !hasMedia}
			<!-- Input area -->
			<div class="input-area">
				<form class="url-form" onsubmit={(e) => { e.preventDefault(); handleUrlSubmit(); }}>
					<div class="url-input-wrapper">
						<svg class="url-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
							<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
						</svg>
						<input
							type="text"
							bind:value={urlInput}
							placeholder="Paste a YouTube link..."
							class="url-input"
						/>
						<button type="submit" class="url-submit" disabled={!urlInput.trim()}>
							Load
						</button>
					</div>
				</form>
				<div class="input-divider">
					<span>or</span>
				</div>
				<div class="file-btn-wrap">
					<button class="file-btn file-btn-disabled" disabled>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						Upload recording
					</button>
					<span class="file-btn-tooltip">Use a YouTube link instead</span>
				</div>
			</div>
		{/if}

		{#if hasMedia}
			<div class="media-info">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="23 7 16 12 23 17 23 7" />
					<rect x="1" y="5" width="15" height="14" rx="2" />
				</svg>
				<span>
					{#if youtubeId}
						YouTube video loaded
					{:else if videoFile}
						{videoFile.name}
					{/if}
				</span>
				<button class="media-clear" onclick={handleClear}>
					Clear
				</button>
			</div>

			{#if isAnalyzing}
				<div class="analysis-loading">
					<div class="analysis-spinner"></div>
					<p>Analyzing video content...</p>
					<p class="analysis-loading-sub">This may take a minute for longer videos</p>
				</div>
			{/if}

			{#if analysisError && !isAnalyzing}
				<div class="analysis-error">
					<p>{analysisError}</p>
					<button class="retry-btn" onclick={() => triggerAnalysis(youtubeId ? 'youtube' : 'file')}>
						Retry Analysis
					</button>
				</div>
			{/if}

			{#if hasAnalysis}
			<!-- Granola-style document -->
			<div class="doc">
				<h1 class="doc-title">{meetingTitle}</h1>
				{#if youtubeId}
					<a class="doc-video-link" href="https://www.youtube.com/watch?v={youtubeId}" target="_blank" rel="noopener">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
						youtube.com/watch?v={youtubeId}
					</a>
				{/if}

				<!-- Participant chips + meta -->
				<div class="doc-meta">
					{#each participants as p, i}
						<div class="chip-wrap">
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="participant-chip"
								onmouseenter={() => hoveredParticipant = i}
								onmouseleave={() => hoveredParticipant = null}
							>
								<span class="chip-avatar" style="background: {p.color}">{p.initials}</span>
								<span class="chip-name">{p.name}</span>
							</div>
							{#if hoveredParticipant === i}
								<div class="chip-popover">
									<div class="popover-head">
										<span class="popover-avatar" style="background: {p.color}">{p.initials}</span>
										<div>
											<div class="popover-name">{p.name}</div>
											<span class="popover-sentiment sentiment-{p.sentiment.toLowerCase()}">{p.sentiment}</span>
										</div>
									</div>
									<div class="popover-stat">
										<span class="popover-label">Alignment</span>
										<div class="popover-bar-track">
											<div class="popover-bar-fill" style="width: {p.engagement}%; background: {p.engagement >= 80 ? 'var(--olive)' : p.engagement >= 60 ? '#f59e0b' : '#ef4444'}"></div>
										</div>
										<span class="popover-val">{p.engagement}%</span>
									</div>
									<div class="popover-emotions">
										{#each p.emotions as emotion}
											<span class="popover-etag">{emotion}</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
					<div class="meta-chip">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
						{formatDuration(meetingDuration)}
					</div>
				</div>

				<!-- Document body -->
				<div class="doc-body">
					<!-- Summary organized by topics with inline visual cue badges -->
					{#each summaryTopics as topic}
						<div class="doc-section">
							<h2 class="doc-heading"><span class="doc-hash">#</span> {topic.title}</h2>
							<ul class="doc-bullet-list">
								{#each topic.points as point}
									<li class="doc-bullet">
										{#each parseBulletText(point) as segment}
											{#if segment.kind === 'text'}
												{segment.value}
											{:else}
												<!-- svelte-ignore a11y_no_static_element_interactions -->
												<span
													class="cue-badge cue-badge-{segment.type}"
													onmouseenter={(e) => openPopover(e.currentTarget, segment)}
													onmouseleave={() => startClosePopover()}
												>
													<span class="cue-badge-icon">{badgeIcons[segment.type] ?? '📎'}</span>
													<span class="cue-badge-time">{segment.time}</span>
												</span>
											{/if}
										{/each}
									</li>
								{/each}
							</ul>
						</div>
					{/each}

					<!-- Emotional Journey -->
					<div class="doc-section journey-section">
						<div class="journey-header">
							<h2 class="journey-title">Emotional journey</h2>
							<div class="journey-legend">
								{#each uniqueEmotions as emo}
									<span class="journey-legend-item">
										<span class="journey-legend-emoji">{emo.emoji}</span>
										<span class="journey-legend-label">{emo.name.charAt(0).toUpperCase() + emo.name.slice(1)}</span>
									</span>
								{/each}
							</div>
						</div>
						<div class="journey-graph-area">
							<svg viewBox="0 0 {graphWidth} {graphHeight}" class="journey-graph" preserveAspectRatio="xMidYMid meet">
								<!-- Y-axis emoji labels -->
								<foreignObject x="0" y={toSvgY(100) - 10} width="30" height="24">
									<span xmlns="http://www.w3.org/1999/xhtml" style="font-size: 18px; line-height: 1;">😊</span>
								</foreignObject>
								<foreignObject x="0" y={toSvgY(0) - 12} width="30" height="24">
									<span xmlns="http://www.w3.org/1999/xhtml" style="font-size: 18px; line-height: 1;">☹️</span>
								</foreignObject>
								<!-- Baseline -->
								<line x1={graphPadX} y1={toSvgY(0)} x2={graphPadX + plotWidth} y2={toSvgY(0)} stroke="var(--border)" stroke-width="1" />
								<path d={journeyLinePath} fill="none" stroke="var(--olive)" stroke-width="3" stroke-linecap="round" />
								{#each keyMoments as moment, i}
									{@const cx = toSvgX(moment.timeSeconds / meetingDuration)}
									{@const cy = toSvgY(moment.emotionalValue)}
									{@const emo = getEmotionConfig(moment.emotion)}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<circle {cx} {cy} r="18" fill="transparent" class="moment-hit-area"
										onmouseenter={() => hoveredMoment = i}
										onmouseleave={() => hoveredMoment = null}
									/>
									<foreignObject
										x={cx - 11} y={cy - 11}
										width="22" height="22"
										class="moment-emoji"
										style="pointer-events: none;"
									>
										<span xmlns="http://www.w3.org/1999/xhtml" class="moment-emoji-inner" class:moment-emoji-hovered={hoveredMoment === i}>{emo.emoji}</span>
									</foreignObject>
								{/each}
								<!-- X-axis timestamps -->
								{#each xAxisTicks as tick}
									<line x1={tick.x} y1={toSvgY(0)} x2={tick.x} y2={toSvgY(0) + 4} stroke="var(--text-tertiary)" stroke-width="1" />
									<text x={tick.x} y={graphHeight - 4} text-anchor="middle" fill="var(--text-tertiary)" font-size="10" font-family="var(--font-sans)">{formatTimestamp(tick.seconds)}</text>
								{/each}
							</svg>
							<!-- Hover tooltip (HTML, positioned below chart) -->
							{#each keyMoments as moment, i}
								{#if hoveredMoment === i}
									{@const emo = getEmotionConfig(moment.emotion)}
									{@const leftPct = (moment.timeSeconds / meetingDuration) * 100}
									<div class="journey-tooltip" style="left: clamp(100px, {leftPct}%, calc(100% - 100px));">
										<div class="journey-tooltip-emotion">{emo.emoji} {moment.emotion}</div>
										<div class="journey-tooltip-desc">{moment.description}</div>
										<div class="journey-tooltip-time">{moment.time}</div>
									</div>
								{/if}
							{/each}
						</div>
						<!-- Key moments timeline -->
						<div class="timeline-bar">
							<div class="timeline-track">
								{#each keyMoments as moment}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="timeline-segment"
										class:timeline-decision={moment.type === 'decision'}
										style="left: {(moment.timeSeconds / meetingDuration) * 100}%"
										title="{moment.time} — {moment.description}"
										onclick={() => playClip(moment.timeSeconds)}
									></div>
								{/each}
							</div>
						</div>
						<div class="timeline-legend">
							<span class="timeline-legend-item">
								<span class="timeline-legend-swatch timeline-swatch-moment"></span>
								Key moments
							</span>
							<span class="timeline-legend-item">
								<span class="timeline-legend-swatch timeline-swatch-decision"></span>
								Decision made
							</span>
						</div>
					</div>

					<!-- Video player -->
					{#if youtubeId}
						<div class="doc-section">
							<div class="doc-video-player">
								<iframe
									src={videoEmbedSrc}
									title="Meeting recording"
									frameborder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</div>
						</div>
					{/if}
				</div>
			</div>
			{/if}
		{/if}
	</div>

	<!-- Right panel: Chat -->
	<div class="panel-right">
		<div class="chat-header">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			<span>Visual Cues Chat</span>
		</div>

		<div class="chat-messages" bind:this={chatMessagesEl}>
			{#each messages as msg}
				<div class="msg msg-{msg.role}">
					{#if msg.role === 'ai'}
						<div class="msg-avatar">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						</div>
					{/if}
					<div class="msg-bubble">
						{msg.text}
					</div>
				</div>
			{/each}
			{#if isTyping}
				<div class="msg msg-ai">
					<div class="msg-avatar">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
					</div>
					<div class="msg-bubble msg-typing">
						<span class="typing-dot"></span>
						<span class="typing-dot"></span>
						<span class="typing-dot"></span>
					</div>
				</div>
			{/if}
		</div>

		<div class="chat-input-area">
			{#if !videoSource}
				<div class="chat-disabled-notice">
					{#if isAnalyzing}
						Waiting for analysis to complete...
					{:else}
						Add a recording to start chatting
					{/if}
				</div>
			{:else if chatHistory.length === 0}
				<div class="chat-hints">
					<button class="chat-hint" onclick={() => { chatInput = 'Who showed the most emotion in the meeting?'; sendMessage(); }}><span class="chat-hint-icon">/</span>Who showed the most emotion?</button>
					<button class="chat-hint" onclick={() => { chatInput = 'Tell me about the handoff fog detection discussion'; sendMessage(); }}><span class="chat-hint-icon">/</span>Handoff fog detection</button>
					<button class="chat-hint" onclick={() => { chatInput = 'What decisions were made?'; sendMessage(); }}><span class="chat-hint-icon">/</span>Decisions made</button>
					<button class="chat-hint" onclick={() => { chatInput = 'Were there any tense or awkward moments?'; sendMessage(); }}><span class="chat-hint-icon">/</span>Any tense moments?</button>
				</div>
			{/if}
			<form class="chat-form" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
				<input
					type="text"
					bind:value={chatInput}
					placeholder={videoSource ? 'Ask about slides, reactions, charts...' : 'Add a recording first...'}
					class="chat-input"
					onkeydown={handleKeydown}
					disabled={!videoSource}
				/>
				<button type="submit" class="chat-send" disabled={!chatInput.trim() || !videoSource}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="22" y1="2" x2="11" y2="13" />
						<polygon points="22 2 15 22 11 13 2 9 22 2" />
					</svg>
				</button>
			</form>
		</div>
	</div>
</div>

<!-- Evidence peek popover (floating, portal-style) -->
{#if activePopover}
	{@const popover = activePopover}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="evidence-popover"
		style="left: {popover.left}px; top: {popover.top}px;"
		onmouseenter={() => cancelClosePopover()}
		onmouseleave={() => startClosePopover()}
	>
		<!-- Preview thumbnail -->
		{#if youtubeId}
			<div
				class="evidence-preview"
				onclick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}&t=${popover.timeSeconds}`, '_blank')}
			>
				<div class="evidence-thumb-skeleton"></div>
				<img
					class="evidence-thumb"
					src="https://img.youtube.com/vi/{youtubeId}/hqdefault.jpg"
					alt="Video frame"
				/>
				<div class="evidence-play-overlay">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.9"><polygon points="5 3 19 12 5 21 5 3" /></svg>
				</div>
				<span class="evidence-ts-badge">{popover.time}</span>
				<span class="evidence-type-badge evidence-type-{popover.type}">{badgeIcons[popover.type] ?? '📎'} {popover.type}</span>
			</div>
		{/if}

		<!-- Play clip button -->
		{#if youtubeId}
			<button class="evidence-play-btn" onclick={() => playClip(popover.timeSeconds)}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
				Play 18s
			</button>
			<span class="evidence-timerange">{formatTimestamp(popover.timeSeconds)}–{formatTimestamp(popover.timeSeconds + 18)}</span>
		{/if}

		<!-- Description -->
		<div class="evidence-label">{popover.label}</div>

		<!-- Footer actions -->
		<div class="evidence-footer">
			<button class="evidence-action" onclick={() => copyEvidenceLink(popover.timeSeconds)}>
				{#if linkCopied}
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
					Copied!
				{:else}
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
					Copy link
				{/if}
			</button>
			{#if youtubeId}
				<a class="evidence-action" href="https://www.youtube.com/watch?v={youtubeId}&t={popover.timeSeconds}" target="_blank" rel="noopener">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
					Open in video
				</a>
			{/if}
		</div>
	</div>
{/if}

<svelte:window
	onkeydown={(e) => { if (e.key === 'Escape') closePopoverNow(); }}
	onmousedown={(e) => {
		if (activePopover && !(e.target instanceof HTMLElement && (e.target.closest('.evidence-popover') || e.target.closest('.cue-badge')))) {
			closePopoverNow();
		}
	}}
/>

<style>
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

	/* ---- Topbar ---- */
	.topbar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 20px;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
		height: 56px;
	}

	.topbar-logo {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.topbar-divider {
		color: var(--text-tertiary);
		font-size: 20px;
		font-weight: 300;
	}

	.topbar-title {
		font-size: 15px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.topbar-right {
		margin-left: auto;
	}

	.topbar-badge {
		display: inline-flex;
		align-items: center;
		padding: 5px 12px;
		border-radius: 100px;
		background: var(--olive-light);
		font-size: 12px;
		font-weight: 600;
		color: var(--olive-dark);
	}

	/* ---- Layout ---- */
	.layout {
		display: grid;
		grid-template-columns: 1fr 460px;
		height: calc(100vh - 56px);
		overflow: hidden;
	}

	/* ---- Left panel ---- */
	.panel-left {
		display: flex;
		flex-direction: column;
		padding: 24px 40px;
		overflow-y: auto;
		border-right: 1px solid var(--border);
	}

	/* Input area */
	.input-area {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 24px;
	}

	.url-form {
		flex: 1;
	}

	.url-input-wrapper {
		display: flex;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 4px 4px 4px 14px;
		background: var(--bg);
		transition: border-color 0.2s;
	}

	.url-input-wrapper:focus-within {
		border-color: var(--olive);
	}

	.url-icon {
		flex-shrink: 0;
		color: var(--text-tertiary);
	}

	.url-input {
		flex: 1;
		border: none;
		outline: none;
		padding: 10px 12px;
		font-size: 14px;
		font-family: var(--font-sans);
		color: var(--text-primary);
		background: transparent;
	}

	.url-input::placeholder {
		color: var(--text-tertiary);
	}

	.url-submit {
		padding: 8px 18px;
		border: none;
		border-radius: 10px;
		background: var(--olive);
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: background 0.2s;
	}

	.url-submit:hover:not(:disabled) {
		background: var(--olive-dark);
	}

	.url-submit:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.input-divider {
		color: var(--text-tertiary);
		font-size: 13px;
		flex-shrink: 0;
	}

	.file-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--bg);
		font-size: 14px;
		font-weight: 500;
		font-family: var(--font-sans);
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.file-btn:hover:not(:disabled) {
		border-color: var(--text-secondary);
	}

	.file-btn-disabled {
		opacity: 0.45;
		cursor: not-allowed !important;
	}

	.file-btn-wrap {
		position: relative;
	}

	.file-btn-tooltip {
		display: none;
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		background: var(--text-primary);
		color: #fff;
		font-size: 12px;
		font-weight: 500;
		padding: 6px 12px;
		border-radius: 8px;
		white-space: nowrap;
		z-index: 50;
		pointer-events: none;
	}

	.file-btn-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--text-primary);
	}

	.file-btn-wrap:hover .file-btn-tooltip {
		display: block;
	}

	/* Media info bar */
	.media-info {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		margin-top: 12px;
		border: 1px solid var(--border);
		border-radius: 10px;
		font-size: 13px;
		color: var(--text-secondary);
		background: var(--bg-subtle);
	}

	.media-info span {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.media-clear {
		background: none;
		border: none;
		font-size: 13px;
		font-family: var(--font-sans);
		color: var(--text-secondary);
		cursor: pointer;
		padding: 2px 8px;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.media-clear:hover {
		color: var(--text-primary);
		background: var(--border-light);
	}

	/* Analysis loading */
	.analysis-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 40px 20px;
		text-align: center;
	}

	.analysis-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--olive);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.analysis-loading p {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-primary);
	}

	.analysis-loading-sub {
		font-size: 12px !important;
		font-weight: 400 !important;
		color: var(--text-secondary) !important;
	}

	/* Analysis error */
	.analysis-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 24px 20px;
		margin-top: 12px;
		border: 1px solid #fee2e2;
		border-radius: 12px;
		background: #fef2f2;
		text-align: center;
	}

	.analysis-error p {
		font-size: 13px;
		color: #dc2626;
	}

	.retry-btn {
		padding: 8px 18px;
		border: none;
		border-radius: 10px;
		background: var(--olive);
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: background 0.2s;
	}

	.retry-btn:hover {
		background: var(--olive-dark);
	}

	/* ---- Right panel: Chat ---- */
	.panel-right {
		display: flex;
		flex-direction: column;
		background: var(--bg-subtle);
		height: 100%;
		overflow: hidden;
	}

	.chat-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		background: var(--bg);
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* Messages */
	.msg {
		display: flex;
		gap: 8px;
		max-width: 92%;
	}

	.msg-system {
		align-self: center;
		max-width: 85%;
	}

	.msg-system .msg-bubble {
		background: var(--olive-50);
		color: var(--olive-dark);
		text-align: center;
		font-size: 13px;
		border-radius: 12px;
	}

	.msg-user {
		align-self: flex-end;
		flex-direction: row-reverse;
	}

	.msg-user .msg-bubble {
		background: var(--olive);
		color: #fff;
		border-radius: 16px 16px 4px 16px;
	}

	.msg-ai {
		align-self: flex-start;
	}

	.msg-ai .msg-bubble {
		background: var(--bg);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 16px 16px 16px 4px;
	}

	.msg-avatar {
		width: 28px;
		height: 28px;
		border-radius: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--olive-light);
		color: var(--olive-dark);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.msg-bubble {
		padding: 10px 14px;
		font-size: 14px;
		line-height: 1.55;
	}

	/* Typing indicator */
	.msg-typing {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 12px 18px;
	}

	.typing-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-tertiary);
		animation: typing-bounce 1.4s ease-in-out infinite;
	}

	.typing-dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing-bounce {
		0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
		30% { transform: translateY(-4px); opacity: 1; }
	}

	/* Chat input */
	.chat-input-area {
		padding: 16px 20px;
		border-top: 1px solid var(--border);
		background: var(--bg);
	}

	.chat-disabled-notice {
		text-align: center;
		font-size: 12px;
		color: var(--text-tertiary);
		margin-bottom: 10px;
	}

	.chat-hints {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 12px;
		padding: 0 4px;
	}

	.chat-hint {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px 8px 8px;
		border: 1px solid var(--border);
		border-radius: 100px;
		background: var(--bg);
		font-size: 13px;
		font-weight: 500;
		font-family: var(--font-sans);
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.chat-hint:hover {
		background: #f5f5f0;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.chat-hint-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 7px;
		background: linear-gradient(135deg, #c4b5fd, #a5f3fc, #d8b4fe);
		font-size: 14px;
		font-weight: 600;
		color: #4b3b8a;
		flex-shrink: 0;
	}

	.chat-form {
		display: flex;
		gap: 8px;
	}

	.chat-input {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 12px;
		font-size: 14px;
		font-family: var(--font-sans);
		color: var(--text-primary);
		background: var(--bg);
		outline: none;
		transition: border-color 0.2s;
	}

	.chat-input::placeholder {
		color: var(--text-tertiary);
	}

	.chat-input:focus {
		border-color: var(--olive);
	}

	.chat-input:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.chat-send {
		width: 42px;
		height: 42px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 12px;
		background: var(--olive);
		color: #fff;
		cursor: pointer;
		transition: background 0.2s;
		flex-shrink: 0;
	}

	.chat-send:hover:not(:disabled) {
		background: var(--olive-dark);
	}

	.chat-send:disabled {
		opacity: 0.3;
		cursor: default;
	}

	/* ---- Granola-style Document ---- */
	.doc {
		margin-top: 24px;
		padding: 0 12px;
	}

	.doc-title {
		font-family: var(--font-serif);
		font-size: 36px;
		font-weight: 400;
		color: var(--text-primary);
		line-height: 1.2;
		margin-bottom: 8px;
	}

	.doc-video-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--text-secondary);
		text-decoration: none;
		margin-bottom: 16px;
		transition: color 0.15s;
	}

	.doc-video-link:hover {
		color: var(--olive-dark);
	}

	.doc-video-player {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.doc-video-player iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	/* Participant chips + meta row */
	.doc-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}

	.chip-wrap {
		position: relative;
	}

	.participant-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px 5px 5px;
		border-radius: 100px;
		border: 1px solid var(--border);
		background: var(--bg);
		cursor: default;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.participant-chip:hover {
		border-color: var(--text-tertiary);
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	}

	.chip-avatar {
		width: 22px;
		height: 22px;
		border-radius: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 9px;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
	}

	.chip-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-primary);
		white-space: nowrap;
	}

	.meta-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 12px;
		border-radius: 100px;
		border: 1px solid var(--border);
		background: var(--bg);
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	/* Participant hover popover */
	.chip-popover {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		width: 260px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 14px;
		box-shadow: 0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04);
		padding: 16px;
		z-index: 100;
		animation: popover-in 0.15s ease;
	}

	@keyframes popover-in {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.popover-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
	}

	.popover-avatar {
		width: 36px;
		height: 36px;
		border-radius: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
	}

	.popover-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.popover-sentiment {
		font-size: 11px;
		font-weight: 600;
		padding: 1px 7px;
		border-radius: 4px;
		display: inline-block;
		margin-top: 2px;
	}

	.sentiment-positive { background: #dcfce7; color: #15803d; }
	.sentiment-mixed { background: #fef3c7; color: #92400e; }
	.sentiment-neutral { background: #f3f4f6; color: #6b7280; }
	.sentiment-negative { background: #fee2e2; color: #dc2626; }

	.popover-stat {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}

	.popover-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-secondary);
		flex-shrink: 0;
		width: 72px;
	}

	.popover-bar-track {
		flex: 1;
		height: 6px;
		background: var(--border-light);
		border-radius: 3px;
		overflow: hidden;
	}

	.popover-bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.popover-val {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-primary);
		width: 32px;
		text-align: right;
	}

	.popover-emotions {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
	}

	.popover-etag {
		font-size: 11px;
		font-weight: 500;
		padding: 3px 8px;
		border-radius: 6px;
		background: var(--bg-subtle);
		border: 1px solid var(--border-light);
		color: var(--text-secondary);
	}

	/* Document body */
	.doc-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.doc-section {
		margin-bottom: 8px;
	}

	.doc-heading {
		font-family: var(--font-sans);
		font-size: 15px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 10px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.doc-hash {
		color: var(--text-tertiary);
		font-weight: 400;
	}

	/* Summary bullet list */
	.doc-bullet-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.doc-bullet {
		font-size: 15px;
		line-height: 1.6;
		color: #4b5563;
		padding-left: 18px;
		position: relative;
	}

	.doc-bullet::before {
		content: '';
		position: absolute;
		left: 3px;
		top: 10px;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--text-tertiary);
	}

	/* Inline visual cue badges */
	.cue-badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 1px 7px 1px 4px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		vertical-align: baseline;
		cursor: pointer;
		position: relative;
		transition: background 0.12s;
		text-decoration: none;
	}

	.cue-badge-icon {
		font-size: 11px;
	}

	.cue-badge-time {
		font-size: 11px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.cue-badge-slide { background: #eff6ff; color: #1d4ed8; }
	.cue-badge-slide:hover { background: #dbeafe; }
	.cue-badge-chart { background: #f5f3ff; color: #6d28d9; }
	.cue-badge-chart:hover { background: #ede9fe; }
	.cue-badge-reaction { background: #fffbeb; color: #92400e; }
	.cue-badge-reaction:hover { background: #fef3c7; }
	.cue-badge-decision { background: #f0fdf4; color: #15803d; }
	.cue-badge-decision:hover { background: #dcfce7; }
	.cue-badge-action { background: #fdf2f8; color: #be185d; }
	.cue-badge-action:hover { background: #fce7f3; }

	/* ---- Evidence peek popover ---- */
	.evidence-popover {
		position: fixed;
		width: 390px;
		max-height: 460px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 16px;
		box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
		z-index: 200;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: evidence-in 0.15s ease;
	}

	@keyframes evidence-in {
		from { opacity: 0; transform: translateY(-4px) scale(0.98); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	/* Preview thumbnail area */
	.evidence-preview {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #0a0a0a;
		cursor: pointer;
		overflow: hidden;
	}

	.evidence-thumb-skeleton {
		position: absolute;
		inset: 0;
		background: linear-gradient(110deg, #1a1a1a 25%, #2a2a2a 37%, #1a1a1a 50%);
		background-size: 200% 100%;
		animation: skeleton-shimmer 1.4s ease infinite;
	}

	@keyframes skeleton-shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.evidence-thumb {
		position: relative;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		z-index: 1;
	}

	.evidence-play-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0,0,0,0.25);
		z-index: 2;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.evidence-preview:hover .evidence-play-overlay {
		opacity: 1;
	}

	.evidence-ts-badge {
		position: absolute;
		bottom: 8px;
		right: 8px;
		background: rgba(0,0,0,0.75);
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		padding: 3px 8px;
		border-radius: 5px;
		z-index: 3;
		font-family: var(--font-sans);
	}

	.evidence-type-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		font-size: 11px;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 5px;
		z-index: 3;
		font-family: var(--font-sans);
		text-transform: capitalize;
		backdrop-filter: blur(4px);
	}

	.evidence-type-slide { background: rgba(219,234,254,0.85); color: #1d4ed8; }
	.evidence-type-chart { background: rgba(237,233,254,0.85); color: #6d28d9; }
	.evidence-type-reaction { background: rgba(254,243,199,0.85); color: #92400e; }
	.evidence-type-decision { background: rgba(220,252,231,0.85); color: #15803d; }
	.evidence-type-action { background: rgba(252,231,243,0.85); color: #be185d; }

	/* Play clip button */
	.evidence-play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin: 12px 14px 0;
		padding: 9px 16px;
		border: none;
		border-radius: 10px;
		background: var(--olive);
		color: #fff;
		font-size: 13px;
		font-weight: 700;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: background 0.15s;
	}

	.evidence-play-btn:hover {
		background: var(--olive-dark);
	}

	.evidence-timerange {
		display: block;
		text-align: center;
		font-size: 11px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		color: var(--text-tertiary);
		margin: 4px 14px 0;
		font-family: var(--font-sans);
	}

	/* Description label */
	.evidence-label {
		padding: 10px 14px 0;
		font-size: 13px;
		font-weight: 500;
		line-height: 1.45;
		color: var(--text-primary);
	}

	/* Footer actions */
	.evidence-footer {
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 10px 10px 12px;
		margin-top: 4px;
	}

	.evidence-action {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 10px;
		border: none;
		border-radius: 7px;
		background: transparent;
		font-size: 12px;
		font-weight: 500;
		font-family: var(--font-sans);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.12s;
		text-decoration: none;
	}

	.evidence-action:hover {
		background: var(--bg-subtle);
		color: var(--text-primary);
	}

	/* ---- Emotional Journey ---- */
	.journey-section {
		margin-bottom: 0 !important;
	}

	.journey-header {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
		margin-bottom: 16px;
	}

	.journey-title {
		font-family: var(--font-serif);
		font-size: 22px;
		font-weight: 400;
		color: var(--text-primary);
		margin: 0;
	}

	.journey-legend {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}

	.journey-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-primary);
	}

	.journey-legend-emoji {
		font-size: 15px;
	}

	.journey-legend-label {
		font-size: 13px;
	}

	.journey-graph-area {
		position: relative;
	}

	.journey-graph {
		width: 100%;
		height: auto;
		display: block;
	}

	.journey-graph .moment-dot {
		transition: r 0.15s ease;
		cursor: pointer;
	}

	.journey-graph .moment-hit-area {
		cursor: pointer;
	}

	/* Journey tooltip (HTML overlay, below chart) */
	.journey-tooltip {
		position: absolute;
		bottom: 0;
		transform: translateX(-50%) translateY(100%);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 10px 14px;
		box-shadow: 0 6px 20px rgba(0,0,0,0.1);
		z-index: 30;
		width: 200px;
		pointer-events: none;
		animation: popover-in 0.12s ease;
	}

	.journey-tooltip-emotion {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 4px;
	}

	.journey-tooltip-desc {
		font-size: 12px;
		line-height: 1.4;
		color: var(--text-secondary);
		margin-bottom: 4px;
	}

	.journey-tooltip-time {
		font-size: 13px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	/* ---- Timeline bar ---- */
	.timeline-bar {
		margin-top: 6px;
	}

	.timeline-track {
		position: relative;
		height: 24px;
		background: var(--border-light);
		border-radius: 6px;
		border: 2px solid var(--border);
		overflow: hidden;
	}

	.timeline-segment {
		position: absolute;
		top: 2px;
		bottom: 2px;
		width: 3.5%;
		min-width: 8px;
		border-radius: 3px;
		background: #f3b0e4;
		cursor: pointer;
		transition: opacity 0.12s, transform 0.12s;
	}

	.timeline-segment:hover {
		opacity: 0.8;
		transform: scaleY(1.15);
	}

	.timeline-decision {
		background: #b5c05b;
	}

	.timeline-legend {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-top: 10px;
	}

	.timeline-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-primary);
	}

	.timeline-legend-swatch {
		width: 24px;
		height: 14px;
		border-radius: 4px;
	}

	.timeline-swatch-moment {
		background: #f3b0e4;
	}

	.timeline-swatch-decision {
		background: #b5c05b;
	}

	/* ---- Responsive ---- */
	@media (max-width: 860px) {
		.layout {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr 1fr;
		}

		.panel-left {
			border-right: none;
			border-bottom: 1px solid var(--border);
			overflow-y: auto;
		}

		.input-area {
			flex-direction: column;
			align-items: stretch;
		}

		.file-btn {
			justify-content: center;
		}

		.doc-title {
			font-size: 28px;
		}

		.chip-popover {
			left: -20px;
			width: 240px;
		}

		.doc-meta {
			gap: 6px;
		}
	}
</style>
