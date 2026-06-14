const { PrismaClient } = require('@prisma/client');
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@storerating.com' },
    update: {},
    create: {
      name: 'System Administrator Account',
      email: 'admin@storerating.com',
      address: '123 Admin Street, Admin City, Admin State 400001',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Seed complete. Admin created:', admin.email);
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
