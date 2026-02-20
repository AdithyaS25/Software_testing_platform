import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/auth-request";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  const decoded = jwt.verify(token, secret);

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
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
    
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function authorize(allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Insufficient role",
      });
    }

    next();
  };
}
