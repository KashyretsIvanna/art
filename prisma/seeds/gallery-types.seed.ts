import { Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import {
  APPLICATION_SETTINGS,
  ART_CLASSIFICATIONS,
  ART_ORIENTATION,
  GALLERY_TYPES,
  PLANS,
  PREMIUM_PLAN_LIMITS,
  STANDARD_PLAN_LIMITS,
} from '../collections';

export default async function seedFunction(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never>
) {
  try {
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        GALLERY_TYPES.map((item) =>
          tx.galleryTypes.upsert({
            where: { typeName: item.typeName },
            update: item,
            create: item,
          })
        )
      );

      await Promise.all(
        ART_CLASSIFICATIONS.map((item) =>
          tx.classifications.upsert({
            where: { classificationName: item.classificationName },
            update: item,
            create: item,
          })
        )
      );

      await Promise.all(
        ART_ORIENTATION.map((item) =>
          tx.artOrientations.upsert({
            where: { orientationName: item.orientationName },
            update: item,
            create: item,
          })
        )
      );

      await tx.applicationSettings.upsert({
        where: { id: APPLICATION_SETTINGS.id },
        update: APPLICATION_SETTINGS,
        create: APPLICATION_SETTINGS,
      });

      await Promise.all(
        PLANS.map((item) =>
          tx.premiumPlan.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          })
        )
      );

      await Promise.all(
        [...PREMIUM_PLAN_LIMITS, ...STANDARD_PLAN_LIMITS].map((item) =>
          tx.planLimits.upsert({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              name_planId: {
                name: item.name,
                planId: item.planId,
              },
            },
            update: item,
            create: item,
          })
        )
      );
    });
  } catch (error) {
    Logger.error('Error occurred during seeding gallery types', error);
  }
}
