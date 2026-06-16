import { z } from 'zod';
import { errorJson, json } from '@/lib/http';
import { normalizeAndValidateUrl } from '@/lib/security';
import { getTeraboxInfo, isTeraboxUrl } from '@/lib/terabox';
import { getVideoInfo } from '@/lib/ytdlp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({ url: z.string().min(8) });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { url } = querySchema.parse({ url: searchParams.get('url') || '' });
    const normalizedUrl = normalizeAndValidateUrl(url);
    const info = isTeraboxUrl(normalizedUrl) ? await getTeraboxInfo(normalizedUrl) : await getVideoInfo(normalizedUrl);

    return json({
      data: info,
      note: 'Public website endpoint: no API key required. Developer API remains available at /api/v1 with X-API-Key.'
    });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? ((error as { status: number }).status) : 400;
    return errorJson((error as Error).message || 'Unable to fetch video info.', status);
  }
}
