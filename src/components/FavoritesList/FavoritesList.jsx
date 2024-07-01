import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FavoritesList() {
  const [username, setUsername] = useState('');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);
  const [bankroll, setBankroll] = useState(5);
  const [newBankroll, setNewBankroll] = useState('');
  const [betPercentage, setBetPercentage] = useState(3); 
  useEffect(() => {
    axios.get('/api/user')
      .then(response => {
        setUsername(response.data.username);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting username', error);
      });

    fetchFavoriteMarkets();
    fetchBankroll();
  }, []);

  const fetchFavoriteMarkets = () => {
    axios.get('/api/favoriteMarkets')
      .then(response => {
        setFavoriteMarkets(response.data);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting favorite markets', error);
      });
  };

  const fetchBankroll = () => {
    axios.get('/api/bankroll')
      .then(response => {
        setBankroll(response.data.bankroll);
      })
      .catch(error => {
        console.log('Problem with fetching bankroll', error);
      });
  };

  const handleUpdateBankroll = () => {
    if (newBankroll) {
      axios.put('/api/bankroll', { bankroll: newBankroll })
        .then(() => {
          fetchBankroll();
          setNewBankroll('');
        })
        .catch(error => {
          console.log('Problem with updating bankroll', error);
        });
    }
  };

  const handleRemoveFromFavorites = (marketId) => {
    axios.delete(`/api/favoriteMarkets/${marketId}`)
      .then(() => {
        fetchFavoriteMarkets();
      })
      .catch(error => {
        console.error('Error removing market from favorites:', error);
      });
  };

  const handleClearAllFavorites = () => {
    axios.delete('/api/favoriteMarkets/all')
      .then(() => {
        fetchFavoriteMarkets();
      })
      .catch(error => {
        console.error('Error clearing all favorites:', error);
      });
  };

  const fixedFractionalBet = (percentage) => {
    return bankroll * (percentage / 100);
  };

  const betAmountYes = fixedFractionalBet(betPercentage).toFixed(2);
  const betAmountNo = fixedFractionalBet(betPercentage).toFixed(2);

  const tableCellStyle = {
    padding: '8px',
  };

  return (
    <div className="container">
      <h1>Favorites List</h1>
      <p>{username}'s List</p>
      <div className="mb-3">
        <h2>Bankroll: ${bankroll}</h2>
        <input
          type="number"
          value={newBankroll}
          onChange={(e) => setNewBankroll(e.target.value)}
          placeholder="Enter new bankroll amount"
          className="form-control"
        />
        <button className="btn btn-secondary mt-2" onClick={handleUpdateBankroll}>Update Bankroll</button>
      </div>
      <div className="mb-3">
        <h2>Bet Percentage:</h2>
        <input
          type="number"
          value={betPercentage}
          onChange={(e) => setBetPercentage(e.target.value)}
          placeholder="Enter bet percentage"
          className="form-control"
        />
        <p>Fixed Fraction Bet: Yes - ${betAmountYes}, No - ${betAmountNo}</p>
      </div>
      <button className="btn btn-danger mb-3" onClick={handleClearAllFavorites}>Clear All Favorites</button>
      <ul className="list-group">
        {favoriteMarkets.map((favorite) => (
          <li key={`${favorite.market_id}-${favorite.user_id}`} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <h2>{favorite.market_name}</h2>
              <button className="btn btn-secondary" onClick={() => handleRemoveFromFavorites(favorite.market_id)}>Remove from Favorites</button>
            </div>
            {favorite.contracts && favorite.contracts.length > 0 && (
              <table className="table mt-3" style={{ borderCollapse: 'separate', borderSpacing: '20px 5px' }}>
                <thead>
                  <tr>
                    <th style={tableCellStyle}>Contract Name</th>
                    <th style={tableCellStyle}>Yes </th>
                    <th style={tableCellStyle}>No </th>
                  </tr>
                </thead>
                <tbody>
                  {favorite.contracts.map((contract) => (
                    <tr key={`${contract.id}-${favorite.market_id}`}>
                      <td style={tableCellStyle}>{contract.name}</td>
                      <td style={tableCellStyle}>{contract.bestBuyYesCost}</td>
                      <td style={tableCellStyle}>{contract.bestBuyNoCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoritesList;
