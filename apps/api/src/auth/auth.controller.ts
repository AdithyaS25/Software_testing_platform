import { Request, Response } from "express";
import {
  refreshAccessToken,
  logoutFromAllDevices,
} from "./auth.service";
import jwt from "jsonwebtoken";

/**
 * POST /auth/refresh
 * Uses refresh token to issue a new access token
 */
export async function refreshTokenController(
  req: Request,
  res: Response
) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const accessToken = await refreshAccessToken(refreshToken);

    return res.json({ accessToken });
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

/**
 * POST /auth/logout-all
 * Revokes all refresh tokens for the user
 */
export async function logoutAllController(req: Request, res: Response) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization header" });
  }

  const token = parts[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT secret not configured" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    if (!payload.sub || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    await logoutFromAllDevices(payload.sub);

    return res.status(200).json({
      message: "Logged out from all devices",
    });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}