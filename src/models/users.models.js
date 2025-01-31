const db = require('../db/connection');

function selectUsers() {
  const sql = `SELECT * FROM users`;
  return db.query(sql).then(({ rows }) => {
    return rows;
  });
}

module.exports = {
  selectUsers,
};
