const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

router.post('/', async (req, res) => {  // Ensure the path is '/'
  const { favorite_market_id, note_body } = req.body;

  const checkNoteQuery = `
    SELECT * FROM "Market_Notes" WHERE favorite_market_id = $1
  `;

  const insertNoteQuery = `
    INSERT INTO "Market_Notes" (favorite_market_id, note_body)
    VALUES ($1, $2)
    RETURNING note_body
  `;

  const updateNoteQuery = `
    UPDATE "Market_Notes" SET note_body = $2 WHERE favorite_market_id = $1
    RETURNING note_body
  `;

  try {
    const existingNote = await pool.query(checkNoteQuery, [favorite_market_id]);

    if (existingNote.rows.length > 0) {
      const result = await pool.query(updateNoteQuery, [favorite_market_id, note_body]);
      res.status(200).json(result.rows[0]);
    } else {
      const result = await pool.query(insertNoteQuery, [favorite_market_id, note_body]);
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error adding or editing note:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
