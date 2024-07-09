import './AboutPage.css';

import React from 'react';

// This is one of our simplest components
// It doesn't have local state,
// It doesn't dispatch any redux actions or display any part of redux state
// or even care what the redux state is'

function AboutPage() {
  return (
    <div className="container">
      <div>
        <h1>Prediction Market Tracker</h1>
        <p>
          This app helps you track and analyze prediction markets. Use it to monitor events, make informed bets, and calculate potential outcomes.
        </p>

        <h1>What are Prediction Markets?</h1>
        <p>
          Prediction markets are platforms where people trade contracts based on the outcome of future events. The price of these contracts reflects the crowd's collective wisdom about the likelihood of the event occurring.
        </p>

        <h1>Why Use Prediction Markets?</h1>
        <ul>
          <li><strong>Gather Insights:</strong> Access collective opinions on various events.</li>
          <li><strong>Make Informed Decisions:</strong> Use market trends to guide your choices.</li>
          <li><strong>Profit Potential:</strong> Earn money by making accurate predictions.</li>
        </ul>
      </div>
    </div>
  );
}

export default AboutPage;

