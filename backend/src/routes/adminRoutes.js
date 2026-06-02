import express from 'express';
import { getUsers, updateUserRole, deleteUser, getSystemStats } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { updateUserRoleSchema } from '../utils/validations.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Panel
 *   description: System-wide operations restricted to Administrators (ADMIN role required)
 */

// Enforce both JWT authentication and ADMIN role checks globally for these routes
router.use(protect);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all registered users and their task counts
 *     tags: [Admin Panel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (requires ADMIN role)
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   put:
 *     summary: Change a user's role (promote/demote)
 *     tags: [Admin Panel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User's UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Bad request (validation failure or trying to modify oneself)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user account (Cascades tasks delete)
 *     tags: [Admin Panel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User's UUID
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       400:
 *         description: Bad request (trying to delete oneself)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get system-wide metrics and aggregates
 *     tags: [Admin Panel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated system metrics (user count, task status breakdown, priority breakdown)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', getSystemStats);

export default router;
