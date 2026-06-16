import { json } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  return json({ ok: true, service: 'video-downloader-saas', time: new Date().toISOString() });
}
