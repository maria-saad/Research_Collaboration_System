const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Research Collaboration System API',
    version: '1.0.0',
    description: 'API documentation for the Research Collaboration System',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health checks' },
    {
      name: 'Researchers',
      description: 'Researchers CRUD and related resources',
    },
    { name: 'Projects', description: 'Projects CRUD' },
    { name: 'Publications', description: 'Publications CRUD' },
    { name: 'Graph', description: 'Neo4j graph operations' },
    { name: 'Analytics', description: 'Analytics endpoints (Neo4j + Redis)' },
    { name: 'Notes', description: 'Cassandra notes endpoints' },
  ],
  components: {
    schemas: {
      Researcher: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
          name: { type: 'string', example: 'Alice Smith' },
          email: { type: 'string', example: 'alice@uni.edu' },
          affiliation: { type: 'string', example: 'Computer Science' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['AI', 'Databases'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      CreateResearcherRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'Alice Smith' },
          email: { type: 'string', format: 'email', example: 'alice@uni.edu' },
          affiliation: { type: 'string', example: 'Computer Science' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['AI', 'Databases'],
          },
        },
      },

      UpdateResearcherRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, example: 'Alice Smith' },
          email: { type: 'string', format: 'email', example: 'alice@uni.edu' },
          affiliation: { type: 'string', example: 'Computer Science' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['AI', 'Databases'],
          },
        },
      },
      Project: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f1b2c3d4e5f67890123499' },
          title: {
            type: 'string',
            example: 'Graph-based Collaboration Analysis',
          },
          description: {
            type: 'string',
            example: 'Analyze collaboration networks using Neo4j.',
          },
          status: { type: 'string', example: 'active' },
          startDate: { type: 'string', format: 'date', example: '2026-01-01' },
          endDate: { type: 'string', format: 'date', example: '2026-06-01' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          owner: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
        },
      },

      CreateProjectRequest: {
        type: 'object',
        required: ['title', 'owner'],
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            example: 'Graph-based Collaboration Analysis',
          },
          description: {
            type: 'string',
            example: 'Analyze collaboration networks using Neo4j.',
          },
          status: { type: 'string', example: 'active' },
          startDate: { type: 'string', format: 'date', example: '2026-01-01' },
          endDate: { type: 'string', format: 'date', example: '2026-06-01' },
          owner: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
        },
      },

      UpdateProjectRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            example: 'Updated project title',
          },
          description: { type: 'string', example: 'Updated description' },
          status: { type: 'string', example: 'completed' },
          startDate: { type: 'string', format: 'date', example: '2026-01-01' },
          endDate: { type: 'string', format: 'date', example: '2026-06-01' },
          owner: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
        },
      },
      Publication: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f1b2c3d4e5f67890123001' },
          title: {
            type: 'string',
            example: 'A Study on Multi-Database Systems',
          },
          abstract: {
            type: 'string',
            example:
              'This paper explores integrating MongoDB, Neo4j, Redis, and Cassandra.',
          },
          year: { type: 'integer', example: 2026 },
          venue: { type: 'string', example: 'IEEE Conference' },
          doi: { type: 'string', example: '10.1234/abcd.2026.001' },

          // روابط شائعة (عدليها حسب مشروعك لاحقًا)
          projectId: { type: 'string', example: '65f1b2c3d4e5f67890123499' },
          researcherId: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
          authors: {
            type: 'array',
            items: { type: 'string' },
            example: ['Alice Smith', 'Bob Lee'],
          },

          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      CreatePublicationRequest: {
        type: 'object',
        required: ['title', 'authors'],
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            example: 'A Study on Multi-Database Systems',
          },
          abstract: {
            type: 'string',
            example:
              'This paper explores integrating MongoDB, Neo4j, Redis, and Cassandra.',
          },
          year: { type: 'integer', example: 2026 },
          venue: { type: 'string', example: 'IEEE Conference' },
          doi: { type: 'string', example: '10.1234/abcd.2026.001' },
          projectId: { type: 'string', example: '65f1b2c3d4e5f67890123499' },
          researcherId: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
          authors: {
            type: 'array',
            items: { type: 'string' },
            example: ['Alice Smith', 'Bob Lee'],
          },
        },
      },

      UpdatePublicationRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            example: 'Updated publication title',
          },
          abstract: { type: 'string', example: 'Updated abstract' },
          year: { type: 'integer', example: 2026 },
          venue: { type: 'string', example: 'ACM Journal' },
          doi: { type: 'string', example: '10.1234/abcd.2026.999' },
          projectId: { type: 'string', example: '65f1b2c3d4e5f67890123499' },
          researcherId: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
          authors: {
            type: 'array',
            items: { type: 'string' },
            example: ['Alice Smith', 'Bob Lee'],
          },
        },
      },

      TopResearcher: {
        type: 'object',
        properties: {
          researcherId: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
          name: { type: 'string', example: 'Alice Smith' },
          collaborations: { type: 'integer', example: 12 },
          publications: { type: 'integer', example: 5 },
        },
      },
      TopResearchersResponse: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            enum: ['cache', 'db'],
            example: 'cache',
          },
          limit: {
            type: 'integer',
            example: 5,
          },
          topResearchers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '6974ecb7c23aa7d35b5d44dc' },
                name: { type: 'string', example: 'Alice Smith' },
                email: { type: 'string', nullable: true },
                collaborationsCount: { type: 'integer', example: 3 },
              },
            },
          },
        },
      },
      CollaborationRequest: {
        type: 'object',
        required: ['fromId', 'toId'],
        properties: {
          fromId: {
            type: 'string',
            description: 'Source researcher ID',
            example: '69691770730a203fa7b7290b',
          },
          toId: {
            type: 'string',
            description: 'Target researcher ID',
            example: '69691770730a203fa7b7290c',
          },
          weight: {
            type: 'integer',
            description: 'Collaboration strength (optional)',
            example: 1,
          },
        },
      },

      CollaborationResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Collaboration created' },
        },
      },

      Collaborator: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f1b2c3d4e5f67890123457' },
          name: { type: 'string', example: 'Bob Johnson' },
          email: { type: 'string', nullable: true, example: null },
          collaborationsCount: { type: 'integer', example: 2 },
        },
      },

      CollaboratorsResponse: {
        type: 'object',
        properties: {
          researcherId: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
          collaborators: {
            type: 'array',
            items: { $ref: '#/components/schemas/Collaborator' },
          },
        },
      },

      CombinedProfileResponse: {
        type: 'object',
        properties: {
          mongo: {
            type: 'object',
            description: 'Researcher core data from MongoDB',
            additionalProperties: true,
          },
          graph: {
            type: 'object',
            description: 'Graph/collaboration info from Neo4j',
            additionalProperties: true,
          },
          analytics: {
            type: 'object',
            description: 'Optional analytics/cache info',
            additionalProperties: true,
          },
        },
      },

      ProjectTeamMember: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f1b2c3d4e5f67890123456' },
          name: { type: 'string', example: 'Alice Smith' },
          role: { type: 'string', example: 'PI' },
        },
      },

      ProjectTeamResponse: {
        type: 'object',
        properties: {
          projectId: { type: 'string', example: '65f1b2c3d4e5f67890123499' },
          team: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProjectTeamMember' },
          },
        },
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Validation error' },
            },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/app.js', './src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
