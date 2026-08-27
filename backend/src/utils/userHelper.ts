import { prisma } from '../lib/prisma.js';

export async function getValidUserId(requestedUserId?: string): Promise<string> {
  if (requestedUserId && requestedUserId !== 'system') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: requestedUserId },
      });
      if (user) return user.id;
    } catch {
      // ignore
    }
  }

  // Fallback to first existing user
  const firstUser = await prisma.user.findFirst();
  if (firstUser) return firstUser.id;

  // If no user exists, create a default admin user
  const defaultUser = await prisma.user.create({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Carmen Alvarez',
      email: 'carmenalvarezmar@gmail.com',
      passwordHash: '$2a$10$QYlnm7o0Ae58W6SgS2dJx.6wC6D5J0dqF4yq4iVYB3M5szwWnQ6s2',
      role: 'admin',
      status: 'active',
    },
  });

  return defaultUser.id;
}
