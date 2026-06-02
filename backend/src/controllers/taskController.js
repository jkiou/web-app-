import prisma from '../config/db.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const filter = {};

    // For normal users, filter by their own userId. For admins, list all tasks.
    if (req.user.role !== 'ADMIN') {
      filter.userId = req.user.id;
    }

    // Apply optional status filter
    if (status) {
      filter.status = status;
    }

    // Apply optional priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Apply optional title search filter
    if (search) {
      filter.title = {
        contains: search
      };
    }

    const tasks = await prisma.task.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      },
      include: req.user.role === 'ADMIN' ? {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      } : undefined
    });

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    // Authorize: Admin can see any task, users can only see their own tasks
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      throw new ForbiddenError('You are not authorized to view this task.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        userId: req.user.id
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: {
        task
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    // Check if task exists and check ownership
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found.');
    }

    if (req.user.role !== 'ADMIN' && existingTask.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to update this task.');
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: {
        task
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if task exists and check ownership
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found.');
    }

    if (req.user.role !== 'ADMIN' && existingTask.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to delete this task.');
    }

    await prisma.task.delete({
      where: { id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
