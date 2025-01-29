const { match } = require('path-to-regexp');

exports.handle405 = (app) => (req, res, next) => {
  const registeredRoutes = app._router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).map((m) => m.toUpperCase()),
    }));

  const cleanPath = req.baseUrl + req.path.split('?')[0];

  const matchedRoute = registeredRoutes.find((route) => {
    const matchFn = match(route.path, { decode: decodeURIComponent });
    return matchFn(cleanPath);
  });

  if (matchedRoute) {
    if (!matchedRoute.methods.includes(req.method)) {
      return res.status(405).send({ msg: 'Method not allowed' });
    }
  } else {
    next();
  }
};

exports.handle404 = (req, res) => {
  res.status(404).send({ msg: 'Endpoint not found' });
};

exports.handlePSQLErrors = (err, req, res, next) => {
  // invalid input syntax,
  // out of range for type integer,
  // NOT NULL constraint violation - missing required field
  if (err.code === '22P02' || err.code === '22003' || err.code === '23502') {
    res.status(400).send({
      msg: 'Bad request',
      error: err.message.split('\n')[0],
    });
  } else if (err.code === '23503') {
    // Foreign key constraint violation
    res.status(404).send({
      msg: 'Not found',
      error: err.message.split('\n')[0],
    });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle500 = (err, req, res, next) => {
  res.status(500).send({ msg: 'Internal Server Error' });
};
