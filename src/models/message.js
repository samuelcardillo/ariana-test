const db = require("../config/db");

const Message = {
  create(userId, content) {
    const stmt = db.prepare(
      "INSERT INTO messages (user_id, content) VALUES (?, ?)"
    );
    const result = stmt.run(userId, content);
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    const stmt = db.prepare(`
      SELECT m.id, m.content, m.created_at, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `);
    return stmt.get(id);
  },

  getRecent(limit = 50) {
    const stmt = db.prepare(`
      SELECT m.id, m.content, m.created_at, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit).reverse();
  },
};

module.exports = Message;
