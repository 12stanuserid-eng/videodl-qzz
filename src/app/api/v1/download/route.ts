import { z } from 'zod';
import { Readable } from 'node:stream';
import { authenticateApiKey, assertWithinRateLimit, incrementUsage } from '@/lib/api-keys';
import { errorJson } from '@/lib/http';
import { normalizeAndValidateUrl } from '@/lib/security';
import { createTeraboxResponse, isTeraboxUrl } from '@/lib/terabox';
import { safeFilename, streamDownload } from '@/lib/ytdlp';
import { sendUsageWebhooks } from '@/lib/webhooks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  url: z.string().min(8),
  format: z.string().max(80).optional()
});

export async function GET(request: Request) {
  try {
    const apiKey = await authenticateApiKey(request);
    await assertWithinRateLimit(apiKey);

    const { searchParams } = new URL(request.url);
    const { url, format } = querySchema.parse({
      url: searchParams.get('url') || '',
      format: searchParams.get('format') || undefined
    });
    const normalizedUrl = normalizeAndValidateUrl(url);

    if (isTeraboxUrl(normalizedUrl)) {
      const response = await createTeraboxResponse(normalizedUrl, 'video');
      await incrementUsage(apiKey.id, '/download');
      sendUsageWebhooks(apiKey.userId, { event: 'usage.download', apiKeyId: apiKey.id, endpoint: '/download' }).catch(() => undefined);
      return response;
    }

    const { stream, process, ready, contentType, extension } = streamDownload(normalizedUrl, 'video', format);
    request.signal.addEventListener('abort', () => process.kill('SIGTERM'));
    await ready;

    await incrementUsage(apiKey.id, '/download');
    sendUsageWebhooks(apiKey.userId, { event: 'usage.download', apiKeyId: apiKey.id, endpoint: '/download' }).catch(() => undefined);

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename('video', extension)}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? ((error as { status: number }).status) : 400;
    return errorJson((error as Error).message || 'Unable to download video.', status);
  }
}
