import { useState, useEffect } from 'react'; // Add imports
import axios from 'axios'; // Add imports
import { Leaf, LogOut, Lock, Unlock, LayoutGrid, BarChart3, Medal, AlertTriangle, Info, Bell } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Late night hustle,";
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
};

export const Layout = ({ 
  username, isPublic, activeTab, theme, 
  onLogout, onTabChange, onTogglePrivacy, onThemeChange, themes 
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  // NEW: SYSTEM MESSAGE LOGIC
  const [sysMsg, setSysMsg] = useState(null);

  useEffect(() => {
    // Fetch system message on mount
    axios.get('http://localhost:5000/api/system-message')
      .then(res => setSysMsg(res.data))
      .catch(() => {});
  }, []);

  // Message Colors
  const msgColors = {
    info: 'bg-blue-600',
    warning: 'bg-orange-500',
    alert: 'bg-red-600'
  };

  return (
    <div>
      {/* BROADCAST BANNER */}
      {sysMsg && (
        <div className={`${msgColors[sysMsg.type]} text-white text-xs md:text-sm font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-500 relative z-50`}>
           {sysMsg.type === 'alert' ? <AlertTriangle size={16}/> : sysMsg.type === 'warning' ? <Bell size={16}/> : <Info size={16}/>}
           <span>{sysMsg.text}</span>
           <button onClick={() => setSysMsg(null)} className="absolute right-4 hover:bg-white/20 p-1 rounded"><X size={14}/></button>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* ... (Rest of your existing Layout Header code) ... */}
        {/* Make sure to copy the Header code from the previous step if you lost it, or just wrap the existing header in this div */}
        
        {/* Header Content */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
          <div className="text-center lg:text-left">
            <h1 className={`text-4xl md:text-5xl font-serif font-black ${theme.text} mb-2`}>Habit Journal</h1>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="flex items-center gap-2 opacity-80">
                <Leaf size={16} className={theme.text} />
                <p className={`text-xs font-bold uppercase tracking-widest ${theme.subtext}`}>
                  {getGreeting()} {username}
                </p>
              </div>
              <button 
                onClick={onTogglePrivacy} 
                className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full border transition-all ${isPublic ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
              >
                {isPublic ? <><Unlock size={10}/> Public</> : <><Lock size={10}/> Private</>}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 bg-white p-2 rounded-full border border-slate-200 shadow-sm">
            {[
              { id: 'tracker', icon: LayoutGrid, label: 'Journal' },
              { id: 'analytics', icon: BarChart3, label: 'Insights' },
              { id: 'leaderboard', icon: Medal, label: 'Rank' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => onTabChange(tab.id)} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? theme.solidBtn : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}

            {/* Theme Dot */}
            <div className="relative border-l pl-2 ml-2 border-slate-200">
              <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 border border-slate-200">
                <div className="w-5 h-5 rounded-full" style={{backgroundColor: theme.primary}}></div>
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-4 w-44 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 py-2">
                  {Object.keys(themes).map(k => (
                    <button key={k} onClick={() => {onThemeChange(k); setShowThemeMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-xs font-bold uppercase text-slate-600 border-b border-slate-50 last:border-0">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: themes[k].primary}}></div>
                      {themes[k].name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={onLogout} className="ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 text-red-400 transition-all">
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import { X } from 'lucide-react';