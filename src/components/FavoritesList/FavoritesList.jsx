import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FavoritesList() {
  const [username, setUsername] = useState('');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    axios.get('/api/user')
      .then(response => {
        setUsername(response.data.username);
        console.log('Username:', response.data.username);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting username', error);
      });

    axios.get('/api/favoriteMarkets')
      .then(response => {
        setFavoriteMarkets(response.data);
        console.log('Favorite markets:', response.data);
      })
      .catch(error => {
        console.log('Problem with FavoritesList getting favorite markets', error);
      });
  }, []);

const handleAddNote=()=>{
    console.log("New Note added", newNote)
}


  return (
    <div>
      <h1>Favorites List</h1>
      <p>{username}'s List</p>
      <ul>
        {favoriteMarkets.map((favorite, index) => (
          <li key={`${favorite.market_id}-${index}`}>
            Market Name: {favorite.market_name} - Note: {favorite.note_body}
            <input 
        type="text"
        value={newNote}
        onChange= {(event)=>setNewNote(event.target.value)}
        />
        <button onClick={handleAddNote}>Add Note</button>

          </li>
        ))}
      </ul>


    </div>
  );
}

export default FavoritesList;
