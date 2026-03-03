/// <reference path="./types/express.d.ts" />
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import path from "path";
import projectRoutes from './modules/project/project.routes';

const app = express();
const PORT = process.env.PORT || 4000;

/* =======================
   MIDDLEWARE
   ======================= */
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,              // VERY IMPORTANT
  })
);
app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
   ======================= */
app.use("/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/projects", projectRoutes);

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

