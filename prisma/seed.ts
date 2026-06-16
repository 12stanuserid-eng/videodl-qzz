import { prisma } from '../src/lib/prisma';
import { createApiKeyForUser } from '../src/lib/api-keys';

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', name: 'Demo User' }
  });

  const existing = await prisma.apiKey.count({ where: { userId: user.id, status: 'ACTIVE' } });
  if (existing === 0) {
    const { rawKey } = await createApiKeyForUser(user.id, 'Demo key', 'FREE');
    console.log(`Demo API key: ${rawKey}`);
  } else {
    console.log('Demo user already has an active key.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
