import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Community({ onBack }) {
    const { user } = useContext(AuthContext);
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [joinPassword, setJoinPassword] = useState('');
    const [joinError, setJoinError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false,
        password: ''
    });

    const loadCommunities = () => {
        axios.get('https://poly-community.onrender.com/api/communities')
            .then(res => setCommunities(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadCommunities();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('https://poly-community.onrender.com/api/communities', formData, {
                headers: { 'x-auth-token': token }
            });
            setFormData({ name: '', description: '', isPrivate: false, password: '' });
            setShowCreate(false);
            loadCommunities();
        } catch (err) {
            alert('Community creation failed');
        }
    };

    const handleJoin = async (communityId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`https://poly-community.onrender.com/api/communities/${communityId}/join`,
                { password: joinPassword },
                { headers: { 'x-auth-token': token } }
            );
            setSelectedCommunity(res.data);
            setShowJoin(false);
            setJoinPassword('');
            setJoinError('');
            loadCommunities();
        } catch (err) {
            setJoinError(err.response?.data?.msg || 'Join failed');
        }
    };

    const openCommunity = (community) => {
        setSelectedCommunity(community);
        if (community.isPrivate && !community.members.some(m => m._id === user?._id)) {
            setShowJoin(true);
        }
    };

    return (
        <div className="app" style={{ maxWidth: '800px' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>⬅ Back</button>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <h1>🏫 Communities</h1>
                <p>নিজের কমিউনিটি বানান বা অন্যদের কমিউনিটিতে যোগ দিন</p>
            </div>

            <button onClick={() => setShowCreate(!showCreate)} style={{ width: '100%', marginBottom: '15px' }}>
                ➕ Create Community
            </button>

            {showCreate && (
                <div className="card">
                    <h3>Create New Community</h3>
                    <form onSubmit={handleCreate}>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Community Name"
                            required
                        />
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description"
                            style={{ minHeight: '80px' }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={formData.isPrivate}
                                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                            />
                            Private Community (password required)
                        </label>
                        {formData.isPrivate && (
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Set Password"
                            />
                        )}
                        <button type="submit" style={{ width: '100%' }}>Create</button>
                    </form>
                </div>
            )}

            <div className="card">
                <h3>All Communities</h3>
                {communities.length === 0 && <p>No communities yet</p>}
                {communities.map(com => (
                    <div key={com._id}
                        onClick={() => openCommunity(com)}
                        style={{
                            padding: '15px', margin: '10px 0', background: 'var(--bg)',
                            borderRadius: '10px', cursor: 'pointer'
                        }}>
                        <strong>{com.name}</strong>
                        {com.isPrivate && <span style={{ marginLeft: '10px', color: '#f39c12' }}>🔒 Private</span>}
                        <p style={{ fontSize: '14px' }}>{com.description}</p>
                        <small>Members: {com.members?.length || 0}</small>
                    </div>
                ))}
            </div>

            {selectedCommunity && !showJoin && (
                <div className="card">
                    <h3>{selectedCommunity.name}</h3>
                    <p>{selectedCommunity.description}</p>
                    <strong>Members ({selectedCommunity.members?.length || 0})</strong>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedCommunity.members?.map(member => (
                            <li key={member._id} style={{ padding: '5px 0' }}>👤 {member.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showJoin && (
                <div className="card">
                    <h3>Enter Password to Join</h3>
                    <input
                        type="password"
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="Password"
                    />
                    {joinError && <p className="error-msg">{joinError}</p>}
                    <button onClick={() => handleJoin(selectedCommunity._id)}>Join Community</button>
                </div>
            )}
        </div>
    );
}

export default Community;