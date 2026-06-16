import { authenticateApiKey, serializeApiKey } from '@/lib/api-keys';
import { errorJson, json } from '@/lib/http';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const apiKey = await authenticateApiKey(request);
    const target = await prisma.apiKey.findUnique({ where: { id } });

    if (!target || target.userId !== apiKey.userId) {
      return errorJson('API key not found for this account.', 404);
    }

    const revoked = await prisma.apiKey.update({
      where: { id },
      data: { status: 'REVOKED', revokedAt: new Date() }
    });

    return json({ data: serializeApiKey(revoked) });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? ((error as { status: number }).status) : 400;
    return errorJson((error as Error).message || 'Unable to revoke API key.', status);
  }
}
