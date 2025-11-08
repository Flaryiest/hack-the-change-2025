import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');

  try {
    // Clear existing data
    await prisma.user.deleteMany();
    console.log('Cleared existing users');

    // Create sample users
    const user1 = await prisma.user.create({
      data: {
        name: 'Alice Johnson',
        location: 'Calgary, AB',
        coordinates: '51.0447,-114.0719',
        facts: ['Loves hiking', 'Software developer', 'Coffee enthusiast']
      }
    });
    console.log('Created user:', user1);

    const user2 = await prisma.user.create({
      data: {
        name: 'Bob Smith',
        location: 'Toronto, ON',
        coordinates: '43.6532,-79.3832',
        facts: ['Tech entrepreneur', 'Marathon runner', 'Foodie']
      }
    });
    console.log('Created user:', user2);

    const user3 = await prisma.user.create({
      data: {
        name: 'Charlie Davis',
        facts: ['Student', 'Gamer', 'Music lover']
      }
    });
    console.log('Created user:', user3);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
