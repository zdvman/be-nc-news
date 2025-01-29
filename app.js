const express = require('express');
const app = express();
const { getApi } = require('./controllers/api.controller');
const { getTopics } = require('./controllers/topics.controllers');
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require('./controllers/articles.controllers');

const {
  postComment,
  getCommentsByArticle,
} = require('./controllers/comments.controllers');
const {
  handle404,
  handle405,
  handlePSQLErrors,
  handleCustomErrors,
  handle500,
} = require('./middleware/errorHandling');

app.use(express.json());

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id/comments', getCommentsByArticle);

app.post('/api/articles/:article_id/comments', postComment);

app.patch('/api/articles/:article_id', patchArticle);

app.use(handle405(app));

app.use(handle404);

app.use(handlePSQLErrors);

app.use(handleCustomErrors);

app.use(handle500);

module.exports = app;
