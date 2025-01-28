const express = require('express');
const app = express();
const { getApi } = require('./controllers/api.controller');
const { getTopics } = require('./controllers/topics.controllers');
const { getArticleById } = require('./controllers/articles.controllers');

app.use(express.json());

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById);

app.use((req, res) => {
  res.status(404).send({ msg: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  if (err.code === '22P02' || err.code === '22003') {
    res
      .status(400)
      .send({ msg: 'Bad request', error: err.message.split('\n')[0] });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: 'Internal Server Error' });
});

module.exports = app;
