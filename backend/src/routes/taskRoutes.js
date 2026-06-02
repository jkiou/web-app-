import express from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { createTaskSchema, updateTaskSchema } from '../utils/validations.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Personal and administrative task operations (CRUD)
 */

// Enforce authentication on all task routes
router.use(protect);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Retrieve list of tasks
 *     description: Standard users retrieve their own tasks. Administrators retrieve all tasks in the system.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *         description: Filter tasks by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filter tasks by priority level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by keywords in their title
 *     responses:
 *       200:
 *         description: A list of tasks
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Design DB Schema
 *               description:
 *                 type: string
 *                 example: Draft models for User, Task, and relations using Prisma SQLite.
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *                 default: PENDING
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(getTasks)
  .post(validate(createTaskSchema), createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique task UUID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (trying to access someone else's task)
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique task UUID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.route('/:id')
  .get(getTask)
  .put(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);

export default router;
