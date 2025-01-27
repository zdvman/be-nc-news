const endpointsJson = require('../endpoints.json');
const request = require('supertest');
const app = require('./../app');
const db = require('./../db/connection');
const testData = require('./../db/data/test-data/index.js');
const seed = require('./../db/seeds/seed.js');
require('jest-sorted');

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe('GET /api', () => {
  test('200: Responds with an object detailing the documentation for each endpoint', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe('GET /api/topics', () => {
  test(`200: Responds with: an array of topic objects, each of which should have the following properties:
      - slug
      - description`, () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBe(3);

        // Check the shape of the response objects
        topics.forEach((topic) => {
          // slug VARCHAR PRIMARY KEY,
          // description VARCHAR
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });

  test('404: Responds with Not Found for invalid endpoint', () => {
    return request(app)
      .get('/api/not-a-route')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Not Found');
      });
  });
});
