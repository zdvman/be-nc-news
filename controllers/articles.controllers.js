const { selectArticleById } = require('./../models/articles.models');

function getArticleById(request, response, next) {
  return selectArticleById(request.params)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
}

module.exports = {
  getArticleById,
};
