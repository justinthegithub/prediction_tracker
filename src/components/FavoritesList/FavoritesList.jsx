import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FavoritesList() {
  const [username, setUsername] = useState('');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);
  const [bankroll, setBankroll] = useState(0);
  const [newBankroll, setNewBankroll] = useState('');

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

  const calculateKellyCriterion = (winProbability, odds) => {
    if (!winProbability || !odds || bankroll <= 0) return "NOT A KELLY BET";
    const fStar = (winProbability * (odds - 1) - (1 - winProbability)) / odds;
    const kellyBet = bankroll * fStar;
    if (isNaN(kellyBet)) return "NOT A KELLY BET";
    return kellyBet;
  };

  const displayKellyBet = (kellyBet) => {
    if (typeof kellyBet === 'string' || kellyBet < 0) {
      return `${kellyBet} (NOT A KELLY BET)`;
    }
    return `$${kellyBet.toFixed(2)}`;
  };

  return (
    <div>
      <h1>Favorites List</h1>
      <p>{username}'s List</p>
      <div>
        <h2>Bankroll: ${bankroll}</h2>
        <input
          type="number"
          value={newBankroll}
          onChange={(e) => setNewBankroll(e.target.value)}
          placeholder="Enter new bankroll amount"
        />
        <button onClick={handleUpdateBankroll}>Update Bankroll</button>
      </div>
      <ul>
        {favoriteMarkets.map((favorite) => (
          <li key={favorite.market_id}>
            <h2>Market Name: {favorite.market_name}</h2>
            <button onClick={() => handleRemoveFromFavorites(favorite.market_id)}>Remove from Favorites</button>
            {favorite.contracts && favorite.contracts.length > 0 && (
              <div>
                <h3>Contracts</h3>
                <ul>
                  {favorite.contracts.map((contract) => {
                    const winProbabilityYes = contract.bestBuyYesCost; // Assuming this value is a proxy for probability
                    const oddsYes = 1 / contract.bestBuyYesCost;
                    const winProbabilityNo = 1 - contract.bestBuyYesCost;
                    const oddsNo = 1 / contract.bestBuyNoCost;

                    const kellyBetYes = calculateKellyCriterion(winProbabilityYes, oddsYes);
                    const kellyBetNo = calculateKellyCriterion(winProbabilityNo, oddsNo);

                    return (
                      <li key={contract.id}>
                        <p>Name: {contract.name}</p>
                        <p>Best Buy Yes Cost: {contract.bestBuyYesCost} (Kelly Bet: {displayKellyBet(kellyBetYes)})</p>
                        <p>Best Buy No Cost: {contract.bestBuyNoCost} (Kelly Bet: {displayKellyBet(kellyBetNo)})</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoritesList;
