import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "./prisma";

import { hashPassword } from "./utils/password";
import { signAccessToken, signRefreshToken } from "./utils/jwt";

import authRoutes from "./auth/auth.route";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 4000;

/* =======================
   MIDDLEWARE
   ======================= */
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

/* =======================
   HEALTH CHECKS
   ======================= */
app.get("/health", (_req, res) => {
  res.json({ status: "API running" });
});

app.get("/db-check", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json({ ok: true, users });
});

/* =======================
   AUTH: REGISTER (FR-AUTH-001)
   ======================= */
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};

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

  return res.status(201).json({
    id: user.id,
    email: user.email,
  });
});

/* =======================
   AUTH: LOGIN (FR-AUTH-002)
   ======================= */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(423).json({
      message: "Account locked. Try again later.",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
  });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
    
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

await prisma.refreshToken.create({
  data: {
    token: refreshToken,
    userId: user.id,
    expiresAt,
    userAgent: req.headers["user-agent"] ?? null,
    ipAddress: req.ip ?? null,
  },
});


  res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  sameSite: "strict",
  secure: false, // set true in production (HTTPS)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

return res.status(200).json({
  accessToken,
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
  },
});
});

/* =======================
   AUTH: FORGOT PASSWORD (FR-AUTH-003)
   ======================= */
app.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.json({
      message: "If the email exists, a reset link has been sent",
    });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  console.log(
    `Password reset link: http://localhost:4000/auth/reset-password?token=${rawToken}`
  );

  return res.json({
    message: "If the email exists, a reset link has been sent",
  });
});

/* =======================
   AUTH: RESET PASSWORD (FR-AUTH-003)
   ======================= */
app.post("/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body ?? {};

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Token and new password are required",
    });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) {
    return res.status(400).json({
      message: "Invalid or expired reset token",
    });
  }

  /* =======================
     PASSWORD HISTORY CHECK
     ======================= */
  const history = await prisma.passwordHistory.findMany({
    where: { userId: resetToken.userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const entry of history) {
    const reused = await bcrypt.compare(newPassword, entry.hash);
    if (reused) {
      return res.status(400).json({
        message: "Cannot reuse last 5 passwords",
      });
    }
  }

  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash: newPasswordHash },
  });

  // Save password history
  await prisma.passwordHistory.create({
    data: {
      userId: resetToken.userId,
      hash: newPasswordHash,
    },
  });

  /* =======================
     STEP 2: TRIM OLD HISTORY
     ======================= */
  const oldPasswords = await prisma.passwordHistory.findMany({
    where: { userId: resetToken.userId },
    orderBy: { createdAt: "desc" },
    skip: 5,
    select: { id: true },
  });

  if (oldPasswords.length > 0) {
    await prisma.passwordHistory.deleteMany({
      where: {
        id: { in: oldPasswords.map(p => p.id) },
      },
    });
  }

  // Invalidate reset tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId },
  });

  return res.json({
    message: "Password reset successful",
  });
});

/* =======================
   AUTH: CHANGE PASSWORD (FR-AUTH-003)
   ======================= */
app.post("/auth/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body ?? {};

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Email, current password, and new password are required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isCurrentPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  /* =======================
     PASSWORD HISTORY CHECK
     ======================= */
  const history = await prisma.passwordHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const entry of history) {
    const reused = await bcrypt.compare(newPassword, entry.hash);
    if (reused) {
      return res.status(400).json({
        message: "Cannot reuse last 5 passwords",
      });
    }
  }

  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  // Save password history
  await prisma.passwordHistory.create({
    data: {
      userId: user.id,
      hash: newPasswordHash,
    },
  });

  /* =======================
     TRIM OLD PASSWORD HISTORY
     ======================= */
  const oldPasswords = await prisma.passwordHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: 5,
    select: { id: true },
  });

  if (oldPasswords.length > 0) {
    await prisma.passwordHistory.deleteMany({
      where: {
        id: { in: oldPasswords.map(p => p.id) },
      },
    });
  }

  return res.json({
    message: "Password changed successfully",
  });
});

/* =======================
   SERVER START
   ======================= */
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
