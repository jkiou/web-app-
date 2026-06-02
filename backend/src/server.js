import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/db.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start Server and verify DB connectivity
const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully via Prisma Client.');

    const server = app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });

    // Handle Unhandled Promise Rejections (e.g. async errors outside of try-catch)
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Gracefully shutting down...', err);
      server.close(() => {
        prisma.$disconnect();
        process.exit(1);
      });
    });

    // Handle system termination signals
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down server gracefully...');
      server.close(() => {
        prisma.$disconnect();
        logger.info('Process terminated.');
      });
    });

  } catch (error) {
    logger.error('Failed to establish database connection or start server:', error);
    process.exit(1);
  }
};

// Handle Synchronous Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down immediately...', err);
  process.exit(1);
});

startServer();
