import db from '../config/db.js';

export const ChoreModel = {

  async create({ name, desc, gems, child_id, parent_id, location }) {
    const result = await db.query(`
      INSERT INTO chore (name, "desc", gems, child_id, parent_id, location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING "desc", gems, child_id, parent_id, location
    `, [name, desc, gems, child_id, parent_id, location]);

    return result.rows[0];
  },

  async getChores({ parent_id }) {
    const result = await db.query(`
      SELECT * FROM chore WHERE parent_id = $1
    `, [parent_id]);
    return result.rows[0];
  }
};