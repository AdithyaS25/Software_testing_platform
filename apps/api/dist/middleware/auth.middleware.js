"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
function verifyAccessToken(token) {
    const secret = process.env.JWT_ACCESS_SECRET;
    console.log("🔐 Using access secret:", secret);
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log("📦 Raw decoded:", decoded);
        if (typeof decoded === "string") {
            throw new Error("Invalid token payload");
        }
        const payload = decoded;
        if (typeof payload.sub !== "string" ||
            typeof payload.email !== "string" ||
            !Object.values(client_1.UserRole).includes(payload.role)) {
            throw new Error("Malformed token payload");
        }
        return payload;
    }
    catch (err) {
        console.log("❌ jwt.verify error:", err.message);
        throw err;
    }
}
/* ✅ FIXED */
const authenticate = (req, res, next) => {
    const authReq = req;
    const authHeader = req.headers.authorization;
    console.log("🔍 Authorization header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ Missing or malformed Authorization header");
        return res.status(401).json({ message: "Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];
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
    }
    catch (err) {
        console.log("❌ JWT verification failed:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
/* ✅ FIXED */
const authorize = (allowedRoles) => (req, res, next) => {
    const authReq = req;
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
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map