import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Inbox({ onBack, onOpenChat }) {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:5000/api/messages/inbox', {
            headers: { 'x-auth-token': token }
        })
            .then(res => {
                setConversations(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 30 }}>Loading messages...</div>;

    return (
        <div className="app" style={{ maxWidth: '600px' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>⬅ Back</button>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <h1>📥 Messages</h1>
                <p>আপনার কথোপকথন</p>
            </div>

            <div className="card">
                {conversations.length === 0 && <p>No messages yet</p>}
                {conversations.map(conv => (
                    <div key={conv.user._id}
                        onClick={() => onOpenChat(conv.user._id, conv.user.name)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '15px',
                            margin: '8px 0',
                            background: 'var(--bg)',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}>
                        <div style={{ fontSize: '40px' }}>👤</div>
                        <div style={{ flex: 1 }}>
                            <strong>{conv.user.name}</strong>
                            <p style={{ fontSize: '14px', margin: '5px 0 0' }}>{conv.lastMessage}</p>
                        </div>
                        <small>{new Date(conv.updatedAt).toLocaleTimeString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Inbox;