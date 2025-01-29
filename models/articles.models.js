const db = require('./../db/connection');
const { checkArticleExists } = require('./../db/seeds/utils');

function selectArticleById({ article_id }) {
  const sql = `SELECT * FROM articles WHERE article_id = $1`;
  const args = [article_id];

  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `Article with ID "${article_id}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function selectArticles({ sort_by = 'created_at', order = 'desc' }) {
  const validSortColumns = ['created_at'];
  const validOrders = ['asc', 'desc'];
  let sql = `SELECT 
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id`;

  if (!validSortColumns.includes(sort_by)) {
    return Promise.reject({
      msg: `Invalid sort_by column: ${sort_by}`,
      status: 400,
    });
  }

  if (!validOrders.includes(order)) {
    return Promise.reject({
      msg: `Invalid order: ${order}. Must be 'asc' or 'desc'`,
      status: 400,
    });
  }

  sql += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;

  return db.query(sql).then(({ rows }) => {
    return rows;
  });
}

function selectCommentsByArticle(
  { article_id },
  { sort_by = 'created_at', order = 'desc' }
) {
  const args = [];
  const validSortColumns = ['created_at'];
  const validOrders = ['asc', 'desc'];
  let sql = `SELECT comment_id, votes, created_at, author, body, article_id FROM comments`;

  if (!article_id) {
    return Promise.reject({
      msg: `Article ID is required`,
      status: 400,
    });
  }
  args.push(article_id);
  sql += ` WHERE comments.article_id = $1`;

  if (!validSortColumns.includes(sort_by)) {
    return Promise.reject({
      msg: `Invalid sort_by column: ${sort_by}`,
      status: 400,
    });
  }
  if (!validOrders.includes(order)) {
    return Promise.reject({
      msg: `Invalid order: ${order}. Must be 'asc' or 'desc'`,
      status: 400,
    });
  }
  sql += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;

  return checkArticleExists(article_id)
    .then(() => db.query(sql, args))
    .then(({ rows }) => {
      return rows;
    });
}

function updateArticle({ article_id }, { inc_votes }) {
  if (!article_id) {
    return Promise.reject({
      msg: `Article ID is required`,
      status: 400,
    });
  }
  if (inc_votes === undefined || inc_votes === null) {
    return Promise.reject({
      msg: `Number of increment votes is required`,
      status: 400,
    });
  }
  if (inc_votes === 0) {
    return Promise.reject({
      msg: `Number of increment votes must be a non-zero number`,
      status: 400,
    });
  }
  const args = [inc_votes, article_id];

  const sql = `UPDATE articles 
    SET votes = 
      CASE 
        WHEN votes + $1 < 0 THEN 0 
        ELSE votes + $1 
      END
    WHERE article_id = $2 
    RETURNING *;
  `;

  return db.query(sql, args).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({
        msg: `Article with ID "${article_id}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

module.exports = {
  selectArticleById,
  selectArticles,
  selectCommentsByArticle,
  updateArticle,
};
