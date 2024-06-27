const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require('axios');

router.get('/', (req, res) => {
  const queryText = `
    SELECT "Favorite_Markets".market_id, "Market_Notes".note_body 
    FROM "Favorite_Markets"
    LEFT JOIN "Market_Notes" ON "Favorite_Markets".id = "Market_Notes".favorite_market_id
    WHERE "Favorite_Markets".user_id = $1
  `;
  
  pool.query(queryText, [req.user.id])
    .then(result => {
      const promises = result.rows.map(favorite => {
        return axios.get(`https://www.predictit.org/api/marketdata/markets/${favorite.market_id}`)
          .then(marketResponse => {
            const marketData = marketResponse.data;
            favorite.market_name = marketData.name || 'Else Unknown Market';
          })
          .catch(() => {
            favorite.market_name = 'Error and so Unknown Market';
          });
      });

      Promise.all(promises)
        .then(() => {
          console.log('Favorite markets with names:', result.rows);
          res.send(result.rows);
        })
        .catch(error => {
          console.error('Error processing market data:', error.message);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(error => {
      console.error('Error fetching favorite markets:', error.message);
      res.status(500).send('Internal Server Error');
    });
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

module.exports = router;
