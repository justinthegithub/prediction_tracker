import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MarketOverview() {
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    axios.get('/api/markets')
      .then(response => {
        const marketsData = response.data.markets;
        setMarkets(marketsData);
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

  const handleRemoveFromFavorites = (marketId) => {
    axios.delete(`/api/favoriteMarkets/${marketId}`)
      .then(() => {
        setMarkets(markets.filter(market => market.id !== marketId));
      })
      .catch(error => {
        console.error('Error removing market from favorites:', error);
      });
  };

  return (
    <div>
      <h1>Market Overview</h1>
      <ul id="market-list">
        {markets.length > 0 ? markets.map(market => (
          <li key={market.id}>
            <h2>{market.name}</h2>
            <p>Market ID: {market.id}</p>
            <button onClick={() => handleAddToFavorites(market.id)}>Add to Favorites</button>
            <button onClick={() => handleRemoveFromFavorites(market.id)}>Remove from Favorites</button>
          </li>
        )) : <p>No markets available</p>}
      </ul>
    </div>
  );
}

export default MarketOverview;

