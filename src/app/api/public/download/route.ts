import { z } from 'zod';
import { Readable } from 'node:stream';
import { errorJson } from '@/lib/http';
import { normalizeAndValidateUrl } from '@/lib/security';
import { createTeraboxResponse, isTeraboxUrl } from '@/lib/terabox';
import { safeFilename, streamDownload } from '@/lib/ytdlp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  url: z.string().min(8),
  format: z.string().max(80).optional()
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { url, format } = querySchema.parse({
      url: searchParams.get('url') || '',
      format: searchParams.get('format') || undefined
    });
    const normalizedUrl = normalizeAndValidateUrl(url);

    if (isTeraboxUrl(normalizedUrl)) {
      return await createTeraboxResponse(normalizedUrl, 'video');
    }

    const { stream, process, ready, contentType, extension } = streamDownload(normalizedUrl, 'video', format);
    request.signal.addEventListener('abort', () => process.kill('SIGTERM'));
    await ready;

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
