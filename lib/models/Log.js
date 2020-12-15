const pool = require('../utils/pool');

module.exports = class Log {
  id;
  dateOfEvent;
  notes;
  rating;
  recipeId;

  constructor(row) {
    this.id = String(row.id);
    this.dateOfEvent = row.date_of_event;
    this.notes = row.notes;
    this.rating = row.rating;
    this.recipeId = String(row.recipe_id);
  }

  static async insert({ dateOfEvent, notes, rating, recipeId }) {
    const { rows } = await pool.query(
      'INSERT INTO logs (date_of_event, notes, rating, recipe_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [dateOfEvent, notes, rating, recipeId]
    );
    return new Log(rows[0]);
  }

};
