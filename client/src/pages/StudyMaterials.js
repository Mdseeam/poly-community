import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function StudyMaterials({ onBack }) {
    const { user } = useContext(AuthContext);
    const [materials, setMaterials] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [department, setDepartment] = useState(user?.department || 'Computer');
    const [semester, setSemester] = useState(user?.semester || '1st');
    const [fileUrl, setFileUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [filterDept, setFilterDept] = useState('');
    const [filterSem, setFilterSem] = useState('');

    const departments = ['Computer', 'Electrical', 'Mechanical', 'Electronics', 'Civil', 'Power'];
    const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    const loadMaterials = () => {
        let url = 'http://localhost:5000/api/materials';
        const params = new URLSearchParams();
        if (filterDept) params.append('department', filterDept);
        if (filterSem) params.append('semester', filterSem);
        if (params.toString()) url += '?' + params.toString();
        axios.get(url).then(res => setMaterials(res.data));
    };

    useEffect(() => { loadMaterials(); }, [filterDept, filterSem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('subject', subject);
        formData.append('department', department);
        formData.append('semester', semester);
        formData.append('fileUrl', fileUrl);
        if (imageFile) formData.append('file', imageFile);

        if (editingId) {
            await axios.put(`http://localhost:5000/api/materials/${editingId}`, formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
            setEditingId(null);
        } else {
            await axios.post('http://localhost:5000/api/materials', formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
        }
        setTitle(''); setDescription(''); setSubject(''); setFileUrl(''); setImageFile(null);
        loadMaterials();
    };

    const startEdit = (mat) => {
        setEditingId(mat._id);
        setTitle(mat.title);
        setDescription(mat.description);
        setSubject(mat.subject);
        setDepartment(mat.department);
        setSemester(mat.semester);
        setFileUrl(mat.fileUrl || '');
    };

    const deleteMaterial = async (id) => {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/materials/${id}`, {
            headers: { 'x-auth-token': token }
        });
        loadMaterials();
    };

    return (
        <div className="app">
            <button onClick={onBack}>⬅ Back</button>
            <div className="gradient-bg"><h1>📚 Study Materials</h1></div>
            <div className="card">
                <h3>{editingId ? 'Edit Material' : 'Upload Material'}</h3>
                <form onSubmit={handleSubmit}>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
                    <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <select value={semester} onChange={e => setSemester(e.target.value)}>
                        {semesters.map(sem => <option key={sem} value={sem}>{sem} Semester</option>)}
                    </select>
                    <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="File URL (Google Drive link)" />
                    <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" />
                    <button type="submit">{editingId ? 'Save Changes' : 'Upload'}</button>
                </form>
            </div>
            <div className="card">
                <h3>Filter</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <select value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                        <option value="">All Semesters</option>
                        {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>
                </div>
            </div>
            <div className="card">
                {materials.map(mat => (
                    <div key={mat._id} style={{ padding: '15px', margin: '10px 0', background: 'var(--bg)', borderRadius: '10px' }}>
                        {mat.imageUrl && <img src={`http://localhost:5000${mat.imageUrl}`} style={{ width: '100%' }} />}
                        <h4>{mat.title}</h4>
                        <p>{mat.description}</p>
                        <small>{mat.subject} • {mat.department} • {mat.semester} Semester</small>
                        <p><small>By: {mat.uploadedBy?.name}</small></p>
                        {mat.uploadedBy?._id === user?._id && (
                            <div>
                                <button onClick={() => startEdit(mat)}>✏️ Edit</button>
                                <button onClick={() => deleteMaterial(mat._id)} style={{ background: '#dc3545' }}>🗑️ Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StudyMaterials;