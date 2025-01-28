const db = require('./../connection');

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

exports.checkArticleExists = (article_id) => {
  const args = [article_id];
  const sql = `SELECT * FROM articles WHERE article_id = $1`;
  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0)
      return Promise.reject({
        status: 404,
        msg: `Article with ID "${article_id}" is not found`,
      });
    return;
  });
};

exports.checkUserExists = (username) => {
  const args = [username];
  const sql = `SELECT * FROM users WHERE username = $1`;
  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0)
      return Promise.reject({
        status: 404,
        msg: `User with username "${username}" is not found`,
      });
    return;
  });
};
