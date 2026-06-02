import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import logger from './utils/logger.js';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS setup
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 3. Rate Limiting (Brute-force protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 mins for local testing ease
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 4. Request Parsing
app.use(express.json({ limit: '10kb' })); // Prevents large payload DDoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Request Logging (Morgan integrated with Winston)
const morganStream = {
  write: (message) => logger.info(message.trim())
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// 6. Interactive API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirect root to api docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// 7. Register Application Routes (Version 1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// 8. Catch Unhandled Routes (404)
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server.`));
});

// 9. Global Error Middleware
app.use(errorHandler);

export default app;
