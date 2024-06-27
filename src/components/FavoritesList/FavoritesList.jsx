import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FavoritesList() {
  const [username, setUsername] = useState('');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    axios.get('/api/user')
      .then(response => {
        setUsername(response.data.username);
        console.log('Username:', response.data.username);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting username', error);
      });

    fetchFavoriteMarkets();
  }, []);

  const fetchFavoriteMarkets = () => {
    axios.get('/api/favoriteMarkets')
      .then(response => {
        setFavoriteMarkets(response.data);
        console.log('Favorite markets:', response.data);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting favorite markets', error);
      });
  };

  const handleNoteChange = (marketId, note) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [marketId]: note,
    }));
  };

  const handleAddNote = (favoriteMarketId) => {
    const note = notes[favoriteMarketId];
    if (note) {
      axios.post('/api/marketNotes', { favorite_market_id: favoriteMarketId, note_body: note })
        .then(response => {
          console.log('Note added:', response.data);
          setFavoriteMarkets(prevMarkets => prevMarkets.map(market => {
            if (market.market_id === favoriteMarketId) {
              return { ...market, notes: [...(market.notes || []), response.data.note_body] };
            }
            return market;
          }));
          setNotes(prevNotes => ({
            ...prevNotes,
            [favoriteMarketId]: '',
          }));
        })
        .catch(error => {
          console.log('Problem with adding note', error);
        });
    }
  };

  const handleRemoveFromFavorites = (marketId) => {
    axios.delete(`/api/favoriteMarkets/${marketId}`)
      .then(() => {
        setFavoriteMarkets(prevFavorites => prevFavorites.filter(market => market.market_id !== marketId));
        console.log('Market removed from favorites:', marketId);
      })
      .catch(error => {
        console.error('Error removing market from favorites:', error);
      });
  };

  return (
    <div>
      <h1>Favorites List</h1>
      <p>{username}'s List</p>
      <ul>
        {favoriteMarkets.map((favorite) => (
          <li key={favorite.market_id}>
            <h2>Market Name: {favorite.market_name}</h2>
            {favorite.notes && favorite.notes.length > 0 && (
              <ul>
                {favorite.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            )}
            <input 
              type="text"
              value={notes[favorite.market_id] || ''}
              onChange={(e) => handleNoteChange(favorite.market_id, e.target.value)}
              placeholder="Enter new note"
            />
            <button onClick={() => handleAddNote(favorite.market_id)}>Add Note</button>
            <button onClick={() => handleRemoveFromFavorites(favorite.market_id)}>Remove from Favorites</button>
            {favorite.contracts && favorite.contracts.length > 0 && (
              <div>
                <h3>Contracts</h3>
                <ul>
                  {favorite.contracts.map((contract) => (
                    <li key={contract.id}>
                      <p>Name: {contract.name}</p>
                      <p>Best Buy Yes Cost: {contract.bestBuyYesCost}</p>
                      <p>Best Buy No Cost: {contract.bestBuyNoCost}</p>
                    </li>
                  ))}
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
