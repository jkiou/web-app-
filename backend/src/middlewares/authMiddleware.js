import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { UnauthorizedError } from '../utils/errors.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for authorization header with Bearer format
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('Access token is missing. Please log in.'));
    }

    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve user and attach to request
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return next(new UnauthorizedError('The user associated with this credentials no longer exists.'));
    }

    // Store user context in request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
