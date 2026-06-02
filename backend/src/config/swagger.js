import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Task Management & RBAC API',
      version: '1.0.0',
      description: 'A scalable REST API designed for task management. Secured with JWT and Role-Based Access Controls (RBAC). Built with Node.js, Express, Prisma, and SQLite.',
      contact: {
        name: 'Backend Intern Candidate'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your JWT token in the format: Bearer <token>'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/app.js', './src/routes/v1/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
