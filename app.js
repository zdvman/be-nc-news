const express = require('express');
const app = express();
const { getApi } = require('./controllers/api.controller');

app.use(express.json());

app.get('/api', getApi);

app.use((err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send(err.msg);
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: 'Intrenal server error' });
});

module.exports = app;
