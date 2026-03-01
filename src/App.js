import { useState } from 'react';
import Auth from './components/Auth';
import Chat from './components/Chat';
import YouTubeDownload from './components/YouTubeDownload';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chatapp_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') return parsed;
      return { username: stored, firstName: '', lastName: '' };
    } catch {
      const stored = localStorage.getItem('chatapp_user');
      return stored ? { username: stored, firstName: '', lastName: '' } : null;
    }
  });
  const [activeTab, setActiveTab] = useState('chat');

  const handleLogin = (userObj) => {
    const u = { username: userObj.username, firstName: userObj.firstName || '', lastName: userObj.lastName || '' };
    localStorage.setItem('chatapp_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatapp_user');
    setUser(null);
  };

  if (user) {
    return (
      <div className="app-tabs">
        <div className="app-tab-bar">
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>Chat</button>
          <button className={activeTab === 'youtube' ? 'active' : ''} onClick={() => setActiveTab('youtube')}>YouTube Channel Download</button>
        </div>
        {activeTab === 'chat' ? (
          <Chat user={user} onLogout={handleLogout} />
        ) : (
          <YouTubeDownload user={user} onLogout={handleLogout} />
        )}
      </div>
    );
  }
  return <Auth onLogin={handleLogin} />;
}

export default App;
