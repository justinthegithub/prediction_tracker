import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MarketOverview() {
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    axios.get('/api/markets')
      .then(response => {
        console.log('Raw JSON response:', response.data);
        const marketsData = response.data.markets;
        setMarkets(marketsData);
      })
      .catch(error => {
        console.error('Error fetching markets:', error);
      });
  }, []);

  return (
    <div>
      <h1>Market Overview</h1>
      <ul id="market-list">
        {markets.length > 0 ? markets.map(market => (
          <li key={market.id}>
            <h2>{market.name}</h2>
            {/*
            <p><strong>Short Name:</strong> {market.shortName}</p>
            <a href={market.url} target="_blank" rel="noopener noreferrer">View Market</a>
            <ul>
              {market.contracts.map(contract => (
                <li key={contract.id}>
                  <h3>{contract.name}</h3>
                  <p><strong>Status:</strong> {contract.status}</p>
                  <p><strong>Last Trade Price:</strong> {contract.lastTradePrice}</p>
                  <p><strong>Best Buy Yes Cost:</strong> {contract.bestBuyYesCost}</p>
                  <p><strong>Best Buy No Cost:</strong> {contract.bestBuyNoCost}</p>
                  <p><strong>Best Sell Yes Cost:</strong> {contract.bestSellYesCost}</p>
                  <p><strong>Best Sell No Cost:</strong> {contract.bestSellNoCost}</p>
                  <p><strong>Last Close Price:</strong> {contract.lastClosePrice}</p>
                </li>
              ))}
            </ul>
            */}
          </li>
        )) : <p>No markets available</p>}
      </ul>
    </div>
  );
}

export default MarketOverview;
