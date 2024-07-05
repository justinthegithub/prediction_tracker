const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../modules/pool.js');

// POST: take market_id from req.body 
// take user_id from user
// require both 
// insert user_id and market_id into Favorite_Market. 
router.post('/', (req, res) => {
  const { market_id } = req.body;
  const user_id = req.user.id;

  if (!market_id || !user_id) {
    return res.status(400).send('Bad Request');
  }

  pool.query(
    'INSERT INTO "Favorite_Markets" (user_id, market_id) VALUES ($1, $2)',
    [user_id, market_id]
  )
    .then(() => {
      res.status(201).send('Market added to favorites');
    })
    .catch(error => {
      console.error('Error adding market to favorites:', error);
      res.status(500).send('Internal Server Error');
    });
});

// GET
// Markets, MarketData, Contract

// queryText Select market_id from Favorite_Markets table. 
// declare marketsWithData
router.get('/', async (req, res) => {
  const queryText = `
    SELECT "Favorite_Markets".market_id
    FROM "Favorite_Markets"
    WHERE "Favorite_Markets".user_id = $1
  `;

  try {
    const result = await pool.query(queryText, [req.user.id]);
    const favoriteMarkets = result.rows;
    let marketsWithData = [];

    // add markets to marketsWithData array.  
    for (let favorite of favoriteMarkets) {
      try {
        const response = await axios.get(`https://www.predictit.org/api/marketdata/markets/${favorite.market_id}`);
        const marketData = response.data;

        marketsWithData.push({
          market_id: favorite.market_id,
          market_name: marketData.name || 'Unknown Market',
          contracts: marketData.contracts.map(contract => ({
            id: contract.id,
            name: contract.name,
            bestBuyYesCost: contract.bestBuyYesCost,
            bestBuyNoCost: contract.bestBuyNoCost,
            winProbability: contract.bestBuyYesCost,
            odds: contract.bestBuyYesCost ? 1 / contract.bestBuyYesCost : null,
          })) || [],
        });
      } catch (error) {
        console.error(`Error fetching market data for market ID ${favorite.market_id}:`, error.message);
        marketsWithData.push({
          market_id: favorite.market_id,
          market_name: 'Error Fetching Market Name',
          contracts: [],
        });
      }
    }

    res.send(marketsWithData);
  } catch (error) {
    console.error('Error fetching favorite markets:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE: Reset bankroll to zero
router.delete('/bankroll', (req, res) => {
  const user_id = req.user.id;

  if (!user_id) {
    return res.status(400).send('User ID is required');
  }

  const queryText = 'UPDATE "Bankroll" SET bankroll = 0 WHERE user_id=$1';

  pool.query(queryText, [user_id])
    .then(() => {
      res.status(204).send('Bankroll reset to zero');
    })
    .catch(error => {
      console.error('Error resetting bankroll:', error.message);
      res.status(500).send('Internal Server Error');
    });
});

// DELETE
// take user_id from authenticated user
// take marketId from req.
// require both
router.delete('/all', (req, res) => {
  const user_id = req.user.id;

  if (!user_id) {
    return res.status(400).send('User ID is required');
  }

  const queryText = 'DELETE FROM "Favorite_Markets" WHERE user_id=$1';

  pool.query(queryText, [user_id])
    .then(() => {
      res.status(204).send('All favorite markets cleared');
    })
    .catch(error => {
      console.error('Error clearing all favorite markets:', error.message);
      res.status(500).send('Internal Server Error');
    });
});

router.delete('/:marketId', (req, res) => {
  const { marketId } = req.params;
  const user_id = req.user.id;

  if (!marketId || !user_id) {
    return res.status(400).send('Bad Request');
  }

  pool.query(
    'DELETE FROM "Favorite_Markets" WHERE user_id = $1 AND market_id = $2',
    [user_id, marketId]
  )
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).send('Market not found in favorites');
      }

      res.status(200).send('Market removed from favorites');
    })
    .catch(error => {
      console.error('Error removing market from favorites:', error);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = router;
