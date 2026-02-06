jest.mock('uuid', () => ({
  v4: () => '00000000-0000-0000-0000-000000000000',
}));

jest.mock('neo4j-driver', () => ({
  auth: { basic: jest.fn(() => ({})) },
  driver: jest.fn(() => ({
    session: jest.fn(() => ({ run: jest.fn(), close: jest.fn() })),
    close: jest.fn(),
  })),
}));

// mock runQueryOptional from neo4j.service
const mockRunQueryOptional = jest.fn();

jest.mock('../src/services/neo4j.service', () => ({
  runQueryOptional: (...args) => mockRunQueryOptional(...args),
}));

// mock Project model ليدعم findById().populate().populate().lean()
jest.mock('../src/models/Project', () => {
  const buildFindByIdChain = (doc) => ({
    populate: jest.fn(() => buildFindByIdChain(doc)),
    lean: jest.fn(async () => doc),
  });

  return {
    findById: jest.fn((id) => {
      // مشروع موجود
      if (id === 'p1') {
        return buildFindByIdChain({
          _id: 'p1',
          title: 'Proj 1',
          owner: {
            _id: 'r1',
            name: 'Alice',
            email: 'a@uni.edu',
            affiliation: 'CS',
          },
          collaborators: [
            {
              _id: 'r2',
              name: 'Bob',
              email: 'b@uni.edu',
              affiliation: 'AI Lab',
            },
          ],
        });
      }
      // مشروع غير موجود
      return buildFindByIdChain(null);
    }),
  };
});

const request = require('supertest');
const app = require('../src/app');

describe('Projects Team API (integration)', () => {
  beforeEach(() => {
    mockRunQueryOptional.mockReset();
  });

  test('GET /api/projects/:id/team returns team + collaborations when Neo4j responds', async () => {
    // نرجّع records fake بنفس شكل neo4j driver: record.get(...)
    mockRunQueryOptional.mockResolvedValueOnce({
      records: [
        {
          get: (k) => {
            if (k === 'fromId') return 'r1';
            if (k === 'toId') return 'r2';
            if (k === 'weight') return 2;
            return null;
          },
        },
      ],
    });

    const res = await request(app).get('/api/projects/p1/team');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        projectId: 'p1',
        title: 'Proj 1',
        teamCount: 2,
        members: expect.any(Array),
        collaborations: expect.any(Array),
      })
    );
    expect(res.body.members.length).toBe(2);
    expect(res.body.collaborations.length).toBe(1);
  });

  test('GET /api/projects/:id/team returns 200 with empty collaborations when Neo4j disabled/failed', async () => {
    mockRunQueryOptional.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/projects/p1/team');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        projectId: 'p1',
        collaborations: expect.any(Array),
      })
    );
    expect(res.body.collaborations).toHaveLength(0);
  });

  test('GET /api/projects/:id/team returns 404 when project not found', async () => {
    const res = await request(app).get('/api/projects/does-not-exist/team');
    expect(res.statusCode).toBe(404);
  });
});
