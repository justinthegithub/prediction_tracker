import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MarketOverview() {
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    axios.get('/api/markets')
      .then(response => {
        const localMarketsData = response.data.markets;
        setMarkets(localMarketsData);
      })
      .catch(error => {
        console.error('Error fetching markets:', error);
      });
  }, []);

  const handleAddToFavorites = (marketId) => {
    axios.post('/api/favoriteMarkets', { market_id: marketId })
      .then(response => {
        console.log('Market added to favorites:', response.data);
      })
      .catch(error => {
        console.error('Error adding market to favorites:', error);
      });
  };

  return (
    <div className="container">
      <h1 className="my-4">Market Overview</h1>
      <ul className="list-group">
        {markets.length > 0 ? markets.map(market => (
          <li key={market.id} className="list-group-item">
            <h2>{market.name}</h2>
            <p>Market ID: {market.id}</p>
            <button
              className="btn btn-primary"
              onClick={() => handleAddToFavorites(market.id)}
            >
              Add to Favorites
            </button>
          </li>
        )) : <p>No markets available</p>}
      </ul>
    </div>
  );
}

export default MarketOverview;
