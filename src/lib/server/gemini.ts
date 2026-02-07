import type { AnalysisResult, VideoSource, ChatMessage } from '$lib/types';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.5-flash';

function buildVideoPart(videoSource: VideoSource) {
	if (videoSource.type === 'youtube') {
		return { file_data: { file_uri: videoSource.url, mime_type: 'video/youtube' } };
	}
	return { file_data: { file_uri: videoSource.fileUri, mime_type: videoSource.mimeType } };
}

const ANALYSIS_PROMPT = `Analyze this video recording of a meeting. Extract the following information and return it as JSON matching this exact schema:

{
  "title": "string (a descriptive meeting title based on the content, e.g. 'Q3 Product Review — Design & Engineering Sync', 'Weekly Standup: Sprint 14 Planning')",
  "participants": [
    {
      "name": "string (use their real name — listen for introductions, name mentions, on-screen labels, name plates, or video call display names. Only fall back to 'Speaker 1' if truly unidentifiable)",
      "initials": "string (2 letters)",
      "color": "string (hex color, pick distinct colors like #6366f1, #f59e0b, #10b981, #ef4444, #8b5cf6, #ec4899)",
      "engagement": number (0-100, alignment score — how aligned is this person with the meeting's goals and discussion? 100 = actively contributing, on-topic, supportive of decisions, building on others' ideas; 50 = present but passive, neither helping nor hindering; 0 = visibly disengaged, off-topic, blocking progress. Subtract for: checking phone, side conversations, derailing discussion, visible boredom, resistance without constructive input. Add for: asking relevant questions, volunteering for action items, building consensus, active listening signals),
      "sentiment": "Positive" | "Neutral" | "Mixed" | "Negative",
      "emotions": ["string array of 2-3 observed emotions like Focused, Skeptical, Enthusiastic, etc."]
    }
  ],
  "keyMoments": [
    {
      "time": "string (MM:SS format)",
      "timeSeconds": number (total seconds from start),
      "type": "slide" | "reaction" | "chart" | "decision" | "action",
      "description": "string (brief description of what happened)",
      "emotionalValue": number (0-100, where 0=very negative, 50=neutral, 100=very positive),
      "emotion": "string (one of these 5 emotions ONLY: Excited, Focused, Neutral, Confused, Tense)"
    }
  ],
  "summary": [
    {
      "title": "string (short topic heading, e.g. 'Q3 Performance Review', 'Homepage Redesign')",
      "points": ["string (bullet point — may include inline visual cue markers, see format below)"]
    }
  ],
  "topEmotions": [
    { "name": "string (emotion name)", "count": number }
  ],
  "meetingDuration": number (total duration in seconds)
}

IMPORTANT — Inline visual cue markers in summary bullet points:
Use markers ONLY for visual events you can see on screen — a slide being shown, a chart displayed, a UI demo, a screen share. Do NOT use markers for emotions, reactions, or body language.
Format: {{type|MM:SS|short label}}
Types: slide, chart, decision, action
Examples:
- "Revenue grew 12% quarter-over-quarter {{chart|05:30|Revenue chart}} driven by enterprise deals"
- "Team agreed to ship the new onboarding flow by Friday {{decision|12:45|Shipping decision}}"
- "Sarah showed the updated homepage mockup {{slide|08:15|Homepage mockup}} with the new hero section"
- "The project timeline was shared on screen {{slide|20:10|Project timeline}} with milestones through Q4"
Do NOT put every bullet point with a marker — only where there's a clear visual artifact on screen.

Guidelines:
- title should be a natural, descriptive meeting title based on what was discussed (not generic like "Meeting Analysis")
- List 5-10 key moments spread across the video timeline
- Include diverse moment types (slides, reactions, charts, decisions, actions)
- topEmotions should be the top 5 most frequently observed emotions (use only: Excited, Focused, Neutral, Confused, Tense)
- Try hard to identify participants by their real names — check for introductions, verbal name mentions, on-screen labels, name plates, or video call display names. Only use "Speaker 1" etc. as a last resort.
- Be specific in descriptions — mention what was shown or discussed
- meetingDuration should be the total video length in seconds
- summary should have 3-6 topics, each with 2-4 concise bullet points
- Topic titles should be short noun phrases (e.g. "Budget Discussion", "Design Review")
- Include slide/presentation observations DIRECTLY in summary bullet points using the inline marker format — do NOT separate them into their own sections. Reactions and body language should be described in text only, without markers.`;

