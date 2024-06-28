const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('server/modules/pool.js')

router.get('/:marketId', async (req, res) => {
  const marketId = req.params.marketId;

  try {
    const response = await axios.get(`https://www.predictit.org/api/marketdata/markets/${marketId}`);
    const marketName = response.data.name || 'Unknown Market';
    res.json({ market_id: marketId, marketName: marketName });
  } catch (error) {
    console.log("Problem getting market name for Market ID:", marketId, error.message);

    // Fallback to database query
    try {
      const result = await pool.query('SELECT name FROM Markets WHERE id = $1', [marketId]);
      if (result.rows.length > 0) {
        res.json({ market_id: marketId, marketName: result.rows[0].name });
      } else {
        res.status(404).send('Market not found in the database');
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.status(500).send('Internal Server Error');
    }
  }
});

module.exports = router;
