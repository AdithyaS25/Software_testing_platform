// File: apps/api/src/middleware/authenticate.ts

import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types/auth-request';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET;

  // ✅ Removed: console.log("🔐 Using access secret:", secret) — exposes secret in logs

  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret);

    // ✅ Removed: console.log("📦 Raw decoded:", decoded)

    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }

    const payload = decoded as JwtPayload;

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      !Object.values(UserRole).includes(payload.role as UserRole)
    ) {
      throw new Error('Malformed token payload');
    }

    return payload as AccessTokenPayload;
  } catch (err: any) {
    // ✅ Removed noisy console.log — only rethrow so caller handles it
    throw err;
  }
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = req.headers.authorization;

  // ✅ Removed: console.log("🔍 Authorization header:", authHeader)
  // ✅ Removed: console.log("🔑 Extracted token:", token)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1]!;

  try {
    const payload = verifyAccessToken(token);

    // ✅ Removed: console.log("✅ Decoded payload:", payload)

    authReq.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err: any) {
    // ✅ Removed: console.log("❌ JWT verification failed:", err.message)
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize =
  (allowedRoles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: Insufficient role',
      });
    }

    next();
  };
