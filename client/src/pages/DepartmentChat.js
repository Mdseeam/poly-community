import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

function DepartmentChat({ onBack }) {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState(user?.department || 'Computer');
    const [selectedSemester, setSelectedSemester] = useState(user?.semester || '1st');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const socketRef = useRef();
    const messagesEndRef = useRef();

    const departments = [
        'Computer', 'Electrical', 'Mechanical', 'Electronics',
        'Electromedical', 'Survey', 'Architecture', 'Civil',
        'Power', 'Automobile', 'Textile', 'Chemical',
        'Agriculture', 'Marine', 'Aerospace'
    ];

    const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_department_room', {
            userId: user?._id,
            name: user?.name,
            department: selectedDepartment,
            semester: selectedSemester
        });

        socketRef.current.on('receive_department_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socketRef.current.on('department_online_users', (users) => {
            setOnlineUsers(users);
        });

        socketRef.current.on('department_typing_users', (users) => {
            const filtered = users.filter(u => u.id !== user?._id);
            setTypingUsers(filtered);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [selectedDepartment, selectedSemester, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;
        socketRef.current.emit('send_department_message', {
            senderId: user._id,
            content: input,
            department: selectedDepartment,
            semester: selectedSemester
        });
        setInput('');
    };

    const handleTyping = () => {
        socketRef.current.emit('department_typing', {
            id: user._id,
            name: user.name,
            department: selectedDepartment,
            semester: selectedSemester
        });
    };

    const getTypingText = () => {
        if (typingUsers.length === 0) return '';
        if (typingUsers.length === 1) return `${typingUsers[0].name} is typing...`;
        if (typingUsers.length === 2) return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
        return `${typingUsers.length} people are typing...`;
    };

    return (
        <div className="app" style={{ maxWidth: '800px' }}>
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={onBack}>⬅ Back</button>
            </div>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <h1>🏫 Department Chat</h1>
                <p>{selectedDepartment} - {selectedSemester} Semester</p>
            </div>

            <div className="card" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label style={{ fontWeight: '600' }}>Department</label>
                        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontWeight: '600' }}>Semester</label>
                        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '10px' }}>
                <strong>🟢 Online in this room ({onlineUsers.length})</strong>
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
                height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'
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
                <input value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleTyping} placeholder="মেসেজ লিখুন..." style={{ flex: 1 }} />
                <button type="submit">পাঠান</button>
            </form>
        </div>
    );
}

export default DepartmentChat;