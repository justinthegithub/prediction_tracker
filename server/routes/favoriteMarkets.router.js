const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const queryText = `
      SELECT fm.market_id, mn.note_body 
      FROM "Favorite_Markets" fm
      LEFT JOIN "Market_Notes" mn ON fm.id = mn.favorite_market_id
      WHERE fm.user_id = $1
    `;
    const result = await pool.query(queryText, [req.user.id]);

    for (const favorite of result.rows) {
      try {
        const marketResponse = await axios.get(`https://www.predictit.org/api/marketdata/markets/${favorite.market_id}`);
        const marketData = marketResponse.data;
        if (marketData.name) {
          favorite.market_name = marketData.name;
        } else {
          favorite.market_name = 'Else Unknown Market';
        }
      } catch (error) {
        favorite.market_name = 'Error and so Unknown Market';
      }
    }

    console.log('Favorite markets with names:', result.rows);
    res.send(result.rows);
  } catch (error) {
    console.error('Error fetching favorite markets:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { market_id } = req.body;

  try {
    const queryText = `
      INSERT INTO "Favorite_Markets" (user_id, market_id)
      VALUES ($1, $2)
      RETURNING id
    `;
    const result = await pool.query(queryText, [userId, market_id]);
    res.status(201).json({ favorite_market_id: result.rows[0].id });
  } catch (error) {
    console.error('Error adding favorite market:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

