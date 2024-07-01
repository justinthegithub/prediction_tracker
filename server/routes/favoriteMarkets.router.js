const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require('axios');

router.post('/', (req, res) => {
  const { market_id } = req.body;
  const user_id = req.user.id;

  if (!market_id || !user_id) {
    return res.status(400).send('There is an issue with market_id or the user_id');
  }

  pool.query(
    `INSERT INTO "Favorite_Markets" (user_id, market_id) VALUES ($1, $2)`,
    [user_id, market_id]
  )
  .then(() => {
    res.status(201).send('favoriteMarkets.routers .post has successfully added markets to favorite');
  })
  .catch(error => {
    console.log('favoriteMarkets.router had an issue with the pool.query', error);
    res.status(500).send('Internal Server Error sent from favoriteMarkets.router');
  });
});

router.get('/', (req, res) => {
  const user_id = req.user.id;
  const queryText = 'SELECT market_id FROM "Favorite_Markets" WHERE user_id=$1';

  pool.query(queryText, [user_id])
  .then(result => {
    const marketIds = result.rows.map(row => row.market_id);
    let marketsWithData = [];

    const fetchMarketData = (index) => {
      if (index >= marketIds.length) {
        res.send(marketsWithData);
        return; 
      }

      const market_id = marketIds[index];
      axios.get(`https://www.predictit.org/api/marketdata/markets/${market_id}`)
        .then(response => {
          const marketData = response.data;
          marketsWithData.push({
            market_id,
            market_name: marketData.name || 'Unknown Market',
            contracts: marketData.contracts.map(contract => ({
              ...contract,
              winProbability: contract.bestBuyYesCost,
              odds: contract.bestBuyYesCost ? 1 / contract.bestBuyYesCost : null,
            })) || [],
          });
          fetchMarketData(index + 1);
        })
        .catch(error => {
          console.error('Error fetching market data:', error.message);
          marketsWithData.push({
            market_id,
            market_name: 'Error Fetching Market Name',
            contracts: [],
          });
          fetchMarketData(index + 1);
        });
    };

    fetchMarketData(0);
  })
  .catch(error => {
    console.error('Error fetching favorite markets:', error.message);
    res.status(500).send('Internal Server Error');
  });
});

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


module.exports = router;
