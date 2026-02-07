export type Participant = {
	name: string;
	initials: string;
	color: string;
	engagement: number;
	sentiment: 'Positive' | 'Neutral' | 'Mixed' | 'Negative';
	emotions: string[];
};

export type KeyMoment = {
	time: string;
	timeSeconds: number;
	type: 'slide' | 'reaction' | 'chart' | 'decision' | 'action';
	description: string;
	emotionalValue: number;
	emotion: string;
};

export type SummaryTopic = {
	title: string;
	points: string[];
};

export type AnalysisResult = {
	title: string;
	participants: Participant[];
	keyMoments: KeyMoment[];
	summary: SummaryTopic[];
	topEmotions: { name: string; count: number }[];
	meetingDuration: number;
};

export type ChatMessage = {
	role: 'user' | 'model';
	text: string;
};

export type VideoSource =
	| { type: 'youtube'; url: string }
	| { type: 'file'; fileUri: string; mimeType: string };
