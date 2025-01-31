const db = require('../db/connection');

function selectArticleById({ article_id }) {
  const sql = `SELECT
    articles.author,
    articles.title,
    articles.article_id,
    articles.body,
    articles.topic,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    CAST(COUNT(comments.comment_id) AS INT) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
    `;
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

function selectArticles({ sort_by = 'created_at', order = 'desc', topic }) {
  const args = [];
  const validSortColumns = [
    'author',
    'title',
    'article_id',
    'topic',
    'created_at',
    'votes',
    'article_img_url',
    'comment_count',
  ];
  const validOrders = ['asc', 'desc'];
  const columnMap = {
    author: 'articles.author',
    title: 'articles.title',
    article_id: 'articles.article_id',
    topic: 'articles.topic',
    created_at: 'articles.created_at',
    votes: 'articles.votes',
    article_img_url: 'articles.article_img_url',
    comment_count: 'comment_count',
  };
  let sql = `SELECT 
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      CAST(COUNT(comments.comment_id) AS INT) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id`;

  if (topic) {
    sql += ` WHERE articles.topic = $1`;
    args.push(topic);
  }

  sql += ` GROUP BY articles.article_id`;

  if (!validSortColumns.includes(sort_by)) {
    return Promise.reject({
      msg: `Invalid sort_by column: ${sort_by}`,
      status: 400,
    });
  }

  if (!validOrders.includes(order.toLowerCase())) {
    return Promise.reject({
      msg: `Invalid order: ${order}. Must be 'asc' or 'desc'`,
      status: 400,
    });
  }

  sql += ` ORDER BY ${columnMap[sort_by]} ${order.toUpperCase()}`;

  return db.query(sql, args).then(({ rows }) => {
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
  updateArticle,
};
