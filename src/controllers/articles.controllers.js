const {
  selectArticleById,
  selectArticles,
  updateArticle,
  insertArticle,
} = require('../models/articles.models');

function getArticleById(request, response, next) {
  return selectArticleById(request.params?.article_id)
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
  return updateArticle(request.params?.article_id, request.body?.inc_votes)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
}

function postArticle(request, response, next) {
  console.log('in POST article');
  return insertArticle(request)
    .then((article) => {
      response.status(201).send({ article });
    })
    .catch(next);
}

module.exports = {
  getArticleById,
  getArticles,
  patchArticle,
  postArticle,
};
