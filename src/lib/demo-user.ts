import { prisma } from './prisma';
import { getPlanPeriodEnd, type PlanId } from './plans';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function resolveDemoUser(email: string, desiredPlan: PlanId = 'FREE', request: Request) {
  const allowDemoAuth = process.env.ALLOW_DEMO_AUTH !== 'false';
  const adminSecret = process.env.ADMIN_SECRET;
  const providedAdminSecret = request.headers.get('x-admin-secret');
  const isAdmin = Boolean(adminSecret && providedAdminSecret && providedAdminSecret === adminSecret);

  if (!emailRegex.test(email)) {
    throw Object.assign(new Error('A valid email is required.'), { status: 400 });
  }

  if (!allowDemoAuth && !isAdmin) {
    throw Object.assign(new Error('Dashboard auth is disabled. Integrate your auth provider or use X-Admin-Secret.'), { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { email: email.toLowerCase() }
  });

  const existingActive = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }]
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!existingActive) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: desiredPlan,
        status: 'ACTIVE',
        currentPeriodEnd: getPlanPeriodEnd(desiredPlan)
      }
    });
  }

  return user;
}
