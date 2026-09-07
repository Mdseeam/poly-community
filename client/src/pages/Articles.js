import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Articles({ onBack }) {
    const { user } = useContext(AuthContext);
    const [articles, setArticles] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const loadArticles = () => {
        axios.get('http://localhost:5000/api/articles').then(res => setArticles(res.data));
    };

    useEffect(() => { loadArticles(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('videoUrl', videoUrl);
        if (imageFile) formData.append('file', imageFile);

        if (editingId) {
            await axios.put(`http://localhost:5000/api/articles/${editingId}`, formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
            setEditingId(null);
        } else {
            await axios.post('http://localhost:5000/api/articles', formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
        }
        setTitle(''); setContent(''); setVideoUrl(''); setImageFile(null);
        loadArticles();
    };

    const startEdit = (art) => {
        setEditingId(art._id);
        setTitle(art.title);
        setContent(art.content);
        setVideoUrl(art.videoUrl || '');
    };

    const deleteArticle = async (id) => {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/articles/${id}`, {
            headers: { 'x-auth-token': token }
        });
        loadArticles();
    };

    const likeArticle = async (id) => {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/articles/${id}/like`, {}, {
            headers: { 'x-auth-token': token }
        });
        loadArticles();
    };

    return (
        <div className="app">
            <button onClick={onBack}>⬅ Back</button>
            <div className="gradient-bg"><h1>📝 Articles</h1></div>
            <div className="card">
                <h3>{editingId ? 'Edit Article' : 'Write Article'}</h3>
                <form onSubmit={handleSubmit}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required />
                    <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" />
                    <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="YouTube URL" />
                    <button type="submit">{editingId ? 'Save Changes' : 'Publish'}</button>
                </form>
            </div>
            <div className="card">
                {articles.map(art => (
                    <div key={art._id} style={{ margin: '10px 0', padding: '15px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                        {art.coverImage && <img src={`http://localhost:5000${art.coverImage}`} style={{ width: '100%', borderRadius: '10px' }} alt="" />}
                        <h3>{art.title}</h3>
                        <p>{art.content}</p>
                        {art.videoUrl && <iframe width="100%" height="315" src={art.videoUrl.replace('watch?v=', 'embed/')} title="video" />}
                        <small>By: {art.author?.name}</small>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => likeArticle(art._id)}>👍 {art.likes?.length || 0}</button>
                            {art.author?._id === user?._id && (
                                <>
                                    <button onClick={() => startEdit(art)}>✏️ Edit</button>
                                    <button onClick={() => deleteArticle(art._id)} style={{ background: '#dc3545' }}>🗑️ Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Articles;