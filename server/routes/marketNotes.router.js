const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

// Add a note to a favorite market
router.post('/marketNotes', (req, res) => {
  const { favorite_market_id, note_body } = req.body;

  const queryText = `
    INSERT INTO "Market_Notes" (favorite_market_id, note_body)
    VALUES ($1, $2)
    RETURNING *
  `;

  pool.query(queryText, [favorite_market_id, note_body])
    .then(result => {
      res.status(201).json(result.rows[0]);
    })
    .catch(error => {
      console.error('Error adding note:', error.message);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = router;
