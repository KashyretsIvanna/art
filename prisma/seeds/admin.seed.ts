import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

export default async function adminSeed() {
  const hashedPassword = await hash('Pa$$w0rd', 10);

  await prisma.user.upsert({
    where: {
      email: 'tessa2234gasd@gmail.com',
    },
    create: {
      name: 'Test Admin',
      email: 'tessa2234gasd@gmail.com',
      password: hashedPassword,
      isEmailVerified: true,
      role: Role.ADMIN,
    },
    update: {
      name: 'Test Admin',
    },
  });
}
