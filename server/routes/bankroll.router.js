const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();


//Read
router.get('/', (req, res) => {
  const queryText = `SELECT * FROM "User_Bankroll" WHERE "user_id" = $1`;
  pool.query(queryText, [req.user.id])
    .then(result => {
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).send('No record of a bankroll');
      }
    })
    .catch(error => {
      console.log('Problem fetching bankroll from bankroll.router.js', error.message);
      res.status(500).send('Internal Server Error');
    });
});

//create

router.post('/', (req, res) => {
  const { bankroll } = req.body;
  const queryText = `
    INSERT INTO "User_Bankroll" (user_id, bankroll)
    VALUES ($1, $2)
    RETURNING id
  `;
  pool.query(queryText, [req.user.id, bankroll])
    .then(result => {
      res.status(201).json({ bankroll_id: result.rows[0].id });
    })
    .catch(error => {
      console.log('Problem adding bankroll from bankroll.router.js', error.message);
      res.status(500).send();
    });
});

//UPDATE
router.put('/', (req, res) => {
  const { bankroll } = req.body;

  const queryCheck = `SELECT * FROM "User_Bankroll" WHERE "user_id" = $1`;
  const insertQuery = `
    INSERT INTO "User_Bankroll" (user_id, bankroll)
    VALUES ($1, $2)
    RETURNING id
  `;
  const updateQuery = `
    UPDATE "User_Bankroll" SET bankroll = $2 WHERE user_id = $1
    RETURNING id
  `;

//If bankroll exists, update
//else insert banrkoll 


  pool.query(queryCheck, [req.user.id])
    .then(checkResult => {
      if (checkResult.rows.length > 0) {
        return pool.query(updateQuery, [req.user.id, bankroll]);
      } else {
        return pool.query(insertQuery, [req.user.id, bankroll]);
      }
    })
    .then(result => {
      res.json({ bankroll_id: result.rows[0].id });
    })
    .catch(error => {
      console.log('Problem updating bankroll from bankroll.router.js', error.message);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = router;
