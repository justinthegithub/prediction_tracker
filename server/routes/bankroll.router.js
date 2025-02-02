const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();


//READ

//Checks the "User_Bankroll" table for a record with the current user's ID.
// If found, returns the bankroll data.
// If not found, returns a 404 status with a message.



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
// Extracts the bankroll value from the request body.
// Inserts a new record into the "User_Bankroll" table with the user's ID and bankroll amount.
// Returns the ID of the newly created bankroll record.

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

//UPDATE Extracts the bankroll value from the request body.
// - First checks if a bankroll record exists for the current user.
// - If a record exists, updates the bankroll amount.
// - If no record exists, inserts a new bankroll record.
// - Returns the ID of the updated or newly created bankroll record.








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
