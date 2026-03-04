"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./types/express.d.ts" />
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const path_1 = __importDefault(require("path"));
const project_routes_1 = __importDefault(require("./modules/project/project.routes"));
const notification_routes_1 = __importDefault(require("./modules/notification/notification.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
/* =======================
   MIDDLEWARE
   ======================= */
app.use((0, cors_1.default)({
    origin: true, // frontend URL
    credentials: true, // VERY IMPORTANT
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
/* =======================
   ROUTES
   ======================= */
app.use("/auth", auth_routes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/api/projects", project_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "TestTrack Pro API is running",
    });
});
/* =======================
   HEALTH CHECK
   ======================= */
app.get("/health", (_req, res) => {
    res.json({ status: "API running" });
});
/* =======================
   SWAGGER
   ======================= */
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
/* =======================
   START SERVER
   ======================= */
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map