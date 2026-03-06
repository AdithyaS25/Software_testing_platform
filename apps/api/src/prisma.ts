import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error'],
  datasourceUrl: process.env.DATABASE_URL!,
});

// Retry connection for Neon cold starts
async function connectWithRetry(retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
      return;
    } catch (err) {
      console.log(
        `⏳ DB connection attempt ${i + 1}/${retries} failed, retrying in ${delay / 1000}s...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  console.error('❌ Could not connect to database after retries');
}

connectWithRetry();
