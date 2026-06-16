# Render live deployment for VideoDL

Target domain selected by user: **https://videodl.qzz.io**

Temporary Render URL after deploy is expected to be similar to:

```txt
https://videodl-qzz.onrender.com
```

> I cannot create the live Render/DigitalPlat domain from this sandbox without your account access. These files make the project ready for one-click Render deployment.

## What you need

1. GitHub account
2. Render account
3. Free PostgreSQL URL from Neon/Supabase/other Postgres provider
4. DigitalPlat FreeDomain account for `videodl.qzz.io`

## Step 1 — Create free PostgreSQL

Use Neon or Supabase and copy the Postgres connection string.

It should look like:

```txt
postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
```

## Step 2 — Push project to GitHub

```bash
git init
git add .
git commit -m "Deploy VideoDL free downloader"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/videodl-qzz.git
git push -u origin main
```

## Step 3 — Deploy on Render

1. Open Render Dashboard.
2. Click **New → Blueprint**.
3. Connect the GitHub repo.
4. Render will read `render.yaml`.
5. When asked for `DATABASE_URL`, paste your Neon/Supabase Postgres URL.
6. Deploy.

Render will build the Dockerfile, install FFmpeg + yt-dlp, run Prisma schema push, and start Next.js.

## Step 4 — Test Render URL

Open:

```txt
https://videodl-qzz.onrender.com/api/v1/health
```

Expected:

```json
{"ok":true,"service":"video-downloader-saas"}
```

## Step 5 — Connect `videodl.qzz.io`

1. Open DigitalPlat FreeDomain dashboard.
2. Register/select `videodl.qzz.io`.
3. Add DNS record:

```txt
Type: CNAME
Name: videodl
Target: videodl-qzz.onrender.com
```

If DigitalPlat asks for full host, use:

```txt
videodl.qzz.io
```

4. In Render service → **Settings → Custom Domains**, add:

```txt
videodl.qzz.io
```

5. Wait for DNS/SSL propagation.

Final live URL:

```txt
https://videodl.qzz.io
```

## Important

`ALLOW_DEMO_AUTH=true` is enabled because this app is free/no-payment and users can generate 24h API keys with email. For serious public traffic, add CAPTCHA/WAF/rate-limit key generation to stop abuse.
