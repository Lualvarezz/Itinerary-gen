import { prisma } from '../lib/prisma.js';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: { id?: string; fullName: string; email: string; passwordHash: string; role: string }) {
    return prisma.user.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
      },
    });
  }
}
