import { z } from 'zod';
import { createApiKeyForUser, serializeApiKey } from '@/lib/api-keys';
import { resolveDemoUser } from '@/lib/demo-user';
import { errorJson, json } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(60).default('Free 24h key'),
  plan: z.literal('FREE').optional().default('FREE')
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const user = await resolveDemoUser(body.email, 'FREE', request);
    const { rawKey, apiKey, plan, subscription } = await createApiKeyForUser(user.id, body.name, 'FREE');

    return json(
      {
        data: {
          key: rawKey,
          apiKey: serializeApiKey(apiKey),
          plan,
          subscription: {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd
          },
          warning: 'Free unlimited key is valid for 24 hours. Store it now — raw API keys are shown only once.'
        }
      },
      { status: 201 }
    );
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? ((error as { status: number }).status) : 400;
    return errorJson((error as Error).message || 'Unable to generate API key.', status);
  }
}
