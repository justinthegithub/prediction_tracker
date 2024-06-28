const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const axios = require('axios');

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

module.exports = router;
