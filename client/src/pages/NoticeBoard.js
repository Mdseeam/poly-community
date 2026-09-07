import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NoticeBoard({ communityId, onBack, onLogout }) {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const loadNotices = () => {
        if (communityId) {
            axios.get(`http://localhost:5000/api/notices/community/${communityId}`)
                .then(res => {
                    setNotices(res.data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    };

    useEffect(() => {
        loadNotices();
    }, [communityId]);

    const postNotice = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/notices', {
                title, content, communityId
            }, { headers: { 'x-auth-token': token } });
            setTitle('');
            setContent('');
            loadNotices();
        } catch (err) {
            alert('Failed to post notice');
        }
    };

    if (loading) return <div style={{ padding: 30 }}>Loading notices...</div>;

    return (
        <div className="app">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button onClick={onBack}>⬅ Back</button>
                <button onClick={onLogout} style={{ background: '#dc3545' }}>Logout</button>
            </div>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <h1>📋 Notice Board</h1>
                <p>কমিউনিটির নোটিশ</p>
            </div>

            <div className="card">
                <h3>Post New Notice</h3>
                <form onSubmit={postNotice}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice Title" required />
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Notice Content" required
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '10px', minHeight: '80px' }} />
                    <button type="submit">Post Notice</button>
                </form>
            </div>

            <div className="card">
                <h3>All Notices</h3>
                {notices.length === 0 && <p>No notices yet</p>}
                {notices.map(notice => (
                    <div key={notice._id} style={{ padding: '15px', margin: '10px 0', background: 'var(--bg)', borderRadius: '10px' }}>
                        <h4>{notice.title}</h4>
                        <p>{notice.content}</p>
                        <small>By: {notice.author?.name} | {new Date(notice.createdAt).toLocaleDateString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NoticeBoard;