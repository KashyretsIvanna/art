import { PatchAdminReq } from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { hash } from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllAdmins(page: number, take: number) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      skip: (page - 1) * take,
      take,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const totalAdmins = await this.prisma.user.count({
      where: { role: 'ADMIN' },
    });

    return { admins, pages: Math.ceil(totalAdmins / take) };
  }

  async patchAdmin(id: number, patchAdminData: PatchAdminReq) {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate || userToUpdate.role !== Role.ADMIN) {
      throw new BadRequestException("User doesn't exists or isn't admin");
    }

    const hashedPassword = await hash(patchAdminData.password, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async deleteAdmin(id: number) {
    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (!userToDelete || userToDelete.role !== Role.ADMIN) {
      throw new BadRequestException("User doesn't exists or isn't admin");
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
