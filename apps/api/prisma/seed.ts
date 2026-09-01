import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.scanLog.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.upsert({
    where: { qrId: 'USR-8921' },
    update: {},
    create: {
      name: 'Budi Santoso',
      role: UserRole.WARGA,
      qrId: 'USR-8921',
      balance: 12500,
    },
  });

  await prisma.user.upsert({
    where: { qrId: 'WRG-0001' },
    update: {},
    create: {
      name: 'Warung Bu Tejo',
      role: UserRole.WARUNG,
      qrId: 'WRG-0001',
      balance: 0,
    },
  });

  console.log('✅ Seeding berhasil diselesaikan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
