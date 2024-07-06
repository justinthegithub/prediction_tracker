const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5001;
const axios = require('axios');
const cors = require('cors');

// Middleware Includes
const sessionMiddleware = require('./modules/session-middleware');
const passport = require('./strategies/user.strategy');

// Route Includes
const userRouter = require('./routes/user.router');
const favoriteMarketsRouter = require('./routes/favoriteMarkets.router');
const bankrollRouter = require('./routes/bankroll.router');
const marketNotesRouter = require('./routes/marketNotes.router'); // Import the market notes router

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('build'));

// Passport Session Configuration
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/user', userRouter);
app.use('/api/favoriteMarkets', favoriteMarketsRouter);
app.use('/api/bankroll', bankrollRouter);
app.use('/api/marketNotes', marketNotesRouter); // Ensure this is correctly included

app.get('/api/markets', async (req, res) => {
  try {
    const response = await axios.get('https://www.predictit.org/api/marketdata/all/');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching data from PredictIt API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Listen Server & Port
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
