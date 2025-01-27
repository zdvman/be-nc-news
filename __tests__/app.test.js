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

describe('GET /api/articles/:article_id', () => {
  test(`200: Responds with: an article object, which should have the following properties:
      - author
      - title
      - article_id
      - body
      - topic
      - created_at
      - votes
      - article_img_url`, () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body: { article } }) => {
        expect(typeof article).toBe('object');
        expect(article).toEqual({
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: '2020-07-09T19:11:00.000Z',
          votes: 100,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        });

        // article_id SERIAL PRIMARY KEY,
        // title VARCHAR NOT NULL,
        // topic VARCHAR NOT NULL REFERENCES topics(slug),
        // author VARCHAR NOT NULL REFERENCES users(username),
        // body VARCHAR NOT NULL,
        // created_at TIMESTAMP DEFAULT NOW(),
        // votes INT DEFAULT 0 NOT NULL,
        // article_img_url VARCHAR DEFAULT 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
        expect(article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test('404: Responds with proper error message if article is not found by ID', () => {
    return request(app)
      .get('/api/articles/100000')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Article with ID 100000 is not found');
      });
  });

  test('400: Responds with Invalid article ID', () => {
    return request(app)
      .get('/api/articles/not_ID')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Invalid article ID');
      });
  });

  test('400: Responds with proper error message if article_id exceeds maximum value for a PostgreSQL INTEGER', () => {
    return request(app)
      .get('/api/articles/100000000000000')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Article ID exceeds maximum allowed value of 2147483647'
        );
      });
  });
});
