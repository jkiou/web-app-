import prisma from '../config/db.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent demoting oneself
    if (id === req.user.id) {
      throw new BadRequestError('You cannot modify your own administrative role.');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.status(200).json({
      status: 'success',
      message: `User role updated successfully to '${role}'`,
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (id === req.user.id) {
      throw new BadRequestError('You cannot delete your own account from the administrator panel.');
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({
      status: 'success',
      message: 'User account and all associated tasks deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTasks = await prisma.task.count();

    // Group tasks by status
    const statusCounts = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Group tasks by priority
    const priorityCounts = await prisma.task.groupBy({
      by: ['priority'],
      _count: {
        id: true
      }
    });

    const statusObj = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    statusCounts.forEach(item => {
      statusObj[item.status] = item._count.id;
    });

    const priorityObj = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    priorityCounts.forEach(item => {
      priorityObj[item.priority] = item._count.id;
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalTasks,
          tasksByStatus: statusObj,
          tasksByPriority: priorityObj
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
