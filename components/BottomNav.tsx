
import React from 'react';
import { UserRole } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, userRole }) => {
  const isAdmin = userRole === UserRole.ADMIN;

  const items = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Home', adminOnly: true },
    { id: 'attendance', icon: 'fa-clock', label: 'Punch', adminOnly: false },
    { id: 'sites', icon: 'fa-hard-hat', label: 'Sites', adminOnly: true },
    { id: 'workers', icon: 'fa-users', label: 'Work', adminOnly: false },
    { id: 'finances', icon: 'fa-wallet', label: 'Cash', adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 safe-area-bottom z-50 h-16 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative ${
            activeTab === item.id ? 'text-amber-600 font-bold' : 'text-slate-400'
          }`}
        >
          <i className={`fa-solid ${item.icon} text-lg`}></i>
          <span className="text-[10px] uppercase tracking-tighter">{item.label}</span>
          {activeTab === item.id && (
            <div className="w-1 h-1 rounded-full bg-amber-600 absolute bottom-1"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
