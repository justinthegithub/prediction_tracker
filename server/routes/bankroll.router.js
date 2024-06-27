const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

router.get('/', async (req, res) => {
  const queryText = 'SELECT * FROM "User_Bankroll" WHERE "user_id" = $1';
  try {
    const result = await pool.query(queryText, [req.user.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Bankroll not found');
    }
  } catch (error) {
    console.error('Error fetching bankroll:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', async (req, res) => {
  const { bankroll } = req.body;
  const queryText = `
    INSERT INTO "User_Bankroll" (user_id, bankroll)
    VALUES ($1, $2)
    RETURNING id
  `;
  try {
    const result = await pool.query(queryText, [req.user.id, bankroll]);
    res.status(201).json({ bankroll_id: result.rows[0].id });
  } catch (error) {
    console.error('Error adding bankroll:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/', async (req, res) => {
  const { bankroll } = req.body;

  const checkQuery = 'SELECT * FROM "User_Bankroll" WHERE "user_id" = $1';
  const insertQuery = `
    INSERT INTO "User_Bankroll" (user_id, bankroll)
    VALUES ($1, $2)
    RETURNING id
  `;
  const updateQuery = `
    UPDATE "User_Bankroll" SET bankroll = $2 WHERE user_id = $1
    RETURNING id
  `;

  try {
    const checkResult = await pool.query(checkQuery, [req.user.id]);

    let result;
    if (checkResult.rows.length > 0) {
      result = await pool.query(updateQuery, [req.user.id, bankroll]);
    } else {
      result = await pool.query(insertQuery, [req.user.id, bankroll]);
    }

    res.json({ bankroll_id: result.rows[0].id });
  } catch (error) {
    console.error('Error updating bankroll:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
