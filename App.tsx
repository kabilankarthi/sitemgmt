
import React, { useState, useEffect } from 'react';
import { AppState, Site, Worker, Attendance, Transaction, TransactionType, User, UserRole } from './types';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import SiteList from './components/SiteList';
import WorkerList from './components/WorkerList';
import FinanceTracker from './components/FinanceTracker';
import AttendanceTracker from './components/AttendanceTracker';
import ApiDocs from './components/ApiDocs';
import Login from './components/Login';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civic_logix_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('civic_logix_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          attendance: (parsed.attendance || []).map((a: any) => ({
            ...a,
            punchIn: new Date(a.punchIn),
            punchOut: a.punchOut ? new Date(a.punchOut) : undefined
          })),
          transactions: (parsed.transactions || []).map((t: any) => ({
            ...t,
            date: new Date(t.date)
          }))
        };
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    
    return {
      sites: [
        { id: '1', name: 'Metro Flyover A-12', location: 'Downtown', lat: 34.0522, lng: -118.2437, clientName: 'City Council', budget: 500000, status: 'ongoing' },
        { id: '2', name: 'River Bridge East', location: 'Riverside', lat: 34.0622, lng: -118.2537, clientName: 'Highway Dept', budget: 1200000, status: 'ongoing' }
      ],
      workers: [
        { id: 'w1', name: 'John Doe', role: 'Foreman', dailyRate: 150, assignedSiteId: '1', phone: '555-0101' },
        { id: 'w2', name: 'Sarah Smith', role: 'Architect', dailyRate: 250, assignedSiteId: '2', phone: '555-0102' }
      ],
      attendance: [],
      transactions: [
        { id: 't1', siteId: '1', type: TransactionType.INCOME, amount: 50000, description: 'Initial Milestone Payment', date: new Date() }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('civic_logix_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('civic_logix_user', JSON.stringify(currentUser));
    if (currentUser?.role === UserRole.WORKER) {
      setActiveTab('attendance');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civic_logix_user');
  };

  const addSite = (site: Site) => setState(prev => ({ ...prev, sites: [...prev.sites, site] }));
  const addWorker = (worker: Worker) => setState(prev => ({ ...prev, workers: [...prev.workers, worker] }));
  const updateWorker = (updatedWorker: Worker) => setState(prev => ({
    ...prev,
    workers: prev.workers.map(w => w.id === updatedWorker.id ? updatedWorker : w)
  }));
  const addTransaction = (t: Transaction) => setState(prev => ({ ...prev, transactions: [...prev.transactions, t] }));
  const addAttendance = (a: Attendance) => setState(prev => ({ ...prev, attendance: [...prev.attendance, a] }));
  const updateAttendance = (a: Attendance) => setState(prev => ({
    ...prev,
    attendance: prev.attendance.map(item => item.id === a.id ? a : item)
  }));

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} workers={state.workers} />;
  }

  const renderContent = () => {
    const isAdmin = currentUser.role === UserRole.ADMIN;
    
    switch (activeTab) {
      case 'dashboard': 
        return isAdmin ? <Dashboard state={state} /> : <AttendanceTracker attendance={state.attendance} workers={state.workers} sites={state.sites} onPunchIn={addAttendance} onPunchOut={updateAttendance} currentUser={currentUser} />;
      case 'sites': 
        return isAdmin ? <SiteList sites={state.sites} onAdd={addSite} /> : null;
      case 'workers': 
        const displayWorkers = isAdmin ? state.workers : state.workers.filter(w => w.id === currentUser.workerId);
        return <WorkerList 
          workers={displayWorkers} 
          sites={state.sites} 
          onAdd={addWorker} 
          onUpdate={updateWorker} 
          onAddTransaction={addTransaction}
          transactions={state.transactions} 
          isAdmin={isAdmin} 
        />;
      case 'finances': 
        return isAdmin ? <FinanceTracker transactions={state.transactions} sites={state.sites} onAdd={addTransaction} /> : null;
      case 'attendance': 
        return <AttendanceTracker attendance={state.attendance} workers={state.workers} sites={state.sites} onPunchIn={addAttendance} onPunchOut={updateAttendance} currentUser={currentUser} />;
      case 'api': 
        return isAdmin ? <ApiDocs /> : null;
      default: 
        return <Dashboard state={state} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-6 md:mb-8 flex justify-between items-center sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-slate-500 text-sm hidden md:block">
              {currentUser.role === UserRole.ADMIN ? 'Administrator Control Center' : 'Field Worker Portal'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.name}</p>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">{currentUser.role}</span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300 shadow-sm overflow-hidden">
               <i className={`fa-solid ${currentUser.role === UserRole.ADMIN ? 'fa-user-tie' : 'fa-hard-hat'}`}></i>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} />
    </div>
  );
};

export default App;
