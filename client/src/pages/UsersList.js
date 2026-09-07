import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UsersList({ onBack, onOpenProfile, currentUserId }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    const loadUsers = (query = '') => {
        const url = query
            ? `http://localhost:5000/api/users/search?q=${query}`
            : 'http://localhost:5000/api/users';
        axios.get(url)
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        loadUsers(e.target.value);
    };

    return (
        <div className="app" style={{ maxWidth: '600px' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>⬅ Back</button>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <h1>👥 Find People</h1>
                <p>সব ইউজার দেখুন ও প্রোফাইল ভিজিট করুন</p>
            </div>

            <div className="card">
                <input
                    value={search}
                    onChange={handleSearch}
                    placeholder="নাম, ডিপার্টমেন্ট বা ইমেইল দিয়ে খুঁজুন..."
                />
            </div>

            <div className="card">
                {users.filter(u => u._id !== currentUserId).map(user => (
                    <div key={user._id}
                        onClick={() => onOpenProfile(user._id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '12px',
                            margin: '8px 0',
                            background: 'var(--bg)',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}>
                        <div style={{ fontSize: '40px' }}>👤</div>
                        <div>
                            <strong>{user.name}</strong>
                            <p style={{ fontSize: '14px' }}>{user.department} • {user.semester} Semester</p>
                            {user.bio && <small>{user.bio}</small>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UsersList;