import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function PrivateChat({ receiverId, receiverName, onBack }) {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io('https://poly-community.onrender.com');

        axios.get(`https://poly-community.onrender.com/api/messages/private/${receiverId}`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        }).then(res => setMessages(res.data));

        socketRef.current.emit('join_private', { userId: user?._id });

        socketRef.current.on('receive_private', (msg) => {
            if (
                (msg.sender === user?._id && msg.receiver === receiverId) ||
                (msg.sender === receiverId && msg.receiver === user?._id)
            ) {
                setMessages(prev => [...prev, msg]);
            }
        });

        return () => socketRef.current.disconnect();
    }, [receiverId, user]);

    const send = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        socketRef.current.emit('send_private', {
            senderId: user?._id,
            receiverId,
            content: input
        });
        setInput('');
    };

    const startEdit = (msg) => {
        setEditingMsgId(msg._id);
        setEditContent(msg.content);
    };

    const saveEdit = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`https://poly-community.onrender.com/api/messages/private/${id}`,
                { content: editContent },
                { headers: { 'x-auth-token': token } }
            );
            setEditingMsgId(null);
            const res = await axios.get(`https://poly-community.onrender.com/api/messages/private/${receiverId}`, {
                headers: { 'x-auth-token': token }
            });
            setMessages(res.data);
        } catch (err) {
            alert('Edit failed');
        }
    };

    const deleteMsg = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`https://poly-community.onrender.com/api/messages/private/${id}`, {
                headers: { 'x-auth-token': token }
            });
            const res = await axios.get(`https://poly-community.onrender.com/api/messages/private/${receiverId}`, {
                headers: { 'x-auth-token': token }
            });
            setMessages(res.data);
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <div className="app" style={{ maxWidth: '600px' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>⬅ Back</button>

            <div className="gradient-bg">
                <h1>💬 {receiverName}</h1>
            </div>

            <div className="card" style={{ height: '400px', overflowY: 'auto', marginTop: '15px' }}>
                {messages.map(msg => (
                    <div key={msg._id} style={{ textAlign: msg.sender === user?._id ? 'right' : 'left', margin: '10px 0' }}>
                        {editingMsgId === msg._id ? (
                            <div>
                                <input
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    style={{ display: 'inline-block', width: '70%' }}
                                />
                                <button onClick={() => saveEdit(msg._id)} style={{ marginRight: '5px' }}>Save</button>
                                <button onClick={() => setEditingMsgId(null)} style={{ background: '#6c757d' }}>Cancel</button>
                            </div>
                        ) : (
                            <div>
                                <p style={{
                                    display: 'inline-block',
                                    background: msg.sender === user?._id ? 'var(--accent)' : 'var(--bg)',
                                    color: msg.sender === user?._id ? 'white' : 'var(--text)',
                                    padding: '10px 15px',
                                    borderRadius: '15px',
                                    maxWidth: '70%',
                                    margin: '0'
                                }}>
                                    {msg.content}
                                    {msg.isEdited && (
                                        <small style={{ marginLeft: '5px', opacity: 0.7, fontSize: '10px' }}>
                                            (edited)
                                        </small>
                                    )}
                                </p>
                                {msg.sender === user?._id && (
                                    <div style={{ marginTop: '5px' }}>
                                        <button
                                            onClick={() => startEdit(msg)}
                                            style={{ fontSize: '12px', padding: '3px 8px', marginRight: '5px' }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => deleteMsg(msg._id)}
                                            style={{ fontSize: '12px', padding: '3px 8px', background: '#dc3545' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={send} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="মেসেজ লিখুন..."
                    style={{ flex: 1 }}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default PrivateChat;