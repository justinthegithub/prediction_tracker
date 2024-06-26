const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

router.get('/', (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT "Favorite_Markets".market_id, "Market_Notes".note_body
    FROM "Favorite_Markets"
    JOIN "Market_Notes" ON "Favorite_Markets".id = "Market_Notes".favorite_market_id
    WHERE "Favorite_Markets".user_id = $1;
  `;

  pool.query(query, [userId])
    .then(result => {
      res.json(result.rows);
    })
    .catch(error => {
      console.log("Problem getting favorite markets and notes", error.message);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = router;
