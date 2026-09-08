import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Events({ onBack }) {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [editingEvent, setEditingEvent] = useState(null);

    const loadEvents = () => {
        axios.get('https://poly-community.onrender.com/api/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const createEvent = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('https://poly-community.onrender.com/api/events', { title, description, date },
                { headers: { 'x-auth-token': token } });
            setTitle(''); setDescription(''); setDate('');
            loadEvents();
        } catch (err) {
            alert('Failed to create event');
        }
    };

    const startEdit = (event) => {
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description);
        setDate(event.date?.split('T')[0]);
    };

    const saveEdit = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`https://poly-community.onrender.com/api/events/${editingEvent._id}`,
                { title, description, date },
                { headers: { 'x-auth-token': token } });
            setEditingEvent(null);
            setTitle(''); setDescription(''); setDate('');
            loadEvents();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to edit event');
        }
    };

    const deleteEvent = async (id) => {
        const token = localStorage.getItem('token');
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            const res = await axios.delete(`https://poly-community.onrender.com/api/events/${id}`, {
                headers: { 'x-auth-token': token }
            });
            alert(res.data.msg || 'Deleted');
            loadEvents();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to delete');
        }
    };

    return (
        <div className="app" style={{ maxWidth: '800px' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>⬅ Back</button>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <h1>📅 Events</h1>
                <p>Create, edit, delete events</p>
            </div>

            <div className="card">
                <h3>{editingEvent ? '✏️ Edit Event' : '➕ Create Event'}</h3>
                <form onSubmit={editingEvent ? (e) => { e.preventDefault(); saveEdit(); } : createEvent}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    <button type="submit">{editingEvent ? 'Save Changes' : 'Create'}</button>
                    {editingEvent && (
                        <button type="button" onClick={() => {
                            setEditingEvent(null);
                            setTitle(''); setDescription(''); setDate('');
                        }} style={{ background: '#6c757d', marginLeft: '10px' }}>
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            <div className="card">
                <h3>Upcoming Events</h3>
                {events.length === 0 && <p>No events yet</p>}
                {events.map(ev => (
                    <div key={ev._id} style={{ padding: '15px', margin: '10px 0', background: 'var(--bg)', borderRadius: '10px' }}>
                        <h4>{ev.title}</h4>
                        <p>{ev.description}</p>
                        <small>📅 {new Date(ev.date).toLocaleDateString()}</small>
                        <p><small>By: {ev.createdBy?.name}</small></p>

                        {ev.createdBy?._id === user?._id && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => startEdit(ev)}>✏️ Edit</button>
                                <button onClick={() => deleteEvent(ev._id)} style={{ background: '#dc3545' }}>🗑️ Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Events;