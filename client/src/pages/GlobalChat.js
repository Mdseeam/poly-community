import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

function GlobalChat({ onBack, onLogout }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [user, setUser] = useState(null);
    const socketRef = useRef();
    const messagesEndRef = useRef();
    const typingTimeoutRef = useRef();
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            }).then(res => {
                setUser(res.data);
                socketRef.current = io('http://localhost:5000');
                socketRef.current.emit('join_global_room', { id: res.data._id, name: res.data.name });

                socketRef.current.on('receive_message', (msg) => {
                    setMessages(prev => {
                        const updated = [...prev, msg];
                        localStorage.setItem('globalChat', JSON.stringify(updated.slice(-50)));
                        return updated;
                    });
                });

                socketRef.current.on('online_users', (users) => setOnlineUsers(users));

                socketRef.current.on('typing_users', (users) => {
                    const filtered = users.filter(u => u.id !== res.data._id);
                    setTypingUsers(filtered);
                });
            });
        }

        const saved = localStorage.getItem('globalChat');
        if (saved) setMessages(JSON.parse(saved));

        axios.get('http://localhost:5000/api/messages/global', {
            headers: { 'x-auth-token': token }
        }).then(res => {
            setMessages(res.data);
            localStorage.setItem('globalChat', JSON.stringify(res.data));
        }).catch(() => { });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;
        socketRef.current.emit('send_message', { senderId: user._id, content: input });
        socketRef.current.emit('stop_typing');
        setInput('');
    };

    const handleTyping = () => {
        if (user) {
            socketRef.current.emit('typing', { id: user._id, name: user.name });
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit('stop_typing');
            }, 2000);
        }
    };

    const getTypingText = () => {
        if (typingUsers.length === 0) return '';
        if (typingUsers.length === 1) return `${typingUsers[0].name} is typing...`;
        if (typingUsers.length === 2) return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
        return `${typingUsers.length} people are typing...`;
    };

    return (
        <div className="app" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button onClick={onBack}>⬅ Back</button>
            </div>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <h1>💬 Global Chat</h1>
                <p>সব পলিটেকনিকের শিক্ষার্থীরা এখানে কথা বলতে পারেন</p>
            </div>

            <div className="card" style={{ marginBottom: '10px' }}>
                <strong>🟢 Online Users ({onlineUsers.length})</strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {onlineUsers.map((u, i) => (
                        <span key={i} style={{
                            background: 'var(--accent)', color: 'white',
                            padding: '4px 12px', borderRadius: '20px', fontSize: '14px'
                        }}>
                            {u.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className="card" style={{
                height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.sender?._id === user?._id ? 'flex-end' : 'flex-start',
                        background: msg.sender?._id === user?._id ? 'var(--accent)' : 'var(--bg)',
                        color: msg.sender?._id === user?._id ? 'white' : 'var(--text)',
                        padding: '10px 15px', borderRadius: '15px', maxWidth: '70%'
                    }}>
                        <strong style={{ fontSize: '12px' }}>{msg.sender?.name}</strong>
                        <p>{msg.content}</p>
                        <small style={{ fontSize: '10px', opacity: 0.7 }}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                        </small>
                    </div>
                ))}
                {typingUsers.length > 0 && (
                    <p style={{ fontSize: '12px', opacity: 0.7, fontStyle: 'italic' }}>
                        {getTypingText()}
                    </p>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleTyping}
                    placeholder="মেসেজ লিখুন..."
                    style={{ flex: 1 }}
                />
                <button type="submit">পাঠান</button>
            </form>
        </div>
    );
}

export default GlobalChat;