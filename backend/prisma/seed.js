import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing tables (due to cascade delete, deleting users will delete tasks)
  await prisma.user.deleteMany({});
  console.log('Cleared existing users and tasks.');

  // Create hashed passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log('Admin user created:', admin.email);

  // 2. Create Regular User
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER'
    }
  });
  console.log('Regular user created:', user.email);

  // 3. Create Tasks for Admin
  await prisma.task.createMany({
    data: [
      {
        title: 'Review System Logs',
        description: 'Verify performance of backend API routers and check error.log metrics.',
        status: 'PENDING',
        priority: 'HIGH',
        userId: admin.id
      },
      {
        title: 'Configure Production CORS',
        description: 'Update client host allowed origins from local to CDN subdomain.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        userId: admin.id
      }
    ]
  });
  console.log('Admin tasks seeded.');

  // 4. Create Tasks for Regular User
  await prisma.task.createMany({
    data: [
      {
        title: 'Prepare Internship Report',
        description: 'Compile API documentation, db schema overview, and frontend architecture notes.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: user.id
      },
      {
        title: 'Design UI Layout mockups',
        description: 'Create glassmorphic forms and responsive sidebar transitions for desktop dashboard.',
        status: 'COMPLETED',
        priority: 'LOW',
        userId: user.id
      },
      {
        title: 'Refactor Auth Route validation',
        description: 'Add Zod string email validation constraint and error response formatting.',
        status: 'PENDING',
        priority: 'MEDIUM',
        userId: user.id
      }
    ]
  });
  console.log('User tasks seeded.');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
