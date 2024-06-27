const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  const queryText = `
    SELECT "Favorite_Markets".market_id, "Market_Notes".note_body 
    FROM "Favorite_Markets"
    LEFT JOIN "Market_Notes" ON "Favorite_Markets".id = "Market_Notes".favorite_market_id
    WHERE "Favorite_Markets".user_id = $1
  `;
  
  try {
    const result = await pool.query(queryText, [req.user.id]);
    const marketDataPromises = result.rows.map(async (favorite) => {
      try {
        const marketResponse = await axios.get(`https://www.predictit.org/api/marketdata/markets/${favorite.market_id}`);
        const marketData = marketResponse.data;
        return {
          ...favorite,
          market_name: marketData.name || 'Unknown Market',
          short_name: marketData.shortName || 'Unknown Short Name',
          image: marketData.image,
          url: marketData.url,
          contracts: marketData.contracts || [],
          status: marketData.status,
        };
      } catch (error) {
        return {
          ...favorite,
          market_name: 'Error Fetching Market Name',
          short_name: 'Error Fetching Short Name',
          image: null,
          url: null,
          contracts: [],
          status: 'Error',
        };
      }
    });

    const marketsWithData = await Promise.all(marketDataPromises);
    res.send(marketsWithData);
  } catch (error) {
    console.error('Error fetching favorite markets:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', (req, res) => {
  const userId = req.user.id;
  const { market_id } = req.body;

  const queryText = `
    INSERT INTO "Favorite_Markets" (user_id, market_id)
    VALUES ($1, $2)
    RETURNING id
  `;

  pool.query(queryText, [userId, market_id])
    .then(result => {
      res.status(201).json({ favorite_market_id: result.rows[0].id });
    })
    .catch(error => {
      console.error('Error adding favorite market:', error.message);
      res.status(500).send('Internal Server Error');
    });
});

router.delete('/:id', (req, res) => {
  const userId = req.user.id;
  const favoriteMarketId = req.params.id;

  const queryText = `
    DELETE FROM "Favorite_Markets"
    WHERE user_id = $1 AND market_id = $2
  `;

  pool.query(queryText, [userId, favoriteMarketId])
    .then(() => {
      res.status(204).send(); 
    })
    .catch(error => {
      console.error('Error deleting favorite market:', error.message);
      res.status(500).send('Internal Server Error');
    });
});

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
