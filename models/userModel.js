const db = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0];
  }

  static async createUser(email, hashedPassword, role) {
    const [result] = await db.execute(
      'INSERT INTO Users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    return result.insertId;
  }
}

module.exports = UserModel;