
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Notes({ userId }) {
  const [generalNotes, setGeneralNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteBody, setEditingNoteBody] = useState('');

  useEffect(() => {
    fetchGeneralNotes(userId);
  }, [userId]);

  const fetchGeneralNotes = (userId) => {
    axios.get(`/api/marketNotes/general/${userId}`)
      .then(response => {
        setGeneralNotes(response.data);
      })
      .catch(error => {
        console.log('Problem with fetching general notes', error);
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

  return (
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
  );
}

export default Notes;
