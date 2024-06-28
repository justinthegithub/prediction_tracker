const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require('axios');

// POST route for adding favorite markets
router.post('/', async (req, res) => {
  const { market_id } = req.body;
  const user_id = req.user.id; // Ensure req.user is populated

  if (!market_id || !user_id) {
    return res.status(400).send('Bad Request');
  }

  try {
    const result = await pool.query(
      'INSERT INTO "Favorite_Markets" (user_id, market_id) VALUES ($1, $2) RETURNING *',
      [user_id, market_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding market to favorites:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET route for fetching favorite markets
router.get('/', async (req, res) => {
  const queryText = `
    SELECT "Favorite_Markets".market_id
    FROM "Favorite_Markets"
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
          contracts: marketData.contracts.map(contract => ({
            ...contract,
            winProbability: contract.bestBuyYesCost, 
            odds: contract.bestBuyYesCost ? 1 / contract.bestBuyYesCost : null,
          })) || [],
        };
      } catch (error) {
        console.error('Error fetching market data:', error.message);
        return {
          ...favorite,
          market_name: 'Error Fetching Market Name',
          contracts: [],
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

// DELETE route for removing a favorite market
router.delete('/:marketId', async (req, res) => {
  const { marketId } = req.params;
  const user_id = req.user.id; // Ensure req.user is populated

  if (!marketId || !user_id) {
    return res.status(400).send('Bad Request');
  }

  try {
    const result = await pool.query(
      'DELETE FROM "Favorite_Markets" WHERE user_id = $1 AND market_id = $2 RETURNING *',
      [user_id, marketId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Market not found in favorites');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error removing market from favorites:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
