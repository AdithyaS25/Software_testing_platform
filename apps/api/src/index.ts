import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "./utils/password";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signAccessToken, signRefreshToken } from "./utils/jwt";

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

/* =======================
   AUTH: REGISTER
   ======================= */
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

/* =======================
   AUTH: LOGIN (FR-AUTH-002)
   ======================= */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Do not reveal whether email or password is wrong
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Account lock check (5 attempts → 15 min lock)
  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(423).json({
      message: "Account locked. Try again later.",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  // Wrong password
  if (!isPasswordValid) {
    const attempts = user.failedLoginAttempts + 1;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockUntil:
          attempts >= 5
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null,
      },
    });

    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Successful login → reset counters
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
    },
  });

  // Issue JWTs
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
  });

  // Store hashed refresh token (for session management)
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  return res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
