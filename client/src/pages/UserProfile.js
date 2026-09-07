import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile({ userId, onBack, onOpenChat, currentUserId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/users/${userId}`)
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [userId]);

    if (loading) return <div style={{ padding: 30 }}>Loading profile...</div>;
    if (!user) return <div style={{ padding: 30 }}>User not found</div>;

    return (
        <div className="app" style={{ maxWidth: '600px' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>⬅ Back</button>

            <div className="gradient-bg" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '100px' }}>👤</div>
                <h1>{user.name}</h1>
                <p>{user.department} • {user.semester} Semester</p>
                {user.bio && <p>{user.bio}</p>}
            </div>

            <div className="card">
                <h3>📧 Contact</h3>
                <p>Email: {user.email}</p>
                <p>Polytechnic: {user.polytechnicId?.name || 'N/A'}</p>
            </div>

            {user._id !== currentUserId && (
                <button
                    onClick={() => onOpenChat(user._id, user.name)}
                    style={{ width: '100%' }}
                >
                    💬 Message {user.name}
                </button>
            )}
        </div>
    );
}

export default UserProfile;