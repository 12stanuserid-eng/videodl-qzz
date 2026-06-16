import { errorJson, json } from '@/lib/http';
import { listSupportedSites } from '@/lib/ytdlp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sites = await listSupportedSites();
    return json({ data: { count: sites.length, sites } }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
  } catch (error) {
    return errorJson((error as Error).message || 'Unable to list supported sites.', 500);
  }
}
