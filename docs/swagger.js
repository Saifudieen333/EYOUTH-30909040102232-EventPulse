// docs/swagger.js
const bearer = [{ bearerAuth: [] }];
const idParam = (name) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string' },
});

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'EventPulse API',
    version: '1.0.0',
    description:
      'Event management platform: auth with roles, events with filtering/sorting/pagination/search, registrations with capacity, and real-time announcements (Socket.io events: join:event, announcement:create, announcement:new).',
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local development' },
    { url: 'https://eyouth-30909040102232-event-pulse.vercel.app', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check (server + database state)',
        responses: {
          200: { description: 'Service available, database connected' },
          503: { description: 'Database not connected' },
        },
      },
    },

    '/api/auth/register': {
      post: {
        summary: 'Register a new user (attendee by default)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created — returns token + user' },
          400: { description: 'Email already registered' },
          422: { description: 'Validation failed (structured field errors)' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        summary: 'Login — returns JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Returns token + user' },
          401: { description: 'Invalid credentials' },
          422: { description: 'Missing fields' },
        },
      },
    },

    '/api/users': {
      get: {
        summary: 'List users (admin)',
        security: bearer,
        responses: { 200: { description: 'Users list' }, 401: { description: 'No token' }, 403: { description: 'Not admin' } },
      },
      post: {
        summary: 'Create user with role (admin)',
        security: bearer,
        responses: { 201: { description: 'Created' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 422: { description: 'Validation failed' } },
      },
    },

    '/api/users/{id}': {
      get: { summary: 'Show one user (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'User' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' } } },
      put: { summary: 'Update user (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Updated' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' }, 422: { description: 'Validation failed' } } },
      patch: { summary: 'Partially update user (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Updated' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' }, 422: { description: 'Validation failed' } } },
      delete: { summary: 'Delete user (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Deleted' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' } } },
    },

    '/api/categories': {
      get: { summary: 'List categories', responses: { 200: { description: 'Categories list' } } },
      post: { summary: 'Create category (admin)', security: bearer, responses: { 201: { description: 'Created' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 422: { description: 'Validation failed' } } },
    },

    '/api/categories/{id}': {
      get: { summary: 'Show one category', parameters: [idParam('id')], responses: { 200: { description: 'Category' }, 404: { description: 'Not found' } } },
      put: { summary: 'Update category (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Updated' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' }, 422: { description: 'Validation failed' } } },
      patch: { summary: 'Partially update category (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Updated' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' }, 422: { description: 'Validation failed' } } },
      delete: { summary: 'Delete category (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Deleted' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' } } },
    },

    '/api/events': {
      get: {
        summary: 'List events — filters, search, sort, pagination (all combinable)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category id or name' },
          { name: 'city', in: 'query', schema: { type: 'string' }, description: 'City (case-insensitive)' },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date range start (YYYY-MM-DD)' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date range end (YYYY-MM-DD)' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Text search in title + description' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['date', '-date', 'popular', '-popular'] }, description: 'Sorting' },
          { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Current page (default 1)' },
          { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Page size (default 10, max 100)' },
        ],
        responses: { 200: { description: 'Filtered list + metadata (total, page, totalPages)' }, 400: { description: 'Invalid date format' } },
      },
      post: {
        summary: 'Create event (admin)',
        security: bearer,
        responses: { 201: { description: 'Created' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 422: { description: 'Validation failed' } },
      },
    },

    '/api/events/{id}': {
      get: { summary: 'Show one event with category', parameters: [idParam('id')], responses: { 200: { description: 'Event' }, 404: { description: 'Not found' } } },
      put: { summary: 'Update event (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Updated' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' }, 422: { description: 'Validation failed' } } },
      patch: { summary: 'Partially update event (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Updated' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' }, 422: { description: 'Validation failed' } } },
      delete: { summary: 'Delete event (admin)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Deleted' }, 401: { description: 'No token' }, 403: { description: 'Not admin' }, 404: { description: 'Not found' } } },
    },

    '/api/events/{eventId}/announcements': {
      get: {
        summary: 'Announcement history for one event (time-ordered)',
        parameters: [idParam('eventId')],
        responses: { 200: { description: 'Announcements with sender + event details' }, 404: { description: 'Event not found' } },
      },
    },

    '/api/registrations': {
      post: {
        summary: 'Register the logged-in user for an event (capacity enforced)',
        security: bearer,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['event'], properties: { event: { type: 'string' } } } } },
        },
        responses: {
          201: { description: 'Created' },
          400: { description: 'Duplicate registration OR event full' },
          401: { description: 'No token' },
          404: { description: 'Event not found' },
          422: { description: 'Validation failed' },
        },
      },
      get: { summary: 'Full registrations list (admin)', security: bearer, responses: { 200: { description: 'All registrations' }, 401: { description: 'No token' }, 403: { description: 'Not admin' } } },
    },

    '/api/registrations/me': {
      get: { summary: 'My registrations with event details', security: bearer, responses: { 200: { description: 'Current user registrations' }, 401: { description: 'No token' } } },
    },

    '/api/registrations/{id}': {
      delete: { summary: 'Cancel my registration (frees the place)', security: bearer, parameters: [idParam('id')], responses: { 200: { description: 'Cancelled' }, 401: { description: 'No token' }, 403: { description: 'Not your registration' }, 404: { description: 'Not found' } } },
    },
  },
};