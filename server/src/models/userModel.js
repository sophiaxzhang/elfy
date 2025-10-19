import db from '../config/db.js';

export const UserModel = {
    async findByEmail(email){
        const result = await db.query('SELECT * FROM users WHERE email = $1',
      [email]
    );
      return result.rows[0];
    },

  async create({ name, email, pin, password }) {
    const result = await db.query(`
      INSERT INTO parent (name, email, pin, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, pin
    `, [name, email, pin, password]);

    return result.rows[0];
  },

  async createChild({ name, parentId, gem }) {
    const result = await db.query(`
      INSERT INTO child (name, parent_id, gem)
      VALUES ($1, $2, $3)
      RETURNING id, name, parent_id, gem
    `, [name, parentId, gem]);
    return result.rows[0];
  }
};