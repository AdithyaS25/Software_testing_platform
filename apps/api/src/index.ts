/// <reference path="./types/express.d.ts" />
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import path from 'path';
import projectRoutes from './modules/project/project.routes';
import notificationRoutes from './modules/notification/notification.routes';
import userRouter from './modules/user/user.routes';

const app = express();
const PORT = process.env.PORT || 4000;

/* =======================
   MIDDLEWARE
   ======================= */
// In your Express app setup
app.use(
  cors({
    origin: [
      'https://testtrack-pro-nu.vercel.app',
      'http://localhost:5173', // keep local dev working
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
   ======================= */
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TestTrack Pro API is running',
  });
});

/* =======================
   HEALTH CHECK
   ======================= */
app.get('/health', (_req, res) => {
  res.json({ status: 'API running' });
});

/* =======================
   SWAGGER
   ======================= */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =======================
   START SERVER
   ======================= */
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
