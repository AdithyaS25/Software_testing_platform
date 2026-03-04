"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEvidence = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "video/mp4",
        "video/webm",
        "text/plain",
        "application/json",
        "application/x-har+json"
    ];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Unsupported file type"));
    }
    cb(null, true);
};
exports.uploadEvidence = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // max 100MB (highest allowed)
    },
    fileFilter,
});
//# sourceMappingURL=uploadEvidence.js.map