import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

function Dashboard({
    onOpenProfile, onOpenGlobalChat, onOpenDepartmentChat,
    onOpenCommunity, onOpenEvents, onOpenUsers, onOpenInbox,
    onOpenArticles, onOpenJobs, onOpenMaterials, onOpenPolls
}) {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="app" style={{ maxWidth: '1200px' }}>
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="gradient-bg" style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '80px', marginBottom: '15px' }}>👋</div>
                <h1 style={{ fontSize: '2.5rem' }}>Welcome, {user?.name}!</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>{user?.department} • {user?.semester} Semester</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{user?.email}</p>
            </div>

            <div className="dashboard-grid">
                <div className="feature-card" onClick={onOpenProfile}>
                    <div className="feature-icon">👤</div>
                    <h3>Profile</h3>
                    <p>Settings & Theme</p>
                </div>

                <div className="feature-card" onClick={onOpenGlobalChat}>
                    <div className="feature-icon">💬</div>
                    <h3>Global Chat</h3>
                    <p>All Polytechnics</p>
                </div>

                <div className="feature-card" onClick={onOpenDepartmentChat}>
                    <div className="feature-icon">🏫</div>
                    <h3>Department Chat</h3>
                    <p>Dept & Semester wise</p>
                </div>

                <div className="feature-card" onClick={onOpenCommunity}>
                    <div className="feature-icon">📋</div>
                    <h3>Community</h3>
                    <p>Notices & Updates</p>
                </div>

                <div className="feature-card" onClick={onOpenEvents}>
                    <div className="feature-icon">📅</div>
                    <h3>Events</h3>
                    <p>Calendar & Schedule</p>
                </div>

                <div className="feature-card" onClick={onOpenUsers}>
                    <div className="feature-icon">👥</div>
                    <h3>Find Users</h3>
                    <p>Profiles & DM</p>
                </div>

                <div className="feature-card" onClick={onOpenInbox}>
                    <div className="feature-icon">📥</div>
                    <h3>Messages</h3>
                    <p>Private Inbox</p>
                </div>

                <div className="feature-card" onClick={onOpenArticles}>
                    <div className="feature-icon">📝</div>
                    <h3>Articles</h3>
                    <p>Blog & Ideas</p>
                </div>

                <div className="feature-card" onClick={onOpenJobs}>
                    <div className="feature-icon">💼</div>
                    <h3>Job Board</h3>
                    <p>Jobs & Internships</p>
                </div>

                <div className="feature-card" onClick={onOpenMaterials}>
                    <div className="feature-icon">📚</div>
                    <h3>Study Materials</h3>
                    <p>Notes & Books</p>
                </div>

                <div className="feature-card" onClick={onOpenPolls}>
                    <div className="feature-icon">🗳️</div>
                    <h3>Polls</h3>
                    <p>Vote & Opinion</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;