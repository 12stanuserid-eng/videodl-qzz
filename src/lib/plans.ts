export type PlanId = 'FREE';

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  billing: string;
  validityHours: number;
  requestsPerDay: 'unlimited';
  maxApiKeys: number;
  ads: boolean;
  sla: boolean;
  features: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: 'FREE',
    name: 'Free Unlimited',
    price: '₹0',
    billing: '24 hours',
    validityHours: 24,
    requestsPerDay: 'unlimited',
    maxApiKeys: 1,
    ads: true,
    sla: false,
    features: [
      'Unlimited requests for 1 day',
      '1 free API key at a time',
      'Video + audio downloads',
      'Ad-supported platform — no payment required'
    ]
  }
};

export function getPlan(plan?: string | null): Plan {
  if (plan && plan !== 'FREE') return PLANS.FREE;
  return PLANS.FREE;
}

export function getPlanPeriodEnd(plan: PlanId = 'FREE', from = new Date()): Date {
  if (plan !== 'FREE') throw new Error('Only the free 24-hour plan is available.');
  const date = new Date(from);
  date.setHours(date.getHours() + PLANS.FREE.validityHours);
  return date;
}
