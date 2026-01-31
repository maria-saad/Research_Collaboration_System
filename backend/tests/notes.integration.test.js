// ---- mocks لازم قبل require(app) ----
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

// ✅ Mock Cassandra client
const mockExecute = jest.fn();

jest.mock('../src/config/cassandra', () => ({
  getCassandraClient: () => ({
    execute: mockExecute,
  }),
}));

const request = require('supertest');
const app = require('../src/app');

describe('Notes API (integration) - mocked Cassandra', () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  test('POST /api/notes creates a note', async () => {
    // controller/service غالبًا يعمل INSERT
    mockExecute.mockResolvedValueOnce({});

    const res = await request(app).post('/api/notes').send({
      researcherId: 'r1',
      content: 'hello cassandra',
    });

    // بعض المشاريع ترجع 201 أو 200
    expect([200, 201]).toContain(res.statusCode);

    // تأكد أنه نادى execute (يعني وصل للـ service)
    expect(mockExecute).toHaveBeenCalled();
  });

  test('GET /api/notes?limit=2 returns list', async () => {
    // service غالبًا يعمل SELECT ويرجع rows
    mockExecute.mockResolvedValueOnce({
      rows: [
        { id: 'n1', researcher_id: 'r1', content: 'a', created_at: new Date() },
        { id: 'n2', researcher_id: 'r2', content: 'b', created_at: new Date() },
      ],
    });

    const res = await request(app).get('/api/notes?limit=2');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/notes/:id returns note', async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          id: 'n1',
          researcher_id: 'r1',
          content: 'one',
          created_at: new Date(),
        },
      ],
    });

    const res = await request(app).get('/api/notes/n1');

    // إذا عندك 404 للغير موجود، هنا لازم يكون 200
    expect(res.statusCode).toBe(200);
    // بعض الكود يرجع object أو array — خلينا نتحقق بمرونة
    expect(res.body).toBeTruthy();
  });
});
