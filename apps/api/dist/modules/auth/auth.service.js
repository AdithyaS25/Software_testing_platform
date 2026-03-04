"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = refreshAccessToken;
exports.logoutFromAllDevices = logoutFromAllDevices;
const prisma_1 = require("../../prisma");
const jwt_1 = require("../../utils/jwt");
/* ============================
   REFRESH ACCESS TOKEN
============================ */
async function refreshAccessToken(refreshToken) {
    // 1️⃣ Verify JWT using your helper
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    if (!payload || !payload.sub) {
        throw new Error("Invalid refresh token");
    }
    // 2️⃣ Check DB record
    const storedToken = await prisma_1.prisma.refreshToken.findUnique({
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
    // 3️⃣ Issue new access token
    return (0, jwt_1.signAccessToken)({
        userId: payload.sub,
    });
}
/* ============================
   LOGOUT FROM ALL DEVICES
============================ */
async function logoutFromAllDevices(userId) {
    await prisma_1.prisma.refreshToken.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}
//# sourceMappingURL=auth.service.js.map