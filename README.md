# Granola Visual Cues

AI-powered meeting analysis that extracts visual cues, emotions, and key moments from video recordings. Paste a YouTube link and get a Granola-style meeting document with participant alignment scores, an emotional journey chart, timestamped summary with inline evidence badges, and an AI chat to ask follow-up questions about what happened.

## What it does

- **Participant analysis** — identifies speakers by name, scores their alignment with meeting goals, and detects sentiment and emotions
- **Summary with visual evidence** — organizes discussion into topics with inline badges linking to slides, charts, and decisions shown on screen
- **Emotional journey chart** — plots the meeting's emotional arc over time with emoji markers and clickable timestamps
- **Key moments timeline** — color-coded bar showing where important moments and decisions occurred
- **AI chat** — ask follow-up questions about anything in the video (slides, reactions, body language, decisions)

## Try it

Paste one of these YouTube meeting recordings to see it in action:

1. [Granola Design Interview](https://www.youtube.com/watch?v=i38vvqAca8M) — a product design discussion
2. [GitLab Product Marketing Meeting](https://www.youtube.com/watch?v=lBVtvOpU80Q) — a team sync on product marketing

## Setup

Requires a [Google Gemini API key](https://aistudio.google.com/apikey). Add it to `.dev.vars` for local development:

```
GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
```

## Developing

```sh
npm install
npm run dev
```

## Building

```sh
npm run build
```

Built with SvelteKit, deployed on Cloudflare Workers. Uses Gemini 2.5 Flash for video analysis.
