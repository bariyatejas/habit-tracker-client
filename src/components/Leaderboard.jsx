import { useState, useEffect } from 'react';
import axios from 'axios';
import { Medal, Eye, Lock, Check, X } from 'lucide-react';
import { format } from 'date-fns';

// SUB-COMPONENT: Friend View Modal
const FriendViewModal = ({ targetUser, token, onClose, theme, apiUrl }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${apiUrl}/users/${targetUser}/habits`, { headers: { Authorization: token } })
      .then(res => { setHabits(res.data.habits); setLoading(false); })
      .catch(err => { setError(err.response?.data?.error || 'Private Profile'); setLoading(false); });
  }, [targetUser, apiUrl, token]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-lg ${theme.card} p-6 rounded-3xl relative shadow-2xl`}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"><X size={20}/></button>
        
        <h2 className={`text-2xl font-black ${theme.text} mb-1`}>@{targetUser}</h2>
        <p className={`text-xs font-bold uppercase ${theme.subtext} mb-6`}>Community Journal</p>

        {loading ? (
          <div className="py-10 text-center text-slate-400 font-medium">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-50 rounded-full"><Lock size={32} className="text-slate-400" /></div>
            <p className="font-bold text-slate-500">{error}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {habits.length === 0 && <p className="text-center text-slate-400">No public habits yet.</p>}
            {habits.map(h => (
              <div key={h._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h4 className={`font-bold ${theme.text} text-sm md:text-base`}>{h.name}</h4>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">{h.duration}m • {h.completedDates.length} Days</span>
                </div>
                <div className={`w-8 h-8 rounded-lg border-2 border-slate-200 flex items-center justify-center ${h.completedDates.includes(format(new Date(), 'yyyy-MM-dd')) ? theme.solidBtn : 'bg-white'}`}>
                   {h.completedDates.includes(format(new Date(), 'yyyy-MM-dd')) && <Check size={16} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// MAIN COMPONENT
export const LeaderboardView = ({ theme, token, apiUrl }) => {
  const [leaders, setLeaders] = useState([]);
  const [viewingFriend, setViewingFriend] = useState(null);

  useEffect(() => {
    if(token) {
        axios.get(`${apiUrl}/stats/leaderboard`, { headers: { Authorization: token } })
        .then(res => setLeaders(res.data))
        .catch(err => console.error(err));
    }
  }, [token, apiUrl]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className={`p-4 md:p-8 rounded-3xl ${theme.card} max-w-3xl mx-auto`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-2xl md:text-3xl font-black ${theme.text} flex items-center gap-2`}>
              <Medal className="text-yellow-500" /> Rankings
            </h2>
            <p className={`text-xs font-bold uppercase ${theme.subtext} mt-1 opacity-70`}>Global Community Stats </p>
          </div>
        </div>

        <div className="space-y-3">
          {leaders.length === 0 && <p className={`text-center py-10 ${theme.subtext}`}>No data available yet.</p>}
          
          {leaders.map((user, index) => (
            <div 
              key={index} 
              onClick={() => setViewingFriend(user.username)}
              className={`flex items-center justify-between p-4 rounded-2xl border ${theme.gridBorder} bg-white hover:bg-slate-50 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md group`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-white text-sm shadow-sm ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-orange-300' : theme.solidBtn}`}>
                  {index + 1}
                </div>
                <div>
                  <span className={`font-bold text-base md:text-lg ${theme.text} block`}>@{user.username}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors flex items-center gap-1">
                    View Profile <Eye size={10}/>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-black text-xl md:text-2xl ${theme.text} block`}>{user.score}</span>
                <span className={`text-[9px] font-bold uppercase ${theme.subtext}`}>Total Points</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewingFriend && (
        <FriendViewModal 
          targetUser={viewingFriend} 
          token={token} 
          onClose={() => setViewingFriend(null)} 
          theme={theme}
          apiUrl={apiUrl}
        />
      )}
    </div>
  );
};