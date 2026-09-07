import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const VAPID_PUBLIC_KEY = 'BMUZeb4GbqPGPWwskLcykjw04kE5F6IG2MAsvLoU72yene6LXI2D0yVsxxewNJ-elXkiN3a0LHqJJIoTxq1j52U';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function Profile({ onBack }) {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme, accent, changeAccent } = useContext(ThemeContext);

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [department, setDepartment] = useState(user?.department || 'Computer');
    const [semester, setSemester] = useState(user?.semester || '1st');
    const [message, setMessage] = useState('');
    const [notifLoading, setNotifLoading] = useState(false);

    const departments = [
        'Computer', 'Electrical', 'Mechanical', 'Electronics',
        'Electromedical', 'Survey', 'Architecture', 'Civil',
        'Power', 'Automobile', 'Textile', 'Chemical',
        'Agriculture', 'Marine', 'Aerospace'
    ];

    const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://localhost:5000/api/auth/me', {
                name, bio, department, semester
            }, { headers: { 'x-auth-token': token } });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update profile');
        }
    };

    const enableNotifications = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications');
            return;
        }

        setNotifLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Permission denied');
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/notifications/subscribe', subscription, {
                headers: { 'x-auth-token': token }
            });

            alert('Notifications enabled!');
        } catch (err) {
            console.error(err);
            alert('Failed to enable notifications');
        } finally {
            setNotifLoading(false);
        }
    };

    return (
        <div className="app" style={{ maxWidth: '600px' }}>
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={onBack}>⬅ Back</button>
            </div>

            <div className="gradient-bg" style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '80px', marginBottom: '10px' }}>👤</div>
                <h1>{user?.name}</h1>
                <p>{user?.email}</p>
            </div>

            <div className="card">
                <h3>⚙️ General Settings</h3>

                <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />

                <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                    style={{ minHeight: '80px' }} />

                <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>

                <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                    {semesters.map(sem => (
                        <option key={sem} value={sem}>{sem} Semester</option>
                    ))}
                </select>

                <button onClick={handleSave} style={{ width: '100%' }}>Save Changes</button>
                {message && <p className="message">{message}</p>}
            </div>

            <div className="card">
                <h3>🔔 Notifications</h3>
                <button onClick={enableNotifications} disabled={notifLoading} style={{ width: '100%' }}>
                    {notifLoading ? 'Enabling...' : 'Enable Push Notifications'}
                </button>
            </div>

            <div className="card">
                <h3>🎨 Theme Settings</h3>
                <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                    {['#6c5ce7', '#007bff', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#e84393', '#00b894'].map(color => (
                        <div key={color} onClick={() => changeAccent(color)}
                            style={{
                                width: 50, height: 50, borderRadius: '50%', background: color,
                                cursor: 'pointer', border: accent === color ? '4px solid white' : 'none',
                                boxShadow: accent === color ? '0 0 20px ' + color : 'none'
                            }} />
                    ))}
                </div>
                <button onClick={toggleTheme} style={{ marginTop: '20px', width: '100%' }}>
                    {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
                </button>
            </div>

            <button onClick={logout} style={{ background: '#dc3545', width: '100%', marginTop: '20px' }}>
                Logout
            </button>
        </div>
    );
}

export default Profile;