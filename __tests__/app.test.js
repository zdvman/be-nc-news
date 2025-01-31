const endpointsJson = require('../endpoints.json');
const request = require('supertest');
const app = require('../src/app.js');
const db = require('../src/db/connection.js');
const testData = require('../src/db/data/test-data/index.js');
const seed = require('../src/db/seeds/seed.js');
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
      - article_img_url
      - comment_count`, () => {
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
          comment_count: 11,
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
              comment_count: expect.any(Number),
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

describe('PATCH /api/articles/:article_id', () => {
  test('200: Responds with the updated article after incrementing votes', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual({
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: '2020-07-09T19:11:00.000Z',
          votes: 105,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        });
      });
  });

  test('200: Responds with the updated article after decrementing votes', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: -3 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual({
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: '2020-07-09T19:11:00.000Z',
          votes: 97,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        });
      });
  });

  test('400: Responds with error if request body is missing `inc_votes`', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Number of increment votes is required');
      });
  });

  test('400: Responds with error if `inc_votes` is zero', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 0 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Number of increment votes must be a non-zero number');
      });
  });

  test('400: Responds with error if `inc_votes` is not a number', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 'not_a_number' })
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'invalid input syntax for type integer: "not_a_number"'
        );
      });
  });

  test('404: Responds with error if `article_id` does not exist', () => {
    return request(app)
      .patch('/api/articles/1000')
      .send({ inc_votes: 5 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Article with ID "1000" is not found');
      });
  });

  test('400: Responds with error if `article_id` is invalid (not a number)', () => {
    return request(app)
      .patch('/api/articles/not_a_number')
      .send({ inc_votes: 5 })
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'invalid input syntax for type integer: "not_a_number"'
        );
      });
  });

  test('400: Responds with error if `article_id` exceeds maximum value for PostgreSQL INTEGER', () => {
    return request(app)
      .patch('/api/articles/100000000000000')
      .send({ inc_votes: 5 })
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'value "100000000000000" is out of range for type integer'
        );
      });
  });

  test('404: Responds with error if `PATCH` is made to an endpoint that does not exist', () => {
    return request(app)
      .patch('/api/non-existent-endpoint')
      .send({ inc_votes: 5 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Endpoint not found');
      });
  });

  test('405: Responds with error if `PATCH` is made to a valid endpoint but without an article_id', () => {
    return request(app)
      .patch('/api/articles')
      .send({ inc_votes: 5 })
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Method not allowed');
      });
  });

  test('405: Responds with error if `PUT` is made on a valid but unsupported endpoint', () => {
    return request(app)
      .put('/api/articles/1')
      .send({ inc_votes: 5 })
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Method not allowed');
      });
  });
});

describe('DELETE /api/comments/:comment_id', () => {
  test('204: Responds with status 204 and no content', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });

  test('404: Responds with error if comment with provided ID does not exist', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204)
      .then(() => {
        return request(app).delete('/api/comments/1').expect(404);
      })
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Comment with ID "1" is not found');
      });
  });

  test('404: Responds with error if `comment_id` does not exist', () => {
    return request(app)
      .delete('/api/comments/1000')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Comment with ID "1000" is not found');
      });
  });

  test('400: Responds with error if `comment_id` is invalid (not a number)', () => {
    return request(app)
      .delete('/api/comments/not_a_number')
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'invalid input syntax for type integer: "not_a_number"'
        );
      });
  });

  test('400: Responds with error if `comment_id` exceeds maximum value for PostgreSQL INTEGER', () => {
    return request(app)
      .delete('/api/comments/100000000000000')
      .expect(400)
      .then(({ body: { msg, error } }) => {
        expect(msg).toBe('Bad request');
        expect(error).toBe(
          'value "100000000000000" is out of range for type integer'
        );
      });
  });

  test('404: Responds with error if `DELETE` is made to an endpoint that does not exist', () => {
    return request(app)
      .delete('/api/non-existent-endpoint')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Endpoint not found');
      });
  });

  test('405: Responds with error if `PUT` is made on a valid but unsupported endpoint', () => {
    return request(app)
      .put('/api/comments/1')
      .expect(405)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Method not allowed');
      });
  });
});

describe('GET /api/users', () => {
  test(`Responds with: an users array of user objects, each of which should have the following properties:
      - an array of objects, each object should have the following properties:
      - username
      - name
      - avatar_url`, () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body: { users } }) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });

  test('404: Responds with error for an incorrect URL', () => {
    return request(app)
      .get('/api/invalid-url')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Endpoint not found');
      });
  });
});

describe('GET /api/articles (sorting queries)', () => {
  test('200: Sorts articles by a valid column in descending order by default', () => {
    return request(app)
      .get('/api/articles?sort_by=votes')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy('votes', { descending: true });
      });
  });

  test('200: Sorts articles in ascending order when order=asc', () => {
    return request(app)
      .get('/api/articles?sort_by=created_at&order=asc')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy('created_at', { ascending: true });
      });
  });

  test('400: Responds with an error if sort_by column is invalid', () => {
    return request(app)
      .get('/api/articles?sort_by=invalid_column')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid sort_by column: invalid_column');
      });
  });

  test('400: Responds with an error if order is invalid', () => {
    return request(app)
      .get('/api/articles?sort_by=created_at&order=random')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order: random. Must be 'asc' or 'desc'");
      });
  });

  test('200: Responds with default sorting by created_at in descending order if no query params are provided', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy('created_at', { descending: true });
      });
  });

  test('200: Ignores unexpected query parameters and still returns articles', () => {
    return request(app)
      .get('/api/articles?sort_by=created_at&order=asc&unexpected_param=value')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles).toBeSortedBy('created_at', { ascending: true });
      });
  });
});

describe('GET /api/articles (Topic Query)', () => {
  test('200: Returns all articles filtered by a valid topic', () => {
    return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(12);
        articles.forEach((article) => {
          expect(article.topic).toBe('mitch');
        });
      });
  });

  test('200: Returns all articles filtered by a valid topic', () => {
    return request(app)
      .get('/api/articles?topic=cats')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(1);
        articles.forEach((article) => {
          expect(article.topic).toBe('cats');
        });
      });
  });

  test('200: Returns an empty array if no articles match the given topic', () => {
    return request(app)
      .get('/api/articles?topic=nonexistent_topic')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(0);
      });
  });

  test('200: Returns sorted articles filtered by topic (default sort: created_at, desc)', () => {
    return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy('created_at', { descending: true });
      });
  });

  test('200: Returns sorted articles filtered by topic when sort_by and order are provided', () => {
    return request(app)
      .get('/api/articles?topic=mitch&sort_by=votes&order=asc')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy('votes', { descending: false });
      });
  });
});

describe('GET /api/articles/:article_id (comment_count)', () => {
  test('200: Returns an article by a valid ID  total count of all the comments with this article_id, when the article has 11 comments', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe(11);
      });
  });

  test('200: Returns an article by a valid ID, when the article has 0 comments', () => {
    return request(app)
      .get('/api/articles/7')
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe(0);
      });
  });
});
