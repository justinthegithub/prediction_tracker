const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

// Route to handle adding or updating market-specific notes
router.post('/', async (req, res) => {
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

// Route to handle adding general notes
router.post('/general', async (req, res) => {
  const { user_id, note_body } = req.body;

  const insertNoteQuery = `
    INSERT INTO "General_Notes" (user_id, note_body)
    VALUES ($1, $2)
    RETURNING *
  `;

  try {
    const result = await pool.query(insertNoteQuery, [user_id, note_body]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding general note:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Route to fetch general notes for a user
router.get('/general/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const fetchNotesQuery = `
    SELECT * FROM "General_Notes" WHERE user_id = $1
  `;

  try {
    const result = await pool.query(fetchNotesQuery, [user_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching general notes:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Route to update a general note
router.put('/general/:id', async (req, res) => {
  const { id } = req.params;
  const { note_body } = req.body;

  const updateNoteQuery = `
    UPDATE "General_Notes" SET note_body = $1 WHERE id = $2
    RETURNING *
  `;

  try {
    const result = await pool.query(updateNoteQuery, [note_body, id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating general note:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Route to delete a general note
router.delete('/general/:id', async (req, res) => {
  const { id } = req.params;

  const deleteNoteQuery = `
    DELETE FROM "General_Notes" WHERE id = $1
  `;

  try {
    await pool.query(deleteNoteQuery, [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting general note:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
