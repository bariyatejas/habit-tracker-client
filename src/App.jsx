import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthScreen } from './components/AuthScreen';
import { Layout } from './components/Layout';
import { TrackerGrid } from './components/TrackerGrid';
import { Dashboard } from './components/Dashboard';
import { LeaderboardView } from './components/Leaderboard';
import { AnalyticsView } from './components/Analytics';
import { AdminPanel } from './components/AdminPanel'; // Import
import { Shield } from 'lucide-react';

// CONFIG
const API_URL = 'http://localhost:5000/api'; 

const themes = {
  sage: { name: 'Sage Garden', bg: 'bg-[#f0f4f0]', sidebar: 'bg-[#e1e8e1]', primary: '#4a7c59', secondary: '#8fb39e', accent: '#dce8dd', text: 'text-[#1a2f23]', subtext: 'text-[#4a5d50]', card: 'bg-white border-[#b7ccb8] shadow-sm', solidBtn: 'bg-[#4a7c59] text-white hover:bg-[#3a6346]', activeTab: 'bg-white text-[#2f523a] shadow-md border border-[#b7ccb8]', gridBorder: 'border-[#b7ccb8]' },
  latte: { name: 'Morning Latte', bg: 'bg-[#f9f5f0]', sidebar: 'bg-[#ede0d4]', primary: '#8c6b5d', secondary: '#ddb892', accent: '#e6ccb2', text: 'text-[#3e2723]', subtext: 'text-[#795548]', card: 'bg-white border-[#d7c0ae] shadow-sm', solidBtn: 'bg-[#8c6b5d] text-white hover:bg-[#6d4c41]', activeTab: 'bg-white text-[#4e342e] shadow-md border border-[#d7c0ae]', gridBorder: 'border-[#d7c0ae]' },
  minimal: { name: 'Ink & Paper', bg: 'bg-[#f8f9fa]', sidebar: 'bg-[#e9ecef]', primary: '#212529', secondary: '#6c757d', accent: '#dee2e6', text: 'text-[#000000]', subtext: 'text-[#495057]', card: 'bg-white border-[#ced4da] shadow-sm', solidBtn: 'bg-[#212529] text-white hover:bg-[#000]', activeTab: 'bg-white text-black shadow-md border border-[#ced4da]', gridBorder: 'border-[#ced4da]' }
};

const BackgroundTexture = () => (
  <div className="fixed inset-0 -z-50 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
)

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [createdAt, setCreatedAt] = useState(localStorage.getItem('createdAt'));
  const [isPublic, setIsPublic] = useState(localStorage.getItem('isPublic') === 'true');
  const [role, setRole] = useState(localStorage.getItem('role') || 'user'); // Role State
  
  const [habits, setHabits] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('sage');
  const [activeTab, setActiveTab] = useState('tracker');
  const [showAdminPanel, setShowAdminPanel] = useState(false); // Admin Modal State
  const [input, setInput] = useState('');
  const [durationInput, setDurationInput] = useState(20);

  const theme = themes[currentTheme];

  const handleLogin = (t, u, c, p, r) => {
    localStorage.setItem('token', t);
    localStorage.setItem('username', u);
    localStorage.setItem('createdAt', c);
    localStorage.setItem('isPublic', p);
    localStorage.setItem('role', r);
    setToken(t); setUsername(u); setCreatedAt(c); setIsPublic(p); setRole(r);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null); setUsername(null); setHabits([]); setRole('user');
  };

  const togglePrivacy = async () => {
    try {
      const res = await axios.put(`${API_URL}/users/visibility`, {}, { headers: { Authorization: token } });
      setIsPublic(res.data.isPublic); localStorage.setItem('isPublic', res.data.isPublic);
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/habits`, { headers: { Authorization: token } })
        .then(res => setHabits(res.data))
        .catch(() => handleLogout());
    }
  }, [token]);

  const addHabit = async (e) => { e.preventDefault(); if(!input.trim()) return; const res = await axios.post(`${API_URL}/habits`, {name:input, duration:durationInput}, {headers:{Authorization:token}}); setHabits([...habits, res.data]); setInput(''); }
  const toggleHabit = async (id, date) => { const old = [...habits]; setHabits(habits.map(h=>h._id===id?{...h, completedDates: h.completedDates.includes(date)?h.completedDates.filter(d=>d!==date):[...h.completedDates,date]}:h)); try{ await axios.put(`${API_URL}/habits/${id}/toggle`, {date}, {headers:{Authorization:token}}); } catch{ setHabits(old); } }
  const deleteHabit = async (id) => { await axios.delete(`${API_URL}/habits/${id}`, {headers:{Authorization:token}}); setHabits(habits.filter(h=>h._id!==id)); }

  if (!token) return <AuthScreen onLogin={handleLogin} theme={theme} apiUrl={API_URL} />;

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-700 pb-20`}>
      <BackgroundTexture />
      
      <Layout 
        username={username} isPublic={isPublic} activeTab={activeTab} theme={theme} themes={themes}
        onLogout={handleLogout} onTabChange={setActiveTab} onTogglePrivacy={togglePrivacy} onThemeChange={setCurrentTheme}
      />

      {/* Admin Button */}
      {role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
          >
            <Shield size={18} /> Admin
          </button>
        </div>
      )}

      {showAdminPanel && (
        <AdminPanel theme={theme} token={token} apiUrl={API_URL} onClose={() => setShowAdminPanel(false)} />
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {activeTab === 'tracker' && (
          <>
            <Dashboard habits={habits} theme={theme} onToggle={toggleHabit} />
            <TrackerGrid 
              habits={habits} toggleHabit={toggleHabit} deleteHabit={deleteHabit} 
              theme={theme} addHabit={addHabit} input={input} setInput={setInput} 
              durationInput={durationInput} setDurationInput={setDurationInput}
              userCreatedAt={createdAt}
            />
          </>
        )}
        {activeTab === 'analytics' && <AnalyticsView habits={habits} theme={theme} />}
        {activeTab === 'leaderboard' && <LeaderboardView theme={theme} token={token} apiUrl={API_URL} />}
      </div>
    </div>
  )
}

export default App;