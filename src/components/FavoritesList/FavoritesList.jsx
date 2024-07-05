import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FavoritesList() {
  const [username, setUsername] = useState('');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);
  const [bankroll, setBankroll] = useState(5);
  const [newBankroll, setNewBankroll] = useState('');
  const [betPercentage, setBetPercentage] = useState(3);
  const [kellyAdjustment, setKellyAdjustment] = useState(0.00);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});

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
    fetchNotes(); // Fetch notes when component mounts
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

  const fetchNotes = () => {
    axios.get('/api/marketNotes')
      .then(response => {
        const notesData = response.data.reduce((acc, note) => {
          acc[note.favorite_market_id] = note.note_body;
          return acc;
        }, {});
        setNotes(notesData);
      })
      .catch(error => {
        console.log('Problem with fetching notes', error);
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

  const handleAddOrUpdateNote = (marketId) => {
    axios.post('/api/marketNotes', { favorite_market_id: marketId, note_body: newNote[marketId] || '' })
      .then(response => {
        setNotes(prevNotes => ({
          ...prevNotes,
          [marketId]: response.data.note_body
        }));
        setNewNote(prevNewNote => ({
          ...prevNewNote,
          [marketId]: ''
        }));
      })
      .catch(error => {
        console.log('Problem with adding or updating note', error);
      });
  };

  const fixedFractionalBet = (percentage) => {
    return bankroll * (percentage / 100);
  };

  const kellyBet = (probability, odds) => {
    if (probability <= 0 || probability >= 1 || odds <= 0) {
      return 0;
    }
    const kellyFraction = ((probability * (odds + 1) - 1) / odds) + kellyAdjustment;
    const scaledKelly = bankroll * kellyFraction * (betPercentage / 100);
    return Math.max(scaledKelly, 0);
  };

  const calculateOdds = (price) => {
    if (price <= 0 || price >= 1) {
      return 0;
    }
    return (1 / price) - 1;
  };

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
        <p>Fixed Fraction Bet: ${fixedFractionalBet(betPercentage).toFixed(2)}</p>
      </div>
      <div className="mb-3">
        <h2>Kelly Adjustment:</h2>
        <input
          type="number"
          value={kellyAdjustment}
          onChange={(e) => setKellyAdjustment(parseFloat(e.target.value))}
          placeholder="Enter Kelly adjustment"
          className="form-control"
        />
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
                    <th style={tableCellStyle}>Yes</th>
                    <th style={tableCellStyle}>No</th>
                    <th style={tableCellStyle}>Kelly Bet (Yes)</th>
                    <th style={tableCellStyle}>Kelly Bet (No)</th>
                  </tr>
                </thead>
                <tbody>
                  {favorite.contracts.map((contract) => {
                    const yesProbability = contract.bestBuyYesCost / 100;
                    const noProbability = contract.bestBuyNoCost / 100;
                    const yesOdds = calculateOdds(yesProbability);
                    const noOdds = calculateOdds(noProbability);
                    const kellyBetYes = kellyBet(yesProbability, yesOdds).toFixed(2);
                    const kellyBetNo = kellyBet(noProbability, noOdds).toFixed(2);

                    return (
                      <tr key={`${contract.id}-${favorite.market_id}`}>
                        <td style={tableCellStyle}>{contract.name}</td>
                        <td style={tableCellStyle}>{contract.bestBuyYesCost}</td>
                        <td style={tableCellStyle}>{contract.bestBuyNoCost}</td>
                        <td style={tableCellStyle}>{isNaN(kellyBetYes) ? '-' : `$${kellyBetYes}`}</td>
                        <td style={tableCellStyle}>{isNaN(kellyBetNo) ? '-' : `$${kellyBetNo}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div className="mt-3">
              <h3>Notes:</h3>
              <textarea
                value={newNote[favorite.market_id] || notes[favorite.market_id] || ''}
                onChange={(e) => setNewNote(prevNewNote => ({
                  ...prevNewNote,
                  [favorite.market_id]: e.target.value
                }))}
                placeholder="Add a note"
                className="form-control"
              />
              <button className="btn btn-primary mt-2" onClick={() => handleAddOrUpdateNote(favorite.market_id)}>
                Save Note
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoritesList;
