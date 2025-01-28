const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticle,
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

function getCommentsByArticle(request, response, next) {
  return selectCommentsByArticle(request.params, request.query)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch(next);
}

module.exports = {
  getArticleById,
  getArticles,
  getCommentsByArticle,
};
