import { authenticateApiKey, assertWithinRateLimit, getUtcDay } from '@/lib/api-keys';
import { errorJson, json } from '@/lib/http';
import { getPlan } from '@/lib/plans';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const apiKey = await authenticateApiKey(request);
    const rate = await assertWithinRateLimit(apiKey);
    const today = getUtcDay();
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

    const [daily, monthly, total] = await Promise.all([
      prisma.usage.findMany({ where: { apiKeyId: apiKey.id, date: today }, orderBy: { endpoint: 'asc' } }),
      prisma.usage.aggregate({ where: { apiKeyId: apiKey.id, date: { gte: monthStart } }, _sum: { count: true, bytes: true } }),
      prisma.usage.aggregate({ where: { apiKeyId: apiKey.id }, _sum: { count: true, bytes: true } })
    ]);

    const subscription = apiKey.user.subscriptions[0];
    const plan = getPlan(subscription?.plan || 'FREE');

    return json({
      data: {
        apiKey: { id: apiKey.id, name: apiKey.name, prefix: apiKey.keyPrefix, lastFour: apiKey.keyLastFour, expiresAt: apiKey.expiresAt },
        plan,
        today: {
          date: today,
          used: rate.usedToday,
          remaining: rate.remaining,
          byEndpoint: daily.map((row) => ({ endpoint: row.endpoint, count: row.count, bytes: row.bytes.toString() }))
        },
        month: { requests: monthly._sum.count || 0, bytes: (monthly._sum.bytes || BigInt(0)).toString() },
        total: { requests: total._sum.count || 0, bytes: (total._sum.bytes || BigInt(0)).toString() }
      }
    });
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? ((error as { status: number }).status) : 400;
    return errorJson((error as Error).message || 'Unable to fetch usage.', status);
  }
}
