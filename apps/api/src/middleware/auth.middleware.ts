import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types/auth-request";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET;

  console.log("🔐 Using access secret:", secret);

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(token, secret);
    console.log("📦 Raw decoded:", decoded);

    if (typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    const payload = decoded as JwtPayload;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !Object.values(UserRole).includes(payload.role as UserRole)
    ) {
      throw new Error("Malformed token payload");
    }

    return payload as AccessTokenPayload;
  } catch (err: any) {
    console.log("❌ jwt.verify error:", err.message);
    throw err;
  }
}

/* ✅ FIXED */
export const authenticate: RequestHandler = (
  req,
  res,
  next
) => {
  const authReq = req as AuthenticatedRequest;

  const authHeader = req.headers.authorization;

  console.log("🔍 Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Missing or malformed Authorization header");
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1]!;

  console.log("🔑 Extracted token:", token);

  try {
    const payload = verifyAccessToken(token);

    console.log("✅ Decoded payload:", payload);

    authReq.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err: any) {
    console.log("❌ JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* ✅ FIXED */
export const authorize =
  (allowedRoles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Insufficient role",
      });
    }

    next();
  };
  