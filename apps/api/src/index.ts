import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "./utils/password";

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

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
  });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
