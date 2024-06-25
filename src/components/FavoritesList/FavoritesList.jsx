import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';



function FavoritesList() {
const [username, setUsername] =useState('');

useEffect(()=>{
    axios.get('/api/user')
    .then(response=>{
        setUsername(response.data.username)
    })
    .catch(error=>{
        console.log('Problem with FavoritesList getting username', error)
    });
}, []);


    return (
        <div>
            <h1>Favorites List</h1>
            <p>{username}'s List</p>
        </div>
    )
}

export default FavoritesList