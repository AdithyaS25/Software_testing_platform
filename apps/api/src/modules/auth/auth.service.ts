import { prisma } from '../../prisma';
import { signAccessToken, verifyRefreshToken } from '../../utils/jwt';

/* ============================
   REFRESH ACCESS TOKEN
============================ */

export async function refreshAccessToken(refreshToken: string) {
  // 1️⃣ Verify JWT using your helper
  const payload = verifyRefreshToken(refreshToken);

  if (!payload || !payload.sub) {
    throw new Error('Invalid refresh token');
  }

  // 2️⃣ Check DB record
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  if (storedToken.revokedAt) {
    throw new Error('Refresh token revoked');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('Refresh token expired');
  }

  // 3️⃣ Issue new access token
  return signAccessToken({
    userId: payload.sub,
  });
}

/* ============================
   LOGOUT FROM ALL DEVICES
============================ */

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
