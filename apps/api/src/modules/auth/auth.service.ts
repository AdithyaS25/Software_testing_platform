import { prisma } from "../../prisma";
import { signAccessToken, verifyRefreshToken } from "../../utils/jwt";

export async function refreshAccessToken(refreshToken: string) {
  // 1. Verify JWT signature
  const payload = verifyRefreshToken(refreshToken) as { userId: string };

  // 2. Check DB record
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.revokedAt) {
    throw new Error("Refresh token revoked");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error("Refresh token expired");
  }

  // 3. Issue new access token
  return signAccessToken({ userId: payload.userId });
}

export async function logoutFromAllDevices(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
