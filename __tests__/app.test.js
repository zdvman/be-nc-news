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
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });

  test('404: Responds with Endpoint not found for invalid endpoint', () => {
    return request(app)
      .get('/api/not-a-route')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Endpoint not found');
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
      });
  });

  test('404: Responds with proper error message if article is not found by ID', () => {
    return request(app)
      .get('/api/articles/100000')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Article with ID "100000" is not found');
      });
  });

  test('400: Responds with Invalid article ID', () => {
    return request(app)
      .get('/api/articles/not_ID')
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe('invalid input syntax for type integer: "not_ID"');
      });
  });

  test('400: Responds with proper error message if article_id exceeds maximum value for a PostgreSQL INTEGER', () => {
    return request(app)
      .get('/api/articles/100000000000000')
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'value "100000000000000" is out of range for type integer'
        );
      });
  });
});

describe('GET /api/articles', () => {
  test(`Responds with: an articles array of article objects, each of which should have the following properties:
      - author
      - title
      - article_id
      - topic
      - created_at
      - votes
      - article_img_url
      - comment_count, which is the total count of all the comments with this article_id.`, () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(13);
        expect(articles).toBeSorted('created_at', { descending: true });
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String),
            })
          );
          expect(article).not.toHaveProperty('body');
        });
      });
  });

  test('200: Each article includes the correct comment_count', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        articles.forEach((article) => {
          expect(Number(article.comment_count)).not.toBeNaN();
        });
      });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  test(`Responds with: an array of comments for the given article_id of which each comment should have the following properties:
      - comment_id
      - votes
      - created_at
      - author
      - body
      - article_id
      Comments should be served with the most recent comments first.`, () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(11);
        expect(comments).toBeSorted('created_at', { descending: true });
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            })
          );
        });
      });
  });

  test('200: No comments found for provided Article', () => {
    return request(app)
      .get('/api/articles/7/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(0);
      });
  });

  test('404: Article with provided ID does not exist', () => {
    return request(app)
      .get('/api/articles/1000/comments')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Article with ID "1000" is not found');
      });
  });

  test('400: Responds with Invalid article ID', () => {
    return request(app)
      .get('/api/articles/not_ID/comments')
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe('invalid input syntax for type integer: "not_ID"');
      });
  });

  test('400: Responds with proper error message if article_id exceeds maximum value for a PostgreSQL INTEGER', () => {
    return request(app)
      .get('/api/articles/100000000000000/comments')
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'value "100000000000000" is out of range for type integer'
        );
      });
  });
});

describe('POST /api/articles/:article_id/comments', () => {
  test('201: Responds with the posted comment for a valid article ID', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: 'This is a test comment.',
            author: 'butter_bridge',
            article_id: 1,
            votes: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });

  test('404: Responds with error if article_id is missing in the request', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles//comments')
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Endpoint not found');
      });
  });

  test('400: Responds with error if article_id is invalid in the request', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles/not_ID/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe('invalid input syntax for type integer: "not_ID"');
      });
  });

  test('400: Responds with error if the request body is missing the "body" property', () => {
    const newComment = {
      username: 'butter_bridge',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Body is required');
      });
  });

  test('400: Responds with error if the request body is missing the "username" property', () => {
    const newComment = {
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Username is required');
      });
  });

  test('404: Responds with error if the article does not exist', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles/1000/comments')
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Article with ID "1000" is not found');
      });
  });

  test('404: Responds with error if the username does not exist', () => {
    const newComment = {
      username: 'nonexistent_user',
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('User with username "nonexistent_user" is not found');
      });
  });

  test('400: Responds with error for invalid article_id (not a number)', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles/not_a_number/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'invalid input syntax for type integer: "not_a_number"'
        );
      });
  });

  test('400: Responds with error if article_id exceeds maximum value for PostgreSQL INTEGER', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment.',
    };

    return request(app)
      .post('/api/articles/100000000000000/comments')
      .send(newComment)
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'value "100000000000000" is out of range for type integer'
        );
      });
  });
});
