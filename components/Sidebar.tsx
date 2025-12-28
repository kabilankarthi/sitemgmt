
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const isAdmin = userRole === UserRole.ADMIN;
  
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', adminOnly: true },
    { id: 'sites', icon: 'fa-city', label: 'Project Sites', adminOnly: true },
    { id: 'attendance', icon: 'fa-id-badge', label: 'Attendance', adminOnly: false },
    { id: 'workers', icon: 'fa-user-group', label: 'Staff Directory', adminOnly: false },
    { id: 'finances', icon: 'fa-money-bill-transfer', label: 'Site Finances', adminOnly: true },
    { id: 'api', icon: 'fa-terminal', label: 'System API', adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex-col h-full z-20 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="gradient-brand w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-hard-hat text-xl"></i>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">CivicLogix</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-amber-500 text-white font-bold shadow-md' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-sm w-5`}></i>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">System Online</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
