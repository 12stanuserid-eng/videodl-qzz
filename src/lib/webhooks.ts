import crypto from 'node:crypto';
import { prisma } from './prisma';

export async function sendUsageWebhooks(userId: string, payload: Record<string, unknown>) {
  const webhooks = await prisma.webhook.findMany({ where: { userId, active: true } });
  await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const body = JSON.stringify({ ...payload, sentAt: new Date().toISOString() });
      const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VidSaaS-Signature': signature
        },
        body,
        signal: AbortSignal.timeout(5000)
      });
    })
  );
}
