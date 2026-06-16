# VidSaaS — Video Downloader SaaS Platform

A production-oriented **Next.js SaaS starter** for a multi-platform video/audio downloader API powered by **yt-dlp + FFmpeg**. It includes a clean white Apple-like UI, 3D animation hooks, a public no-key website downloader, free 24-hour developer API keys, usage analytics, exactly 3 ad slots, Docker deployment, and DigitalPlat FreeDomain guidance.

> Compliance: run this only for content the user owns, created, licensed, or is authorized to download. Do not use it to bypass DRM, paywalls, access controls, logins, or platform restrictions.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Three.js lazy-loaded 3D hero icon
- Zustand + localStorage persistence
- Prisma + SQLite for free Render deployment
- yt-dlp + FFmpeg via Node child process
- Docker / docker-compose

## Features implemented

- Landing page with pure white background and blue/purple soft gradients
- 3D floating download icon, tilt cards, pulsing button, 3D spinner, flip API-key reveal
- Mobile-first responsive SPA-like UX with persisted URL/API key state
- Exactly 3 ad slots: top 728x90, in-content 300x250, footer 728x90
- No payment system and no paid plans
- Public website downloader uses `/api/public/*` and requires no API key
- Developer API key creation, hashing, 24-hour expiry, revoke
- Daily/monthly/total usage tracking for developer API keys
- Unlimited requests for the active 24-hour developer key
- yt-dlp info and streaming download/audio endpoints
- Supported sites endpoint using `yt-dlp --list-extractors`
- Webhook sender helper for usage events

## API endpoints

Base URL:

```txt
https://your-domain.com/api/v1
```

Authentication for developer API:

```txt
X-API-Key: your_api_key
```

Public website endpoints do not require a key:

```txt
/api/public/info?url=URL
/api/public/download?url=URL
/api/public/download/audio?url=URL
```

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/download?url=VIDEO_URL` | Developer API: download video |
| GET | `/download/audio?url=URL` | Developer API: download audio only |
| GET | `/info?url=URL` | Developer API: get video metadata |
| GET | `/usage` | Check API key usage |
| POST | `/api-keys/generate` | Generate API key |
| DELETE | `/api-keys/:id/revoke` | Revoke API key |
| GET | `/supported-sites` | List supported platforms |

## Local development

### 1) Install requirements

- Node.js 20+
- Docker Desktop optional
- Python 3 + `yt-dlp`
- FFmpeg

macOS:

```bash
brew install ffmpeg python
pip3 install yt-dlp
```

Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg python3 python3-pip
pip3 install yt-dlp
```

### 2) Configure environment

```bash
cp .env.example .env
# Edit API_KEY_PEPPER and ADMIN_SECRET before production.
```

### 3) Install and run

```bash
npm install
DATABASE_URL=file:./dev.db npm run db:push
DATABASE_URL=file:./dev.db npm run db:seed
DATABASE_URL=file:./dev.db npm run dev
```

Open `http://localhost:3000`.

## Docker production-style run

```bash
cp .env.example .env
docker compose up --build
```

The `Dockerfile` installs FFmpeg and yt-dlp. This is recommended over serverless hosting because downloads need long-lived processes and streaming. The free Render deployment uses SQLite at `file:/app/prisma/prod.db`; use external Postgres later if you need durable data across restarts.

## DigitalPlat FreeDomain setup

The user requested `.dpdns.org` or `.qzz.io` using DigitalPlat FreeDomain:

Repo: <https://github.com/DigitalPlatDev/FreeDomain>
Dashboard: <https://dash.domain.digitalplat.org/>

General flow:

1. Create a DigitalPlat FreeDomain account from the dashboard.
2. Choose an available subdomain, e.g. `yourbrand.dpdns.org` or `yourbrand.qzz.io`.
3. Configure DNS hosting/nameservers as described in the repository tutorials. Cloudflare is commonly recommended for beginners.
4. Point DNS to your VPS/load balancer using `A`, `AAAA`, or `CNAME`.
5. After DNS propagation, set:

```env
NEXT_PUBLIC_APP_URL=https://yourbrand.dpdns.org
PUBLIC_DOMAIN=yourbrand.dpdns.org
```

## Production deployment checklist

- [ ] Set `ALLOW_DEMO_AUTH=false`
- [ ] Replace demo email auth with Auth.js, Clerk, Supabase Auth, or custom sessions if you want real user accounts
- [ ] Use a strong `API_KEY_PEPPER` and rotate carefully
- [ ] Deploy on VPS/Kubernetes/Fly/Render/Railway with FFmpeg + yt-dlp available
- [ ] Add Redis/BullMQ if you want true queued background downloads
- [ ] Add object storage for generated files if you do not want direct streaming
- [ ] Add abuse prevention: CAPTCHA for free key generation, WAF, request logging, legal review
- [ ] Add Terms, Privacy, Copyright/DMCA pages
- [ ] Monitor `yt-dlp` updates and platform extractor breakages

## Notes on large downloads

The browser UI fetches downloads with headers and saves a Blob. For very large files, use a signed one-time download URL or queue + object storage to avoid browser memory pressure.

## Important environment variables

```env
DATABASE_URL=file:/app/prisma/prod.db
API_KEY_PEPPER=...
ALLOW_DEMO_AUTH=false
ADMIN_SECRET=...
YTDLP_BIN=yt-dlp
FFMPEG_BIN=ffmpeg
YTDLP_TIMEOUT_MS=60000
YTDLP_MAX_FILESIZE=2G
NEXT_PUBLIC_APP_URL=https://your-domain.com
```
