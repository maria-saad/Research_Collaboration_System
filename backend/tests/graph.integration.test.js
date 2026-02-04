const request = require('supertest');

/**
 * Fix uuid ESM issue (notes.service uses uuid)
 * This prevents Jest from choking on uuid's ESM build.
 */
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

/**
 * Mock Neo4j service used by graph.controller
 */
jest.mock('../src/services/neo4j.service', () => ({
  runQuery: jest.fn(),
}));

/**
 * Mock Researcher mongoose model
 * syncResearcher uses: Researcher.findById(id).lean()
 * so findById must return an object that has lean().
 */
jest.mock('../src/models/Researcher', () => ({
  findById: jest.fn(),
}));

const { runQuery } = require('../src/services/neo4j.service');
const Researcher = require('../src/models/Researcher');
const app = require('../src/app');

function mockMongooseLeanResolved(value) {
  return { lean: jest.fn().mockResolvedValue(value) };
}

/**
 * Neo4j record mock: record.get("key") => value
 */
function makeRecord(map) {
  return {
    get: (k) => map[k],
  };
}

describe('Graph API (integration) - mocked Mongo & Neo4j', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/graph/researchers/:id/sync', () => {
    test('syncs researcher successfully', async () => {
      // Mongo
      Researcher.findById.mockReturnValue(
        mockMongooseLeanResolved({
          _id: 'r1',
          name: 'Alice',
          email: 'alice@test.com',
        })
      );

      // Neo4j result: RETURN r.id AS id, r.name AS name, r.email AS email
      runQuery.mockResolvedValue({
        records: [
          makeRecord({
            id: 'r1',
            name: 'Alice',
            email: 'alice@test.com',
          }),
        ],
      });

      const res = await request(app).post('/api/graph/researchers/r1/sync');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        synced: true,
        researcher: {
          id: 'r1',
          name: 'Alice',
          email: 'alice@test.com',
        },
      });

      expect(Researcher.findById).toHaveBeenCalledWith('r1');

      // Ensure cypher + params are passed
      expect(runQuery).toHaveBeenCalledWith(
        expect.stringContaining('MERGE (r:Researcher {id: $id})'),
        {
          id: 'r1',
          name: 'Alice',
          email: 'alice@test.com',
        }
      );
    });

    test('returns 404 if researcher not found', async () => {
      Researcher.findById.mockReturnValue(mockMongooseLeanResolved(null));

      const res = await request(app).post(
        '/api/graph/researchers/does-not-exist/sync'
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        error: { message: 'Researcher not found' },
      });

      expect(Researcher.findById).toHaveBeenCalledWith('does-not-exist');
      expect(runQuery).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/graph/collaborations', () => {
    test('creates collaboration successfully (defaults weight=1 if missing)', async () => {
      runQuery.mockResolvedValue({
        // RETURN a.id AS fromId, b.id AS toId, r1.weight AS weight
        records: [
          makeRecord({
            fromId: 'r1',
            toId: 'r2',
            weight: 1,
          }),
        ],
      });

      const res = await request(app).post('/api/graph/collaborations').send({
        fromId: 'r1',
        toId: 'r2',
        // no weight -> should default to 1
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        created: true,
        fromId: 'r1',
        toId: 'r2',
        weight: 1,
      });

      expect(runQuery).toHaveBeenCalledWith(
        expect.stringContaining('MERGE (a:Researcher {id: $fromId})'),
        { fromId: 'r1', toId: 'r2', weight: 1 }
      );
    });

    test('creates collaboration successfully with provided weight', async () => {
      runQuery.mockResolvedValue({
        records: [
          makeRecord({
            fromId: 'r1',
            toId: 'r2',
            weight: 3,
          }),
        ],
      });

      const res = await request(app).post('/api/graph/collaborations').send({
        fromId: 'r1',
        toId: 'r2',
        weight: 3,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        created: true,
        fromId: 'r1',
        toId: 'r2',
        weight: 3,
      });

      expect(runQuery).toHaveBeenCalledWith(expect.any(String), {
        fromId: 'r1',
        toId: 'r2',
        weight: 3,
      });
    });

    test('returns 400 if fromId or toId missing', async () => {
      const res = await request(app).post('/api/graph/collaborations').send({
        fromId: 'r1',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: { message: 'fromId and toId are required' },
      });

      expect(runQuery).not.toHaveBeenCalled();
    });

    test('returns 400 if fromId equals toId', async () => {
      const res = await request(app).post('/api/graph/collaborations').send({
        fromId: 'r1',
        toId: 'r1',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: { message: 'fromId and toId must be different' },
      });

      expect(runQuery).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/graph/researchers/:id/collaborators', () => {
    test('returns collaborators list', async () => {
      // RETURN c.id AS collaboratorId, c.name AS collaboratorName, c.email AS collaboratorEmail
      runQuery.mockResolvedValue({
        records: [
          makeRecord({
            collaboratorId: 'r2',
            collaboratorName: 'Bob',
            collaboratorEmail: 'bob@test.com',
          }),
        ],
      });

      const res = await request(app).get(
        '/api/graph/researchers/r1/collaborators'
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        researcherId: 'r1',
        collaborators: [{ id: 'r2', name: 'Bob', email: 'bob@test.com' }],
      });

      expect(runQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          'MATCH (r:Researcher {id: $id})-[:COLLABORATES_WITH]->(c:Researcher)'
        ),
        { id: 'r1' }
      );
    });

    test('returns empty list when no collaborators found (still 200)', async () => {
      runQuery.mockResolvedValue({ records: [] });

      const res = await request(app).get(
        '/api/graph/researchers/r1/collaborators'
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        researcherId: 'r1',
        collaborators: [],
      });
    });
  });
});
