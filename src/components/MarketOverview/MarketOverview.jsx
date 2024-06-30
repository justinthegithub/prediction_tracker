import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MarketOverview() {
  const [databaseMarkets, setDatabaseMarkets] = useState([]);
  const [apiMarkets, setApiMarkets] = useState([]);
  const [showApiMarkets, setShowApiMarkets] = useState(false); // default to false

  // Fetch data from the database on initial render
  useEffect(() => {
    const fetchDatabaseMarkets = async () => {
      try {
        const response = await axios.get('/api/markets');
        setDatabaseMarkets(response.data.markets);
      } catch (error) {
        console.error('Error fetching markets from database:', error);
        setDatabaseMarkets([]);
      }
    };

    fetchDatabaseMarkets();
  }, []);

  // Fetch data from the PredictIt API when showApiMarkets changes to true
  useEffect(() => {
    if (showApiMarkets) {
      const fetchApiMarkets = async () => {
        try {
          const response = await axios.get('https://www.predictit.org/api/marketdata/all/');
          setApiMarkets(response.data.markets);
        } catch (error) {
          console.error('Error fetching markets from PredictIt API:', error);
          setApiMarkets([]);
        }
      };

      fetchApiMarkets();
    }
  }, [showApiMarkets]);

  const handleAddToFavorites = (marketId) => {
    axios.post('/api/favoriteMarkets', { market_id: marketId })
      .then(response => {
        console.log('Market added to favorites:', response.data);
      })
      .catch(error => {
        console.error('Error adding market to favorites:', error);
      });
  };

  const toggleShowApiMarkets = () => {
    setShowApiMarkets(prevShowApiMarkets => !prevShowApiMarkets);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Market Overview</h1>
        <button className="btn btn-secondary" onClick={toggleShowApiMarkets}>
          {showApiMarkets ? 'Hide PredictIt Markets' : 'Show PredictIt Markets'}
        </button>
      </div>
      
      <h2>Database Markets</h2>
      <ul className="list-group mb-4">
        {databaseMarkets.length > 0 ? databaseMarkets.map(market => (
          <li key={market.id} className="list-group-item">
            <h3>{market.name}</h3>
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
      
      {showApiMarkets && (
        <>
          <h2>PredictIt API Markets</h2>
          <ul className="list-group">
            {apiMarkets.length > 0 ? apiMarkets.map(market => (
              <li key={market.id} className="list-group-item">
                <h3>{market.name}</h3>
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
        </>
      )}
    </div>
  );
}

export default MarketOverview;
