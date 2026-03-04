"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Reuse a single transporter across requests
let _transporter = null;
function getTransporter() {
    if (_transporter)
        return _transporter;
    _transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return _transporter;
}
async function sendEmail(opts) {
    const transporter = getTransporter();
    await transporter.sendMail({
        from: `"TestTrack Pro" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
    });
}
//# sourceMappingURL=email.utils.js.map