import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FavoritesList() {
  const [userId, setUserId] = useState(null); // Change to userId
  const [username, setUsername] = useState('');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);
  const [bankroll, setBankroll] = useState(5);  
  const [newBankroll, setNewBankroll] = useState('');
  const [betPercentage, setBetPercentage] = useState(3); 
  const [kellyAdjustment, setKellyAdjustment] = useState(0.00); 
  const [generalNotes, setGeneralNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteBody, setEditingNoteBody] = useState('');

  useEffect(() => {
    axios.get('/api/user')
      .then(response => {
        setUserId(response.data.id); // Ensure userId is set
        setUsername(response.data.username);
        fetchGeneralNotes(response.data.id); // Fetch general notes using userId
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting user data', error);
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

  const fetchGeneralNotes = (userId) => {
    axios.get(`/api/marketNotes/general/${userId}`)
      .then(response => {
        setGeneralNotes(response.data);
      })
      .catch(error => {
        console.log('Problem with fetching general notes', error);
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

  const handleAddNote = () => {
    if (!newNote) return;

    axios.post('/api/marketNotes/general', { user_id: userId, note_body: newNote })
      .then(response => {
        setGeneralNotes([...generalNotes, response.data]);
        setNewNote('');
      })
      .catch(error => {
        console.log('Problem with adding note', error);
      });
  };

  const handleEditNote = (noteId) => {
    setEditingNoteId(noteId);
    const note = generalNotes.find(note => note.id === noteId);
    if (note) {
      setEditingNoteBody(note.note_body);
    }
  };

  const handleSaveNote = (noteId) => {
    axios.put(`/api/marketNotes/general/${noteId}`, { note_body: editingNoteBody })
      .then(() => {
        fetchGeneralNotes(userId);
        setEditingNoteId(null);
        setEditingNoteBody('');
      })
      .catch(error => {
        console.log('Problem with editing note', error);
      });
  };

  const handleDeleteNote = (noteId) => {
    axios.delete(`/api/marketNotes/general/${noteId}`)
      .then(() => {
        fetchGeneralNotes(userId);
      })
      .catch(error => {
        console.log('Problem with deleting note', error);
      });
  };

  // This percentage will be the same for all markets. 
  const fixedFractionalBet = (percentage) => {
    return bankroll * (percentage / 100);
  };

  // This percentage should differ for each market according to price.  
  const kellyBet = (probability, odds) => {
    if (probability <= 0 || probability >= 1 || odds <= 0) {
      return 0;
    }
    const kellyFraction = ((probability * (odds + 1) - 1) / odds) + kellyAdjustment;
    const scaledKelly = bankroll * kellyFraction * (betPercentage / 100);
    return Math.max(scaledKelly, 0); 
  };

  // Treats the price as the probability
  // To improve accuracy 
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{username}'s favorites</h1>
        <button className="btn btn-danger" onClick={handleClearAllFavorites}>Clear All Favorites</button>
      </div>
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
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <h2>General Notes</h2>
        <ul className="list-group mb-3">
          {generalNotes.map((note) => (
            <li key={note.id} className="list-group-item">
              {editingNoteId === note.id ? (
                <div>
                  <textarea
                    value={editingNoteBody}
                    onChange={(e) => setEditingNoteBody(e.target.value)}
                    className="form-control"
                    maxLength={255}
                  />
                  <button className="btn btn-primary mt-2" onClick={() => handleSaveNote(note.id)}>Save</button>
                  <button className="btn btn-secondary mt-2 ml-2" onClick={() => setEditingNoteId(null)}>Cancel</button>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <span>{note.note_body}</span>
                  <div>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEditNote(note.id)}>Edit</button>
                    <button className="btn btn-danger btn-sm ml-2" onClick={() => handleDeleteNote(note.id)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note"
            className="form-control"
            maxLength={255}
          />
          <button className="btn btn-primary mt-2" onClick={handleAddNote}>Add Note</button>
        </div>
      </div>
    </div>
  );
}

export default FavoritesList;
