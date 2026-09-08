import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Articles({ onBack }) {
    const { user } = useContext(AuthContext);
    const [articles, setArticles] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        axios.get('https://poly-community.onrender.com/api/articles')
            .then(res => setArticles(res.data));
    }, []);

    const createArticle = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post('https://poly-community.onrender.com/api/articles',
            { title, content, coverImage, videoUrl },
            { headers: { 'x-auth-token': token } });
        setTitle(''); setContent(''); setCoverImage(''); setVideoUrl('');
        const res = await axios.get('https://poly-community.onrender.com/api/articles');
        setArticles(res.data);
    };

    const likeArticle = async (id) => {
        const token = localStorage.getItem('token');
        await axios.put(`https://poly-community.onrender.com/api/articles/${id}/like`, {},
            { headers: { 'x-auth-token': token } });
        const res = await axios.get('https://poly-community.onrender.com/api/articles');
        setArticles(res.data);
    };

    return (
        <div className="app">
            <button onClick={onBack}>⬅ Back</button>
            <div className="gradient-bg"><h1>📝 Articles</h1></div>
            <div className="card">
                <h3>Write Article</h3>
                <form onSubmit={createArticle}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required />
                    <input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="Cover Image URL" />
                    <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="YouTube URL" />
                    <button type="submit">Publish</button>
                </form>
            </div>
            <div className="card">
                {articles.map(art => (
                    <div key={art._id} style={{ margin: '10px 0', border: '1px solid var(--border)', borderRadius: '10px', padding: '15px' }}>
                        {art.coverImage && <img src={art.coverImage} style={{ width: '100%', borderRadius: '10px' }} alt="" />}
                        <h3>{art.title}</h3>
                        <p>{art.content}</p>
                        {art.videoUrl && <iframe width="100%" height="315" src={art.videoUrl.replace('watch?v=', 'embed/')} title="video" />}
                        <small>By: {art.author?.name}</small>
                        <div>
                            <button onClick={() => likeArticle(art._id)}>👍 {art.likes?.length || 0}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Articles;