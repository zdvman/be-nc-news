const express = require('express');
const app = express();
const { getApi } = require('./controllers/api.controller');
const { getTopics } = require('./controllers/topics.controllers');
const { getArticleById } = require('./controllers/articles.controllers');

app.use(express.json());

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById);

// Catch-all middleware for undefined routes
app.use((req, res, next) => {
  res.status(404).send({ msg: 'Not Found' });
});

// Error-handling middleware for custom errors
app.use((err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

// Error-handling middleware for internal server errors
app.use((err, req, res, next) => {
  // console.error(err);
  res.status(500).send({ msg: 'Internal Server Error' });
});

module.exports = app;
