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

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('build'));

// Passport Session Configuration
app.use(sessionMiddleware);

// Start Passport Sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/user', userRouter);

// Add the Proxy Route
app.get('/api/markets', cors(), async (req, res) => {
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
