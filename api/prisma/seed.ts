import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  console.log(process.env.DATABASE_URL, 'DATABASE_URL');
  const Role = [
    {
      id: 'role_admin',
      name: 'superAdmin',
      description: 'Acceso completo al sistema',
    },
    {
      id: 'role_admin_restaurant',
      name: 'adminRestaurant',
      description: 'Administrador del bar',
    },
    { id: 'role_waiter', name: 'waiter', description: 'Camarero / Mesero' },
    { id: 'role_cook', name: 'cook', description: 'Cocinero / Chef' },
  ];
  for (const role of Role) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }
  console.log('Roles seeded');

  const hasshedPassword = await bcrypt.hash('admin123', 10);
  const SuperAdmin = await prisma.user.upsert({
    where: { email: 'admin@b2b.com' },
    update: {},
    create: {
      isSuperAdmin: true,
      name: 'Admin',
      email: 'admin@b2b.com',
      password: hasshedPassword,
      roleId: 'role_admin',
      tenantId: null, // Soy administrador, no necesito un tenantId
      isActived: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
