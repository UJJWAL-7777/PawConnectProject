const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PawConnect REST API',
    version: '1.0.0',
    description:
      'Production-grade API for PawConnect Pet Adoption & Marketplace Web Application. Supports pet adoptions, marketplace sales with Stripe, rescue reports, medical records, seller reviews, and platform administration.',
    contact: {
      name: 'PawConnect Engineering Team',
      email: 'support@pawconnect.org',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'v1 API Base URL',
    },
    {
      url: '/api',
      description: 'Legacy / Root API Base URL',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'pawconnect_token',
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Sarah Connor' },
                  email: { type: 'string', example: 'sarah@example.com' },
                  password: { type: 'string', example: 'securePass123' },
                  role: {
                    type: 'string',
                    enum: ['Adopter', 'Seller', 'Rescuer', 'ShelterAdmin'],
                    example: 'Adopter',
                  },
                  phone: { type: 'string', example: '+1 555-0199' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user and obtain access token & httpOnly cookie',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@pawconnect.com' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User logged in successfully' },
        },
      },
    },
    '/pets': {
      get: {
        summary: 'Search & filter pets',
        tags: ['Pets'],
        parameters: [
          { name: 'species', in: 'query', schema: { type: 'string' } },
          { name: 'breed', in: 'query', schema: { type: 'string' } },
          { name: 'listingType', in: 'query', schema: { type: 'string', enum: ['adoption', 'sale'] } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'List of pets matching filters' },
        },
      },
      post: {
        summary: 'Create a new pet listing',
        tags: ['Pets'],
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Pet created' },
        },
      },
    },
    '/orders': {
      post: {
        summary: 'Create purchase order / Stripe checkout for pet sale',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Order created' },
        },
      },
    },
    '/adoption-requests': {
      post: {
        summary: 'Submit adoption application',
        tags: ['Adoption Requests'],
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Adoption application submitted' },
        },
      },
    },
    '/rescue-reports': {
      post: {
        summary: 'Report injured or stray animal',
        tags: ['Rescue Reports'],
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Rescue report logged' },
        },
      },
    },
    '/admin/analytics': {
      get: {
        summary: 'Platform analytics via MongoDB aggregation pipeline',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Platform analytics data' },
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
