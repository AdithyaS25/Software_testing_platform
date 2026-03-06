import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { prisma } from '../../prisma';
import { hashPassword } from '../../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';

/* =======================
   REGISTER
   ======================= */
export const registerController = async (req: Request, res: Response) => {
  const { email, password, role } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });

  return res.status(201).json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

/* =======================
   LOGIN
   ======================= */
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(423).json({
      message: 'Account locked. Try again later.',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const attempts = user.failedLoginAttempts + 1;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
      },
    });

    return res.status(401).json({ message: 'Invalid credentials' });
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
    email: user.email,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: req.ip ?? null,
    },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};

/* =======================
   FORGOT PASSWORD
   ======================= */
export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body ?? {};

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.json({
      message: 'If the email exists, a reset link has been sent',
    });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

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
    message: 'If the email exists, a reset link has been sent',
  });
};

/* =======================
   RESET PASSWORD
   ======================= */
export const resetPasswordController = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body ?? {};

  if (!token || !newPassword) {
    return res.status(400).json({
      message: 'Token and new password are required',
    });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) {
    return res.status(400).json({
      message: 'Invalid or expired reset token',
    });
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash: newPasswordHash },
  });

  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId },
  });

  return res.json({
    message: 'Password reset successful',
  });
};

/* =======================
   CHANGE PASSWORD
   ======================= */
export const changePasswordController = async (req: Request, res: Response) => {
  const { email, currentPassword, newPassword } = req.body ?? {};

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({
      message: 'Email, current password, and new password are required',
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isCurrentPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  return res.json({
    message: 'Password changed successfully',
  });
};

/* =======================
   refreshTokenController
   ======================= */

export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const accessToken = signAccessToken({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    console.log('🔄 Refresh payload:', payload);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/* =======================
   logoutAllController
   ======================= */

export const logoutAllController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(200).json({ message: 'Logged out' });
  }

  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  res.clearCookie('refreshToken');

  return res.json({ message: 'Logged out successfully' });
};
