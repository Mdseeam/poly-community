import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Jobs({ onBack }) {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('full-time');
    const [imageFile, setImageFile] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const loadJobs = () => {
        axios.get('http://localhost:5000/api/jobs').then(res => setJobs(res.data));
    };

    useEffect(() => { loadJobs(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('company', company);
        formData.append('location', location);
        formData.append('description', description);
        formData.append('type', type);
        if (imageFile) formData.append('file', imageFile);

        if (editingId) {
            await axios.put(`http://localhost:5000/api/jobs/${editingId}`, formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
            setEditingId(null);
        } else {
            await axios.post('http://localhost:5000/api/jobs', formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
        }
        setTitle(''); setCompany(''); setLocation(''); setDescription(''); setImageFile(null);
        loadJobs();
    };

    const startEdit = (job) => {
        setEditingId(job._id);
        setTitle(job.title);
        setCompany(job.company);
        setLocation(job.location);
        setDescription(job.description);
        setType(job.type);
    };

    const deleteJob = async (id) => {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
            headers: { 'x-auth-token': token }
        });
        loadJobs();
    };

    return (
        <div className="app">
            <button onClick={onBack}>⬅ Back</button>
            <div className="gradient-bg"><h1>💼 Job Board</h1></div>
            <div className="card">
                <h3>{editingId ? 'Edit Job' : 'Post Job'}</h3>
                <form onSubmit={handleSubmit}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job Title" required />
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" />
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="internship">Internship</option>
                        <option value="contract">Contract</option>
                    </select>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
                    <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" />
                    <button type="submit">{editingId ? 'Save Changes' : 'Post Job'}</button>
                </form>
            </div>
            <div className="card">
                {jobs.map(job => (
                    <div key={job._id} style={{ margin: '10px 0', padding: '15px', border: '1px solid var(--border)', borderRadius: '10px' }}>
                        {job.imageUrl && <img src={`http://localhost:5000${job.imageUrl}`} style={{ width: '100%', borderRadius: '10px' }} />}
                        <h4>{job.title}</h4>
                        <p>{job.company} - {job.location}</p>
                        <p>{job.type}</p>
                        <p>{job.description}</p>
                        {job.postedBy?._id === user?._id && (
                            <div>
                                <button onClick={() => startEdit(job)}>✏️ Edit</button>
                                <button onClick={() => deleteJob(job._id)} style={{ background: '#dc3545' }}>🗑️ Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Jobs;