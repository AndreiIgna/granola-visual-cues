import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { chatWithVideo } from '$lib/server/gemini';
import type { VideoSource, ChatMessage } from '$lib/types';

export const POST: RequestHandler = async ({ request, platform }) => {
	const apiKey = platform?.env?.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!apiKey) {
		throw error(500, 'API key not configured');
	}

	const body = await request.json();
	const { videoSource, history, message } = body as {
		videoSource: VideoSource;
		history: ChatMessage[];
		message: string;
	};

	if (!videoSource || !message) {
		throw error(400, 'Missing videoSource or message');
	}

	try {
		const reply = await chatWithVideo(apiKey, videoSource, history || [], message);
		return json({ reply });
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Chat failed';
		throw error(502, msg);
	}
};
