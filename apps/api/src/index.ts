import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const app = express();
const PORT = 4000;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "API running" });
});

app.get("/db-check", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json({ ok: true, users });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