export async function analyzeVideo(
	apiKey: string,
	videoSource: VideoSource
): Promise<AnalysisResult> {
	const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${apiKey}`;

	const body = {
		contents: [
			{
				parts: [buildVideoPart(videoSource), { text: ANALYSIS_PROMPT }]
			}
		],
		generationConfig: {
			responseMimeType: 'application/json'
		}
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Gemini API error (${res.status}): ${errorText}`);
	}

	const data = await res.json();
	const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) {
		throw new Error('No response from Gemini API');
	}

	return JSON.parse(text) as AnalysisResult;
}

export async function uploadFile(
	apiKey: string,
	fileBytes: ArrayBuffer,
	mimeType: string,
	displayName: string
): Promise<{ fileUri: string; mimeType: string }> {
	// Step 1: Initiate resumable upload
	const initUrl = `${BASE_URL}/upload/v1beta/files?key=${apiKey}`;
	const initRes = await fetch(initUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Upload-Protocol': 'resumable',
			'X-Goog-Upload-Command': 'start',
			'X-Goog-Upload-Header-Content-Length': String(fileBytes.byteLength),
			'X-Goog-Upload-Header-Content-Type': mimeType
		},
		body: JSON.stringify({ file: { display_name: displayName } })
	});

	if (!initRes.ok) {
		const errorText = await initRes.text();
		throw new Error(`File upload init failed (${initRes.status}): ${errorText}`);
	}

	const uploadUrl = initRes.headers.get('X-Goog-Upload-URL');
	if (!uploadUrl) {
		throw new Error('No upload URL returned from Gemini File API');
	}

	// Step 2: Upload file bytes
	const uploadRes = await fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			'Content-Length': String(fileBytes.byteLength),
			'X-Goog-Upload-Offset': '0',
			'X-Goog-Upload-Command': 'upload, finalize'
		},
		body: fileBytes
	});

	if (!uploadRes.ok) {
		const errorText = await uploadRes.text();
		throw new Error(`File upload failed (${uploadRes.status}): ${errorText}`);
	}

	const uploadData = await uploadRes.json();
	const fileUri = uploadData.file?.uri;
	const fileMimeType = uploadData.file?.mimeType;

	if (!fileUri) {
		throw new Error('No file URI returned after upload');
	}

	// Step 3: Poll until file is ACTIVE
	const fileName = uploadData.file?.name;
	if (fileName) {
		let attempts = 0;
		const maxAttempts = 30;
		while (attempts < maxAttempts) {
			const statusRes = await fetch(`${BASE_URL}/${fileName}?key=${apiKey}`);
			if (statusRes.ok) {
				const statusData = await statusRes.json();
				if (statusData.state === 'ACTIVE') break;
				if (statusData.state === 'FAILED') {
					throw new Error('File processing failed');
				}
			}
			attempts++;
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
		if (attempts >= maxAttempts) {
			throw new Error('File processing timed out');
		}
	}

	return { fileUri, mimeType: fileMimeType || mimeType };
}

export async function chatWithVideo(
	apiKey: string,
	videoSource: VideoSource,
	history: ChatMessage[],
	message: string
): Promise<string> {
	const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${apiKey}`;

	// Build contents array: first message includes video, then alternating history
	const contents: Array<{ role: string; parts: unknown[] }> = [];

	// First turn always includes the video context
	const systemPreamble =
		'You are a helpful assistant that answers questions about a video recording of a meeting. ' +
		'Be specific, reference timestamps when possible, and describe visual details you observe. ' +
		'Keep responses concise but informative.';

	if (history.length === 0) {
		// Single turn: video + system context + user message
		contents.push({
			role: 'user',
			parts: [buildVideoPart(videoSource), { text: `${systemPreamble}\n\nUser question: ${message}` }]
		});
	} else {
		// Multi-turn: first message has video context, then history, then new message
		contents.push({
			role: 'user',
			parts: [
				buildVideoPart(videoSource),
				{ text: `${systemPreamble}\n\nUser question: ${history[0].text}` }
			]
		});

		for (let i = 1; i < history.length; i++) {
			const msg = history[i];
			contents.push({
				role: msg.role === 'user' ? 'user' : 'model',
				parts: [{ text: msg.text }]
			});
		}

		// Add the new message
		contents.push({
			role: 'user',
			parts: [{ text: message }]
		});
	}

	const body = { contents };

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Gemini chat error (${res.status}): ${errorText}`);
	}

	const data = await res.json();
	const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) {
		throw new Error('No response from Gemini chat');
	}

	return text;
}
