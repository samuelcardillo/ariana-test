const db = require("../config/db");

const User = {
  create(username, passwordHash) {
    const stmt = db.prepare(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    );
    const result = stmt.run(username, passwordHash);
    return { id: result.lastInsertRowid, username };
  },

  findByUsername(username) {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(username);
  },

  findById(id) {
    const stmt = db.prepare("SELECT id, username, created_at FROM users WHERE id = ?");
    return stmt.get(id);
  },
};

module.exports = User;
