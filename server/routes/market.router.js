const express = require('express');
const router = express.Router();
const pool = require('../modules/pool.js');

router.get('/:marketId', (req, res) => {
  const marketId = req.params.marketId;

  pool.query('SELECT name FROM Markets WHERE id = $1', [marketId])
    .then(result => {
      if (result.rows.length > 0) {
        res.json({ market_id: marketId, marketName: result.rows[0].name });
      } else {
        res.status(404).send('Market not found in the database');
      }
    })
    .catch(databaseError => {
      console.error('Database query error:', databaseError);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = router;

