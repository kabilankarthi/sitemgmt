
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
    { id: 'attendance', icon: 'fa-id-badge', label: 'Presence', adminOnly: false },
    { id: 'sites', icon: 'fa-city', label: 'Sites', adminOnly: true },
    { id: 'workers', icon: 'fa-user-group', label: 'Workforce', adminOnly: false },
    { id: 'finances', icon: 'fa-receipt', label: 'Finances', adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <nav className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-95"
            >
              <div className={`
                transition-colors duration-200
                ${isActive ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}
              `}>
                <i className={`fa-solid ${item.icon} text-lg`}></i>
              </div>
              <span className={`
                text-[10px] font-bold transition-colors duration-200
                ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}
              `}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-amber-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
      <div className="h-[env(safe-area-inset-bottom)]"></div>
    </div>
  );
};

export default BottomNav;
