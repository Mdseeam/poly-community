import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Polls({ onBack }) {
    const { user } = useContext(AuthContext);
    const [polls, setPolls] = useState([]);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [editingId, setEditingId] = useState(null);

    const loadPolls = () => {
        axios.get('https://poly-community.onrender.com/api/polls').then(res => setPolls(res.data));
    };

    useEffect(() => { loadPolls(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) return alert('Need at least 2 options');

        if (editingId) {
            await axios.put(`https://poly-community.onrender.com/api/polls/${editingId}`, { question, options: validOptions },
                { headers: { 'x-auth-token': token } });
            setEditingId(null);
        } else {
            await axios.post('https://poly-community.onrender.com/api/polls', { question, options: validOptions },
                { headers: { 'x-auth-token': token } });
        }
        setQuestion(''); setOptions(['', '']);
        loadPolls();
    };

    const startEdit = (poll) => {
        setEditingId(poll._id);
        setQuestion(poll.question);
        setOptions(poll.options.map(opt => opt.text));
    };

    const deletePoll = async (id) => {
        const token = localStorage.getItem('token');
        await axios.delete(`https://poly-community.onrender.com/api/polls/${id}`, {
            headers: { 'x-auth-token': token }
        });
        loadPolls();
    };

    const vote = async (pollId, optionIndex) => {
        const token = localStorage.getItem('token');
        await axios.put(`https://poly-community.onrender.com/api/polls/${pollId}/vote/${optionIndex}`, {},
            { headers: { 'x-auth-token': token } });
        loadPolls();
    };

    return (
        <div className="app">
            <button onClick={onBack}>⬅ Back</button>
            <div className="gradient-bg"><h1>🗳️ Polls</h1></div>
            <div className="card">
                <h3>{editingId ? 'Edit Poll' : 'Create Poll'}</h3>
                <form onSubmit={handleSubmit}>
                    <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question" required />
                    {options.map((opt, idx) => (
                        <input key={idx} value={opt} onChange={e => {
                            const newOpts = [...options];
                            newOpts[idx] = e.target.value;
                            setOptions(newOpts);
                        }} placeholder={`Option ${idx + 1}`} />
                    ))}
                    <button type="button" onClick={() => setOptions([...options, ''])}>Add Option</button>
                    <button type="submit">{editingId ? 'Save Changes' : 'Create Poll'}</button>
                </form>
            </div>
            <div className="card">
                {polls.map(poll => (
                    <div key={poll._id} style={{ margin: '10px 0', padding: '15px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                        <h4>{poll.question}</h4>
                        {poll.options.map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{opt.text}</span>
                                <button onClick={() => vote(poll._id, idx)}>Vote ({opt.votes?.length || 0})</button>
                            </div>
                        ))}
                        {poll.createdBy?._id === user?._id && (
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={() => startEdit(poll)}>✏️ Edit</button>
                                <button onClick={() => deletePoll(poll._id)} style={{ background: '#dc3545' }}>🗑️ Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Polls;