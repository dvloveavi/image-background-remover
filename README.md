# RemoveBG

A simple, fast image background remover website built with Next.js and Tailwind CSS.

## Features

- Drag and drop image upload
- One-click background removal
- Download results as PNG
- Mobile responsive
- No image storage required

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **API**: Cloudflare Worker
- **Image Processing**: Remove.bg API

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add your Remove.bg API key:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Frontend (Cloudflare Pages)

1. Connect your GitHub repository to Cloudflare Pages
2. Set the build command: `npm run build`
3. Set the output directory: `.next`
4. Add environment variable: `REMOVE_BG_API_KEY`

### API (Cloudflare Worker)

1. Deploy the worker:
   ```bash
   cd worker
   npx wrangler deploy
   ```
2. Set your API key:
   ```bash
   wrangler secret put REMOVE_BG_API_KEY
   ```
3. Update the frontend API URL to point to your worker

## Get Your Remove.bg API Key

Sign up at [https://www.remove.bg/api](https://www.remove.bg/api) to get your API key.

## License

MIT
