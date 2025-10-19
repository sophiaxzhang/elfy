import db from '../config/db.js';

export const ChoreModel = {

  async create({ name, desc, gems, child_id, parent_id, location, status = 0 }) {
    console.log('ChoreModel.create called with:', { name, desc, gems, child_id, parent_id, location, status });
    try {
      const result = await db.query(`
        INSERT INTO chore (name, "desc", gems, child_id, parent_id, location, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [name, desc, gems, child_id, parent_id, location, status]);
      
      console.log('ChoreModel.create result:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('ChoreModel.create error:', error);
      throw error;
    }
  },

  async getChores({ parent_id }) {
    const result = await db.query(`
      SELECT * FROM chore WHERE parent_id = $1
    `, [parent_id]);
    return result.rows[0];
  },

  async getChoresByChild(child_id) {
    console.log('ChoreModel.getChoresByChild called with child_id:', child_id);
    const result = await db.query(`
      SELECT * FROM chore WHERE child_id = $1 ORDER BY id DESC
    `, [child_id]);
    console.log('Query result:', result.rows);
    return result.rows;
  },

  async getChoresByParent(parent_id) {
    const result = await db.query(`
      SELECT * FROM chore WHERE parent_id = $1 ORDER BY id DESC
    `, [parent_id]);
    return result.rows;
  },

  async getChoreById(id) {
    const result = await db.query(`
      SELECT * FROM chore WHERE id = $1
    `, [id]);
    return result.rows[0];
  },

  async updateChore(id, updates) {
    const { name, desc, gems, location, status } = updates;
    const result = await db.query(`
      UPDATE chore 
      SET name = COALESCE($1, name), 
          "desc" = COALESCE($2, "desc"), 
          gems = COALESCE($3, gems), 
          location = COALESCE($4, location),
          status = COALESCE($5, status)
      WHERE id = $6
      RETURNING *
    `, [name, desc, gems, location, status, id]);
    return result.rows[0];
  },

  async deleteChore(id) {
    const result = await db.query(`
      DELETE FROM chore WHERE id = $1 RETURNING *
    `, [id]);
    return result.rows[0];
  }
};