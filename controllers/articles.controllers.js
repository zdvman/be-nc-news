const {
  selectArticleById,
  selectArticles,
  updateArticle,
} = require('./../models/articles.models');

function getArticleById(request, response, next) {
  return selectArticleById(request.params)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
}

function getArticles(request, response, next) {
  return selectArticles(request.query)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch(next);
}

function patchArticle(request, response, next) {
  return updateArticle(request.params, request.body)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
}

module.exports = {
  getArticleById,
  getArticles,
  patchArticle,
};
