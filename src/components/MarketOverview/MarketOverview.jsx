import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MarketOverview() {
  const [databaseMarkets, setDatabaseMarkets] = useState([]);
  const [apiMarkets, setApiMarkets] = useState([]);
  const [showApiMarkets, setShowApiMarkets] = useState(false);
  const [showDatabaseMarkets, setShowDatabaseMarkets] = useState(true);

  useEffect(() => {
    if (showDatabaseMarkets) {
      axios.get('/api/markets')
        .then(response => {
          setDatabaseMarkets(response.data.markets);
        })
        .catch(error => {
          console.log('MarketOverview.jsx is not able to fetch market data', error);
          setDatabaseMarkets([]);
        });
    }
  }, [showDatabaseMarkets]);

  const fetchApiMarkets = () => {
    if (!showApiMarkets) {
      axios.get('https://manifold.markets/api/v0/markets')
        .then(response => {
          setApiMarkets(response.data);
          setShowApiMarkets(true);
        })
        .catch(error => {
          console.log('MarketOverview.jsx is not able to fetch market data from Manifold Api', error);
          setApiMarkets([]);
        });
    } else {
      setShowApiMarkets(false);
    }
  };

  const handleAddToFavorites = (marketId) => {
    axios.post('/api/favoriteMarkets', { market_id: marketId })
      .then(response => {
        console.log('Markets added to favorites:', response.data);
      })
      .catch(error => {
        console.log('MarketOverview.jsx was not able to add market to favorites', error);
      });
  };

  const toggleShowDatabaseMarkets = () => {
    setShowDatabaseMarkets(prevShowDatabaseMarkets => !prevShowDatabaseMarkets);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Market Overview</h1>
        <div>
          <button className="btn btn-secondary mr-2" onClick={toggleShowDatabaseMarkets}>
            {showDatabaseMarkets ? 'Hide Database Markets' : 'Show Database Markets'}
          </button>
          <button className="btn btn-secondary" onClick={fetchApiMarkets}>
            {showApiMarkets ? 'Hide Manifold Markets' : 'Browse Manifold Markets'}
          </button>
        </div>
      </div>
      
      {showDatabaseMarkets && (
        <>
          <h2>Database Markets</h2>
          <ul className="list-group mb-4">
            {databaseMarkets.length > 0 ? databaseMarkets.map(market => (
              <li key={market.id} className="list-group-item">
                <h3>{market.name}</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToFavorites(market.id)}
                >
                  Add to Favorites
                </button>
              </li>
            )) : <p>No markets available</p>}
          </ul>
        </>
      )}

      {showApiMarkets && (
        <>
          <h2>Manifold Markets</h2>
          <ul className="list-group">
            {apiMarkets.length > 0 ? apiMarkets.map(market => (
              <li key={market.id} className="list-group-item">
                <h3>
                  <a href={`https://manifold.markets/${market.creatorUsername}/${market.slug}`} target="_blank" rel="noopener noreferrer">
                    {market.question}
                  </a>
                </h3>
              </li>
            )) : <p>No markets available</p>}
          </ul>
        </>
      )}
    </div>
  );
}

export default MarketOverview;
