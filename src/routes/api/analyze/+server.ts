import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeVideo, uploadFile } from '$lib/server/gemini';
import type { VideoSource } from '$lib/types';

export const POST: RequestHandler = async ({ request, platform }) => {
	const apiKey = platform?.env?.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!apiKey) {
		throw error(500, 'API key not configured');
	}

	const contentType = request.headers.get('content-type') || '';

	let videoSource: VideoSource;
	let fileUri: string | undefined;
	let mimeType: string | undefined;

	if (contentType.includes('multipart/form-data')) {
		// File upload
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		if (!file) {
			throw error(400, 'No file provided');
		}

		const fileBytes = await file.arrayBuffer();
		const uploaded = await uploadFile(apiKey, fileBytes, file.type, file.name);
		fileUri = uploaded.fileUri;
		mimeType = uploaded.mimeType;
		videoSource = { type: 'file', fileUri, mimeType };
	} else {
		// JSON body with YouTube URL
		const body = await request.json();
		const youtubeUrl = body.youtubeUrl;
		if (!youtubeUrl || typeof youtubeUrl !== 'string') {
			throw error(400, 'Missing youtubeUrl');
		}
		videoSource = { type: 'youtube', url: youtubeUrl };
	}

	try {
		const result = await analyzeVideo(apiKey, videoSource);
		return json({ ...result, fileUri, mimeType });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Analysis failed';
		throw error(502, message);
	}
};
