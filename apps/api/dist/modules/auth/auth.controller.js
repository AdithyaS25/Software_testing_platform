"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutAllController = exports.refreshTokenController = exports.changePasswordController = exports.resetPasswordController = exports.forgotPasswordController = exports.loginController = exports.registerController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../prisma");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
/* =======================
   REGISTER
   ======================= */
const registerController = async (req, res) => {
    const { email, password, role } = req.body ?? {};
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await prisma_1.prisma.user.create({
        data: { email, passwordHash, role },
    });
    return res.status(201).json({
        id: user.id,
        email: user.email,
        role: user.role,
    });
};
exports.registerController = registerController;
/* =======================
   LOGIN
   ======================= */
const loginController = async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }
    const user = await prisma_1.prisma.user.findUnique({
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
    const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        const attempts = user.failedLoginAttempts + 1;
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: attempts,
                lockUntil: attempts >= 5
                    ? new Date(Date.now() + 15 * 60 * 1000)
                    : null,
            },
        });
        return res.status(401).json({ message: "Invalid credentials" });
    }
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            failedLoginAttempts: 0,
            lockUntil: null,
            lastLoginAt: new Date(),
        },
    });
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, jwt_1.signRefreshToken)({
        sub: user.id,
        email: user.email,
        role: user.role,
    });
    await prisma_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.headers["user-agent"] ?? null,
            ipAddress: req.ip ?? null,
        },
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
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
exports.loginController = loginController;
/* =======================
   FORGOT PASSWORD
   ======================= */
const forgotPasswordController = async (req, res) => {
    const { email } = req.body ?? {};
    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.json({
            message: "If the email exists, a reset link has been sent",
        });
    }
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    const tokenHash = crypto_1.default
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    await prisma_1.prisma.passwordResetToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
    });
    console.log(`Password reset link: http://localhost:4000/auth/reset-password?token=${rawToken}`);
    return res.json({
        message: "If the email exists, a reset link has been sent",
    });
};
exports.forgotPasswordController = forgotPasswordController;
/* =======================
   RESET PASSWORD
   ======================= */
const resetPasswordController = async (req, res) => {
    const { token, newPassword } = req.body ?? {};
    if (!token || !newPassword) {
        return res.status(400).json({
            message: "Token and new password are required",
        });
    }
    const tokenHash = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const resetToken = await prisma_1.prisma.passwordResetToken.findFirst({
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
    const newPasswordHash = await (0, password_1.hashPassword)(newPassword);
    await prisma_1.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
    });
    await prisma_1.prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
    });
    return res.json({
        message: "Password reset successful",
    });
};
exports.resetPasswordController = resetPasswordController;
/* =======================
   CHANGE PASSWORD
   ======================= */
const changePasswordController = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body ?? {};
    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Email, current password, and new password are required",
        });
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const isCurrentPasswordValid = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const newPasswordHash = await (0, password_1.hashPassword)(newPassword);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
    });
    return res.json({
        message: "Password changed successfully",
    });
};
exports.changePasswordController = changePasswordController;
/* =======================
   refreshTokenController
   ======================= */
const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Missing refresh token" });
    }
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const accessToken = (0, jwt_1.signAccessToken)({
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
        });
        console.log("🔄 Refresh payload:", payload);
        return res.json({ accessToken });
    }
    catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
exports.refreshTokenController = refreshTokenController;
/* =======================
   logoutAllController
   ======================= */
const logoutAllController = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(200).json({ message: "Logged out" });
    }
    await prisma_1.prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
    });
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out successfully" });
};
exports.logoutAllController = logoutAllController;
//# sourceMappingURL=auth.controller.js.map