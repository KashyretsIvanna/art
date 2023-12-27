import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class HandleProfileErrorHelper {
  handleProfileClassificationsError(err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const errorMessage = err.message.toLowerCase();

      if (err.code === 'P2003') {
        switch (true) {
          case errorMessage.includes('type'):
            throw new BadRequestException('Unknown gallery type');
          case errorMessage.includes('orientation'):
            throw new BadRequestException('Unknown orientation type');
          case errorMessage.includes('classification'):
            throw new BadRequestException('Unknown orientation type');
        }
      }
    }
  }
}
