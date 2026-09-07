import React, { useState, useContext } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GlobalChat from './pages/GlobalChat';
import DepartmentChat from './pages/DepartmentChat';
import Community from './pages/Community';
import Events from './pages/Events';
import UsersList from './pages/UsersList';
import UserProfile from './pages/UserProfile';
import PrivateChat from './pages/PrivateChat';
import Inbox from './pages/Inbox';
import Articles from './pages/Articles';
import Jobs from './pages/Jobs';
import StudyMaterials from './pages/StudyMaterials';
import Polls from './pages/Polls';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import { AuthContext, AuthProvider } from './context/AuthContext';

const departmentIcons = {
  'Computer': '💻',
  'Electrical': '⚡',
  'Mechanical': '⚙️',
  'Electronics': '🔌',
  'Electromedical': '🏥',
  'Survey': '📐',
  'Architecture': '🏛️',
  'Civil': '🏗️',
  'Power': '🔋',
  'Automobile': '🚗',
  'Textile': '🧵',
  'Chemical': '🧪',
  'Agriculture': '🌾',
  'Marine': '🚢',
  'Aerospace': '✈️'
};

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [chatUser, setChatUser] = useState(null);

  const { user, login, register } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer');
  const [semester, setSemester] = useState('1st');
  const [isLogin, setIsLogin] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, department, semester });
      }
      setCurrentPage('dashboard');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error');
    }
  };

  if (!user) {
    return (
      <div className="auth-page">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className="dept-float-icon" style={{ top: '10%', left: '10%' }}>💻</div>
        <div className="dept-float-icon" style={{ top: '20%', right: '15%', animationDelay: '1s' }}>⚙️</div>
        <div className="dept-float-icon" style={{ bottom: '25%', left: '15%', animationDelay: '2s' }}>🔌</div>
        <div className="dept-float-icon" style={{ bottom: '10%', right: '20%', animationDelay: '0.5s' }}>📐</div>
        <div className="dept-float-icon" style={{ top: '50%', left: '5%', animationDelay: '3s' }}>🏗️</div>
        <div className="dept-float-icon" style={{ top: '60%', right: '5%', animationDelay: '1.5s' }}>🔋</div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="dept-icon-large">
              {departmentIcons[department] || '🎓'}
            </div>
            <h1>{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>
            <p>Polytechnic Community</p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input type="text" placeholder="Full Name" value={name}
                  onChange={(e) => setName(e.target.value)} required />
                <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  {Object.keys(departmentIcons).map(dept => (
                    <option key={dept} value={dept}>{departmentIcons[dept]} {dept}</option>
                  ))}
                </select>
                <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>{sem} Semester</option>
                  ))}
                </select>
              </>
            )}
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="auth-btn">
              {isLogin ? 'Login' : 'Register & Login'}
            </button>
          </form>

          <p className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </p>
          {message && <p className="error-msg">{message}</p>}
        </div>
      </div>
    );
  }

  if (currentPage === 'profile') {
    return <Profile onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'global-chat') {
    return <GlobalChat onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'department-chat') {
    return <DepartmentChat onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'community') {
    return <Community onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'events') {
    return <Events onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'users') {
    return (
      <UsersList
        onBack={() => setCurrentPage('dashboard')}
        onOpenProfile={(id) => {
          setSelectedProfileId(id);
          setCurrentPage('user-profile');
        }}
        currentUserId={user?._id}
      />
    );
  }
  if (currentPage === 'user-profile') {
    return (
      <UserProfile
        userId={selectedProfileId}
        onBack={() => setCurrentPage('users')}
        onOpenChat={(id, name) => {
          setChatUser({ id, name });
          setCurrentPage('private-chat');
        }}
        currentUserId={user?._id}
      />
    );
  }
  if (currentPage === 'private-chat') {
    return (
      <PrivateChat
        receiverId={chatUser?.id}
        receiverName={chatUser?.name}
        onBack={() => setCurrentPage('inbox')}
      />
    );
  }
  if (currentPage === 'inbox') {
    return (
      <Inbox
        onBack={() => setCurrentPage('dashboard')}
        onOpenChat={(id, name) => {
          setChatUser({ id, name });
          setCurrentPage('private-chat');
        }}
      />
    );
  }
  if (currentPage === 'articles') {
    return <Articles onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'jobs') {
    return <Jobs onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'materials') {
    return <StudyMaterials onBack={() => setCurrentPage('dashboard')} />;
  }
  if (currentPage === 'polls') {
    return <Polls onBack={() => setCurrentPage('dashboard')} />;
  }

  return (
    <Dashboard
      onOpenProfile={() => setCurrentPage('profile')}
      onOpenGlobalChat={() => setCurrentPage('global-chat')}
      onOpenDepartmentChat={() => setCurrentPage('department-chat')}
      onOpenCommunity={() => setCurrentPage('community')}
      onOpenEvents={() => setCurrentPage('events')}
      onOpenUsers={() => setCurrentPage('users')}
      onOpenInbox={() => setCurrentPage('inbox')}
      onOpenArticles={() => setCurrentPage('articles')}
      onOpenJobs={() => setCurrentPage('jobs')}
      onOpenMaterials={() => setCurrentPage('materials')}
      onOpenPolls={() => setCurrentPage('polls')}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;