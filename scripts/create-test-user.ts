import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createTestUser(): Promise<void> {
  const email = 'rakib.7896@gmail.com';
  const password = 'Abc12345';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('Test user already exists');
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: existing.id },
      data: { emailVerified: true, passwordHash: hash },
    });
    console.log('✅ User updated - password reset and email verified');
  } else {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        emailVerified: true,
        name: 'Test User',
      },
    });
    console.log('✅ Test user created with emailVerified: true');
  }

  await prisma.$disconnect();
}

createTestUser().catch(console.error);
