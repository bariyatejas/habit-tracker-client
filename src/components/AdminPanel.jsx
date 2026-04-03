import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Shield, Trash2, Search, X, Eye, Key, Megaphone, Check, Save, Calendar, User, Lock, Unlock, Edit3, ArrowLeft, ArrowRight, Flame, Clock } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, subDays, startOfYear, endOfYear, isSameDay, getDay, startOfMonth, endOfMonth } from 'date-fns';

// DAY INSPECTOR (Edit a specific day)
const DayInspector = ({ dateStr, habits, onToggle, onClose, theme }) => {
  const dateObj = parseISO(dateStr);
  
  // Calculate stats for this specific day
  const dailyStats = habits.reduce((acc, h) => {
    if (h.completedDates.includes(dateStr)) {
      acc.done++;
      acc.mins += (parseInt(h.duration) || 0);
    }
    return acc;
  }, { done: 0, mins: 0 });

  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div>
            <h3 className="font-black text-xl leading-none uppercase">{format(dateObj, 'MMM d, yyyy')}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              {dailyStats.done} Tasks • {Math.floor(dailyStats.mins/60)}h {dailyStats.mins%60}m Total
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
        </div>

        {/* Habit List */}
        <div className="p-2 overflow-y-auto bg-slate-50 flex-1 space-y-2">
          {habits.map(habit => {
            const isDone = habit.completedDates.includes(dateStr);
            return (
              <div key={habit._id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{habit.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock size={10}/> {habit.duration}m
                  </div>
                </div>
                <button 
                  onClick={() => onToggle(habit._id, dateStr)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isDone ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-300 border border-slate-200 hover:border-slate-400'}`}
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// HABIT HISTORY EDITOR 
const HabitCalendarEditor = ({ habit, onClose, onSave }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [localDates, setLocalDates] = useState([...habit.completedDates]); 

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) });
  const startDay = getDay(startOfMonth(selectedMonth)); 

  const toggleDate = (dateStr) => {
    if (localDates.includes(dateStr)) setLocalDates(localDates.filter(d => d !== dateStr));
    else setLocalDates([...localDates, dateStr]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div><h3 className="font-bold text-lg">{habit.name}</h3><p className="text-xs text-slate-400 uppercase">History Editor</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={18}/></button>
        </div>
        <div className="p-4 bg-slate-50 flex items-center justify-between">
          <button onClick={()=>setSelectedMonth(d => subDays(d, 30))} className="p-2 hover:bg-white rounded-lg"><ArrowLeft size={16}/></button>
          <span className="font-black text-slate-700 uppercase">{format(selectedMonth, 'MMMM yyyy')}</span>
          <button onClick={()=>setSelectedMonth(d => subDays(d, -30))} className="p-2 hover:bg-white rounded-lg"><ArrowRight size={16}/></button>
        </div>
        <div className="p-4 grid grid-cols-7 gap-1">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>)}
          {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {daysInMonth.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isDone = localDates.includes(dateStr);
            return (
              <button key={dateStr} onClick={() => toggleDate(dateStr)} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isDone ? 'bg-green-500 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-100'}`}>
                {format(date, 'd')}
              </button>
            )
          })}
        </div>
        <div className="p-4 border-t border-slate-100 bg-white">
          <button onClick={() => onSave(habit._id, { completedDates: localDates })} className="w-full py-3 bg-slate-900 text-white font-bold uppercase rounded-xl hover:scale-[1.02] transition-transform">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export const AdminPanel = ({ theme, token, apiUrl, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // States
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [selectedUser, setSelectedUser] = useState(null); 
  const [userHabits, setUserHabits] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [editingHabitId, setEditingHabitId] = useState(null); 
  const [habitForm, setHabitForm] = useState({});
  
  // Modals
  const [calendarHabit, setCalendarHabit] = useState(null); // Single Habit History
  const [inspectingDay, setInspectingDay] = useState(null); // Specific Day Inspector (YYYY-MM-DD)

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchUsers();
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/admin/users`, { headers: { Authorization: token } });
      setUsers(res.data);
      setLoading(false);
    } catch (err) { alert("Access Denied"); onClose(); }
  };

  // ACTIONS 
  const selectUser = async (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username, role: user.role, isPublic: user.isPublic,
      createdAt: user.createdAt ? user.createdAt.split('T')[0] : '', password: ''
    });
    try {
      const res = await axios.get(`${apiUrl}/admin/users/${user._id}/inspect`, { headers: { Authorization: token } });
      setUserHabits(res.data);
    } catch(err) { console.error(err); }
  };

  const saveUserChanges = async () => {
    try {
      const res = await axios.put(`${apiUrl}/admin/users/${selectedUser._id}`, editForm, { headers: { Authorization: token } });
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...res.data } : u));
      setSelectedUser({ ...selectedUser, ...res.data });
      alert("Updated!");
    } catch (err) { alert(err.response?.data?.error || "Update Failed"); }
  };

  const deleteUser = async (id, username) => {
    if(!window.confirm(`DELETE @${username}?`)) return;
    try {
      await axios.delete(`${apiUrl}/admin/users/${id}`, { headers: { Authorization: token } });
      setUsers(users.filter(u => u._id !== id));
      if (selectedUser?._id === id) setSelectedUser(null);
    } catch (err) { alert("Failed"); }
  };

  const saveHabitDates = async (habitId, newData) => {
    try {
      const current = userHabits.find(h => h._id === habitId);
      const res = await axios.put(`${apiUrl}/admin/habits/${habitId}`, { name: current.name, duration: current.duration, ...newData }, { headers: { Authorization: token } });
      setUserHabits(userHabits.map(h => h._id === habitId ? res.data : h));
      setCalendarHabit(null);
    } catch (err) { alert("Update failed"); }
  };

  const toggleHabitOnDate = async (habitId, dateStr) => {
    const habit = userHabits.find(h => h._id === habitId);
    let newDates;
    if (habit.completedDates.includes(dateStr)) newDates = habit.completedDates.filter(d => d !== dateStr);
    else newDates = [...habit.completedDates, dateStr];
    
    // Optimistic Update
    setUserHabits(userHabits.map(h => h._id === habitId ? { ...h, completedDates: newDates } : h));
    
    // API Call
    try {
      await axios.put(`${apiUrl}/admin/habits/${habitId}`, { name: habit.name, duration: habit.duration, completedDates: newDates }, { headers: { Authorization: token } });
    } catch (err) { alert("Failed to toggle"); }
  };

  // HEATMAP COLOR ENGINE
  const getHeatColor = (mins) => {
    // Black only if >= 24 hours (1440 mins)
    if (mins >= 1440) return '#000000'; 
    
    if (mins === 0) return '#f1f5f9'; // Empty (Slate-100)
    
    // Scale 0-1439 mins across White->Blue->Green->Red
    const intensity = mins / 1440; 
    
    if (intensity < 0.25) { // White to Blue
      const t = intensity / 0.25; 
      return `rgb(${255 - (196 * t)}, ${255 - (125 * t)}, 255)`; 
    } else if (intensity < 0.5) { // Blue to Green
      const t = (intensity - 0.25) / 0.25;
      return `rgb(${59 - (25 * t)}, ${130 + (67 * t)}, ${246 - (152 * t)})`;
    } else if (intensity < 0.75) { // Green to Red
      const t = (intensity - 0.5) / 0.25;
      return `rgb(${34 + (205 * t)}, ${197 - (129 * t)}, ${94 - (26 * t)})`;
    } else { // Red to Almost Black
      const t = (intensity - 0.75) / 0.25;
      return `rgb(${239 - (150 * t)}, ${68 - (68 * t)}, ${68 - (68 * t)})`;
    }
  };

  const sendBroadcast = async (e) => { e.preventDefault(); if(!window.confirm("Broadcast?")) return; try { await axios.post(`${apiUrl}/admin/broadcast`, { text: broadcastText, type: broadcastType }, { headers: { Authorization: token } }); alert("Sent!"); setBroadcastText(''); } catch(err) { alert("Failed"); } };
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-slate-100 z-[100] flex flex-col font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-yellow-500 rounded-lg text-slate-900 shadow-lg"><Shield size={24} strokeWidth={3} /></div>
          <div><h1 className="text-xl md:text-2xl font-black">COMMAND CENTER</h1></div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
      </div>

      {/* BROADCAST */}
      <div className="bg-white border-b border-slate-200 p-3 shrink-0 shadow-sm z-10">
         <form onSubmit={sendBroadcast} className="flex flex-col md:flex-row gap-2 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs px-2"><Megaphone size={16}/> Broadcast</div>
            <input value={broadcastText} onChange={e=>setBroadcastText(e.target.value)} placeholder="System Alert..." className="flex-1 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900" />
            <select value={broadcastType} onChange={e=>setBroadcastType(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold uppercase outline-none"><option value="info">Info</option><option value="warning">Warning</option><option value="alert">Alert</option></select>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase rounded-lg hover:bg-slate-800">Send</button>
         </form>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: LIST */}
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
           <div className="p-4 border-b border-slate-100">
              <div className="relative group">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {loading && <div className="text-center py-10 text-xs font-bold text-slate-400">Loading...</div>}
              {filteredUsers.map(user => (
                <div key={user._id} onClick={() => selectUser(user)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedUser?._id === user._id ? 'bg-slate-800 border-slate-900 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm uppercase ${selectedUser?._id === user._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{user.username[0]}</div>
                    <div><div className={`font-bold text-sm ${selectedUser?._id === user._id ? 'text-white' : 'text-slate-800'}`}>@{user.username}</div></div>
                  </div>
                  <ArrowRight size={16} className={`${selectedUser?._id === user._id ? 'text-white' : 'text-slate-300'}`}/>
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT: EDITOR */}
        <div className={`flex-1 bg-slate-50 flex flex-col overflow-hidden relative ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
           {!selectedUser ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-300"><Shield size={64} className="mb-4 opacity-20"/><p className="font-bold text-lg">Select a user</p></div>
           ) : (
             <div className="flex flex-col h-full">
               <div className="bg-white border-b border-slate-200 p-4 md:p-6 flex justify-between items-start shrink-0">
                 <div className="flex items-center gap-4">
                   <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 -ml-2 text-slate-400"><ArrowLeft size={20}/></button>
                   <div><h2 className="text-2xl font-black text-slate-900 leading-none mb-1">@{selectedUser.username}</h2><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID: {selectedUser._id}</p></div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={saveUserChanges} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-green-700 shadow-lg"><Save size={14}/> Save</button>
                    <button onClick={() => deleteUser(selectedUser._id, selectedUser.username)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={18}/></button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><User size={16}/> Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Username</label><input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                       <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Join Date</label><input type="date" value={editForm.createdAt} onChange={e => setEditForm({...editForm, createdAt: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                       <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Role</label><select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"><option value="user">User</option><option value="admin">Admin</option></select></div>
                       <div className="flex items-end"><button onClick={() => setEditForm({...editForm, isPublic: !editForm.isPublic})} className={`w-full p-3 rounded-xl border-2 font-bold text-xs uppercase flex items-center justify-center gap-2 ${editForm.isPublic ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-400'}`}>{editForm.isPublic ? <Unlock size={16}/> : <Lock size={16}/>} {editForm.isPublic ? 'Public' : 'Private'}</button></div>
                    </div>
                 </div>

                 {/* YEARLY VITALITY MAP */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Flame size={16} className="text-orange-500"/> Yearly Vitality</h3>
                    <div className="flex flex-wrap gap-[2px]">
                       {eachDayOfInterval({start: startOfYear(new Date()), end: endOfYear(new Date())}).map(d => {
                          const dateStr = format(d, 'yyyy-MM-dd');
                          let dailyMins = 0;
                          userHabits.forEach(h => {
                            if(h.completedDates.includes(dateStr)) dailyMins += (parseInt(h.duration)||0);
                          });
                          
                          return (
                            <div 
                              key={dateStr}
                              onClick={() => setInspectingDay(dateStr)} // TRIGGER DAY INSPECTOR
                              className="w-3 h-3 rounded-[1px] cursor-pointer hover:border border-slate-400/50 hover:scale-125 transition-transform"
                              style={{ backgroundColor: getHeatColor(dailyMins) }}
                              title={`${dateStr}: ${dailyMins} mins`}
                            />
                          )
                       })}
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Eye size={16}/> Habit Data</h3>
                    <div className="space-y-3">
                       {userHabits.length === 0 && <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase">No habits recorded</div>}
                       {userHabits.map(habit => (
                         <div key={habit._id} className="p-4 rounded-xl border bg-slate-50 border-slate-100 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                {habit.name}
                                <button onClick={() => setCalendarHabit(habit)} className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded hover:bg-blue-200 flex items-center gap-1"><Calendar size={10}/> History</button>
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{habit.duration} mins • {habit.completedDates.length} Days</div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* MODALS */}
      {calendarHabit && <HabitCalendarEditor habit={calendarHabit} onClose={() => setCalendarHabit(null)} onSave={saveHabitDates}/>}
      {inspectingDay && <DayInspector dateStr={inspectingDay} habits={userHabits} onToggle={toggleHabitOnDate} onClose={() => setInspectingDay(null)} />}

    </div>
  )
};