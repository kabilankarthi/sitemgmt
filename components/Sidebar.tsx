
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout }) => {
  const isAdmin = userRole === UserRole.ADMIN;
  
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', adminOnly: true },
    { id: 'sites', icon: 'fa-hard-hat', label: 'Sites', adminOnly: true },
    { id: 'attendance', icon: 'fa-clock', label: 'Attendance', adminOnly: false },
    { id: 'workers', icon: 'fa-users', label: 'Workers', adminOnly: false },
    { id: 'finances', icon: 'fa-file-invoice-dollar', label: 'Finances', adminOnly: true },
    { id: 'api', icon: 'fa-code', label: 'API Ref', adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col h-full shadow-xl z-20">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 w-10 h-10 rounded-lg flex items-center justify-center text-slate-900">
            <i className="fa-solid fa-city text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CivicLogix</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-amber-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto flex flex-col gap-2">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          <i className="fa-solid fa-power-off w-6"></i>
          Logout
        </button>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-4">
          v2.4.0 PRO
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
