import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";
import testCaseRoutes from "./modules/test-cases/testCase.routes";
import executionRoutes from "./modules/execution/execution.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import testRunRoutes from "./modules/test-run/testRun.routes";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

/* =======================
   MIDDLEWARE
   ======================= */
app.use(cors());
app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
   ======================= */
app.use("/auth", authRoutes);
app.use("/test-cases", testCaseRoutes);
app.use("/executions", executionRoutes);
app.use("/test-runs", testRunRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =======================
   HEALTH CHECK
   ======================= */
app.get("/health", (_req, res) => {
  res.json({ status: "API running" });
});

/* =======================
   SWAGGER
   ======================= */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =======================
   START SERVER
   ======================= */
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

