import crypto from 'node:crypto';
import type { ApiKey, Subscription, User } from '@prisma/client';
import { prisma } from './prisma';
import { getPlan, getPlanPeriodEnd, type PlanId } from './plans';

export type AuthenticatedApiKey = ApiKey & {
  user: User & { subscriptions: Subscription[] };
};

function pepper(): string {
  const value = process.env.API_KEY_PEPPER;
  if (!value || value === 'replace-with-a-long-random-secret') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_KEY_PEPPER must be configured in production.');
    }
    return 'development-pepper-only';
  }
  return value;
}

export function generateRawApiKey(): string {
  return `vdl_live_${crypto.randomBytes(28).toString('base64url')}`;
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHmac('sha256', pepper()).update(rawKey).digest('hex');
}

export function maskApiKey(rawKey: string): string {
  return `${rawKey.slice(0, 12)}••••••••••••${rawKey.slice(-4)}`;
}

export function getUtcDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const now = new Date();
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }]
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function ensureSubscription(userId: string, desiredPlan: PlanId = 'FREE'): Promise<Subscription> {
  const existing = await getActiveSubscription(userId);
  if (existing) return existing;

  return prisma.subscription.create({
    data: {
      userId,
      plan: desiredPlan,
      status: 'ACTIVE',
      currentPeriodEnd: getPlanPeriodEnd(desiredPlan)
    }
  });
}

export async function createApiKeyForUser(userId: string, name: string, desiredPlan: PlanId = 'FREE') {
  const subscription = await ensureSubscription(userId, desiredPlan);
  const plan = getPlan(subscription.plan as PlanId);

  const activeKeyCount = await prisma.apiKey.count({
    where: {
      userId,
      status: 'ACTIVE',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    }
  });

  if (activeKeyCount >= plan.maxApiKeys) {
    throw new Error(`Your ${plan.name} plan allows ${plan.maxApiKeys} active API key(s).`);
  }

  const rawKey = generateRawApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash: hashApiKey(rawKey),
      keyPrefix: rawKey.slice(0, 12),
      keyLastFour: rawKey.slice(-4),
      expiresAt: subscription.currentPeriodEnd
    }
  });

  return { rawKey, apiKey, subscription, plan };
}

export async function authenticateApiKey(request: Request): Promise<AuthenticatedApiKey> {
  const rawKey = request.headers.get('x-api-key')?.trim();
  if (!rawKey) {
    throw Object.assign(new Error('Missing X-API-Key header.'), { status: 401 });
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(rawKey) },
    include: {
      user: {
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  if (!apiKey || apiKey.status !== 'ACTIVE') {
    throw Object.assign(new Error('Invalid or revoked API key.'), { status: 401 });
  }

  if (apiKey.expiresAt && apiKey.expiresAt <= new Date()) {
    await prisma.apiKey.update({ where: { id: apiKey.id }, data: { status: 'EXPIRED' } });
    throw Object.assign(new Error('API key has expired.'), { status: 401 });
  }

  const subscription = apiKey.user.subscriptions[0] || (await ensureSubscription(apiKey.userId, 'FREE'));
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd <= new Date()) {
    throw Object.assign(new Error('Plan has expired. Please renew your subscription.'), { status: 402 });
  }

  return apiKey as AuthenticatedApiKey;
}

export async function assertWithinRateLimit(apiKey: AuthenticatedApiKey) {
  const subscription = apiKey.user.subscriptions[0] || (await ensureSubscription(apiKey.userId, 'FREE'));
  const plan = getPlan(subscription.plan);
  const today = getUtcDay();
  const aggregate = await prisma.usage.aggregate({
    where: { apiKeyId: apiKey.id, date: today },
    _sum: { count: true }
  });
  const usedToday = aggregate._sum.count || 0;

  return { allowed: true, plan, usedToday, remaining: 'unlimited' as const };
}

export async function incrementUsage(apiKeyId: string, endpoint: string, bytes = 0) {
  const today = getUtcDay();
  return prisma.usage.upsert({
    where: { apiKeyId_endpoint_date: { apiKeyId, endpoint, date: today } },
    update: { count: { increment: 1 }, bytes: { increment: BigInt(bytes) } },
    create: { apiKeyId, endpoint, date: today, count: 1, bytes: BigInt(bytes) }
  });
}

export function serializeApiKey(apiKey: ApiKey) {
  return {
    id: apiKey.id,
    name: apiKey.name,
    prefix: apiKey.keyPrefix,
    lastFour: apiKey.keyLastFour,
    status: apiKey.status,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
    revokedAt: apiKey.revokedAt
  };
}
