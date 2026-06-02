import { ForbiddenError } from '../utils/errors.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User context not found. Authentication is required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Your role '${req.user.role}' is not authorized to access this action.`)
      );
    }

    next();
  };
};
