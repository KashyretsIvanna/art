import fs from 'fs';
import path from 'path';

import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seedFilesPath = path.join(__dirname + '/seeds');
  const seedFiles = fs
    .readdirSync(seedFilesPath)
    .filter((file: string) => file.endsWith('.seed.ts'));
  for (const seedFile of seedFiles) {
    const seedFilePath = path.join(seedFilesPath, seedFile);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: seedFunction } = require(seedFilePath);
    await seedFunction(prisma);
  }

  Logger.debug('Seeding completed successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    Logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
