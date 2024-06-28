const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require('axios');


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


router.get('/', (req, res) => {
  const queryText = `
    SELECT "Favorite_Markets".market_id
    FROM "Favorite_Markets"
    WHERE "Favorite_Markets".user_id = $1
  `;

  pool.query(queryText, [req.user.id])
    .then(result => {
      let marketsWithData = [];
      let fetchPromises = [];

      result.rows.forEach(favorite => {
        let fetchPromise = axios.get(`https://www.predictit.org/api/marketdata/markets/${favorite.market_id}`)
          .then(marketResponse => {
            const marketData = marketResponse.data;
            marketsWithData.push({
              ...favorite,
              market_name: marketData.name || 'Unknown Market',
              contracts: marketData.contracts.map(contract => ({
                ...contract,
                winProbability: contract.bestBuyYesCost,
                odds: contract.bestBuyYesCost ? 1 / contract.bestBuyYesCost : null,
              })) || [],
            });
          })
          .catch(error => {
            console.error('Error fetching market data:', error.message);
            marketsWithData.push({
              ...favorite,
              market_name: 'Error Fetching Market Name',
              contracts: [],
            });
          });
        fetchPromises.push(fetchPromise);
      });

      Promise.all(fetchPromises)
        .then(() => {
          res.send(marketsWithData);
        })
        .catch(error => {
          console.error('Error fetching favorite markets:', error.message);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(error => {
      console.error('Error fetching favorite markets:', error.message);
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
