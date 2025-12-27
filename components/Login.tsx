
import React from 'react';
import { User, UserRole, Worker } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  workers: Worker[];
}

const Login: React.FC<LoginProps> = ({ onLogin, workers }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex bg-amber-500 w-16 h-16 rounded-2xl items-center justify-center text-slate-950 mb-4 shadow-xl shadow-amber-500/20">
            <i className="fa-solid fa-city text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white">CivicLogix</h1>
          <p className="text-slate-400 mt-2 italic">Civil Engineering Resource Planning</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin({ id: 'admin-1', name: 'Head Engineer', role: UserRole.ADMIN })}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg"
          >
            <i className="fa-solid fa-user-shield text-xl"></i>
            Login as Admin
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-slate-500 uppercase tracking-widest font-bold">Worker Access</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Employee Profile</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {workers.map(worker => (
                <button
                  key={worker.id}
                  onClick={() => onLogin({ 
                    id: `u-${worker.id}`, 
                    name: worker.name, 
                    role: UserRole.WORKER, 
                    workerId: worker.id 
                  })}
                  className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
                >
                  <div className="text-left">
                    <p className="font-bold text-white">{worker.name}</p>
                    <p className="text-xs text-slate-500">{worker.role}</p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-600"></i>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase tracking-widest">
          Enterprise Security Enabled • SSL Protected
        </p>
      </div>
    </div>
  );
};

export default Login;
