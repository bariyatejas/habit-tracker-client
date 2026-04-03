import { useState } from 'react';
import axios from 'axios';
import { Leaf } from 'lucide-react';

export const AuthScreen = ({ onLogin, theme, apiUrl }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    try {
      const res = await axios.post(`${apiUrl}${endpoint}`, { username, password });
      
      if (!isRegister) {
        // Login Success: Pass Role
        onLogin(res.data.token, res.data.username, res.data.createdAt, res.data.isPublic, res.data.role);
      } else {
        // Register Success
        setIsRegister(false); 
        alert("Account created successfully! Please login.");
        setPassword('');
      }
    } catch (err) {
      // Error Handling
      if (err.response?.data?.code === 11000 || err.response?.data?.error?.includes("exists")) {
        setError("User already exists. Please login.");
        setIsRegister(false); // Auto-switch to Login
      } else {
        setError(err.response?.data?.error || 'Server error. Check connection.');
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 font-sans`}>
      <div className={`p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md ${theme.card}`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-serif font-black ${theme.text} mb-2`}>Habit Journal</h1>
          <div className="flex justify-center items-center gap-2 opacity-80">
            <Leaf size={16} className={theme.text} />
            <p className={`text-xs font-bold uppercase tracking-widest ${theme.subtext}`}>Login to continue</p>
          </div>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-bold text-center border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase ${theme.subtext} mb-1`}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className={`w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[${theme.primary}] font-bold text-slate-800 bg-white`} required />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase ${theme.subtext} mb-1`}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[${theme.primary}] font-bold text-slate-800 bg-white`} required />
          </div>
          <button type="submit" className={`w-full p-3 rounded-xl font-bold uppercase tracking-widest shadow-lg mt-4 transition-all ${theme.solidBtn}`}>
            {isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className={`text-xs font-bold uppercase ${theme.subtext} hover:opacity-80 underline decoration-dashed underline-offset-4`}>
            {isRegister ? 'Already have an account? Login' : 'New here? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};