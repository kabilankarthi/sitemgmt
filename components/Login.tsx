
import React, { useState } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await ApiService.login(phone, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const status = await ApiService.resetPassword(phone);
      setResetStatus(status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'forgot') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[100px] rounded-full"></div>
        <div className="max-w-md w-full relative z-10">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Account Recovery</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">Enter your registered phone number to reset access.</p>

            {resetStatus ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 text-center animate-in zoom-in duration-300">
                <i className="fa-solid fa-paper-plane text-emerald-500 text-3xl mb-4"></i>
                <p className="text-emerald-700 dark:text-emerald-400 font-bold">{resetStatus}</p>
                <button onClick={() => setView('login')} className="mt-6 text-xs font-black uppercase text-slate-400 hover:text-amber-500 tracking-widest">Back to Login</button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Registered Phone</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white" placeholder="0000000000" />
                </div>
                {error && <p className="text-xs text-rose-500 font-bold px-1">{error}</p>}
                <button disabled={loading} type="submit" className="w-full py-5 gradient-brand text-white font-black rounded-3xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center">
                  {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'SEND RESET CODE'}
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full text-xs font-black uppercase text-slate-400 hover:text-amber-500 tracking-widest transition-colors">
                  Return to Dashboard
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[100px] rounded-full"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex gradient-brand w-20 h-20 rounded-[2rem] items-center justify-center text-white mb-6 shadow-2xl shadow-primary-500/40 transform -rotate-6 animate-in zoom-in duration-700">
            <i className="fa-solid fa-helmet-safety text-4xl"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">CivicLogix</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Strategic Site Intelligence</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Mobile Identity</label>
              <div className="relative">
                <i className="fa-solid fa-phone absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600"></i>
                <input 
                  required 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white focus:ring-2 focus:ring-amber-500/20 transition-all" 
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center px-1 mb-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Security Code</label>
                <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black uppercase text-amber-500 hover:text-amber-600">Forgot?</button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600"></i>
                <input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white focus:ring-2 focus:ring-amber-500/20 transition-all" 
                  placeholder="Password"
                />
              </div>
            </div>

            {error && <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-500 text-[10px] font-black uppercase text-center">{error}</div>}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-5 gradient-brand text-white font-black rounded-3xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm tracking-widest"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch animate-spin text-xl"></i>
              ) : (
                <>
                  <i className="fa-solid fa-shield-check"></i>
                  AUTHORIZE ACCESS
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-4 opacity-40 justify-center">
                <i className="fa-solid fa-fingerprint text-slate-400"></i>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[.3em]">AES-256 SECURED GATEWAY</p>
             </div>
          </div>
        </div>
        
        <div className="text-center mt-8 space-y-2">
          <p className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">Default Admin: 0000000000 / admin</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">Default Worker: 1234567890 / 123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
