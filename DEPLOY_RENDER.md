# Render live deployment for VideoDL

Target domain selected by user: **https://videodl.qzz.io**

Temporary Render URL after deploy is expected to be:

```txt
https://videodl-qzz.onrender.com
```

## Current setup

- Render Docker web service
- SQLite database file inside the container: `file:/app/prisma/prod.db`
- No separate Postgres service required
- Free 24h unlimited API keys
- Exactly 3 ad slots

> Note: Render free instances can restart/sleep. Because this free deployment uses SQLite inside the container, generated API keys can reset after a redeploy/restart. For a durable production database, connect an external Postgres later.

## Deployment already prepared

The repo includes:

- `render.yaml`
- `Dockerfile`
- `.dockerignore`

## DNS for `videodl.qzz.io`

After Render service is live:

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

4. In Render service → Settings → Custom Domains, add:

```txt
videodl.qzz.io
```

Final live URL:

```txt
https://videodl.qzz.io
```
