import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { registerSchema, loginSchema } from '../utils/validations.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and profile operations
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation failed (e.g. invalid email, short password)
 *       409:
 *         description: Email already in use
 */
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in with credentials and receive a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: user123
 *     responses:
 *       200:
 *         description: Logged in successfully, returns user and token
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details retrieved successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get('/me', protect, getMe);

export default router;
