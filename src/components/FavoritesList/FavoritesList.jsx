import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FavoritesList() {
  const [username, setUsername] = useState('');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);

  useEffect(() => {
    axios.get('/api/user')
      .then(response => {
        setUsername(response.data.username);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting username', error);
      });

    axios.get('/api/favoriteMarkets')
      .then(response => {
        setFavoriteMarkets(response.data);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting favorite markets', error);
      });
  }, []);

  return (
    <div>
      <h1>Favorites List</h1>
      <p>{username}'s List</p>
      <ul>
        {favoriteMarkets.map(favorite => (
          <li key={favorite.market_id}>
            Market ID: {favorite.market_id} - Placeholder - Note: {favorite.note_body}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoritesList;
