import { z } from 'zod';
import { authenticateApiKey, assertWithinRateLimit, incrementUsage } from '@/lib/api-keys';
import { errorJson, json } from '@/lib/http';
import { normalizeAndValidateUrl } from '@/lib/security';
import { getVideoInfo } from '@/lib/ytdlp';
import { sendUsageWebhooks } from '@/lib/webhooks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({ url: z.string().min(8) });

export async function GET(request: Request) {
  try {
    const apiKey = await authenticateApiKey(request);
    await assertWithinRateLimit(apiKey);

    const { searchParams } = new URL(request.url);
    const { url } = querySchema.parse({ url: searchParams.get('url') || '' });
    const normalizedUrl = normalizeAndValidateUrl(url);

    const info = await getVideoInfo(normalizedUrl);
    await incrementUsage(apiKey.id, '/info');
    sendUsageWebhooks(apiKey.userId, { event: 'usage.info', apiKeyId: apiKey.id, endpoint: '/info' }).catch(() => undefined);

    return json({ data: info });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? ((error as { status: number }).status) : 400;
    return errorJson((error as Error).message || 'Unable to fetch video info.', status);
  }
}
