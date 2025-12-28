
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
import SiteDetail from './components/SiteDetail';
import IssuePay from './components/IssuePay';
import WorkerLedger from './components/WorkerLedger';
import { ApiService } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedWorkerIdForPay, setSelectedWorkerIdForPay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civic_logix_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [state, setState] = useState<AppState>({
    sites: [],
    workers: [],
    attendance: [],
    transactions: [],
    adminPhone: ''
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ApiService.getInitialState();
        setState(data);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('civic_logix_user', JSON.stringify(currentUser));
      if (currentUser.role === UserRole.WORKER && (activeTab === 'dashboard' || activeTab === 'sites' || activeTab === 'finances' || activeTab === 'api')) {
        setActiveTab('attendance');
      }
    } else {
      localStorage.removeItem('civic_logix_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setCurrentUser(null);
    }
  };

  const addSite = async (site: Site) => {
    setSyncing(true);
    try {
      const savedSite = await ApiService.addSite(site);
      setState(prev => ({ ...prev, sites: [...prev.sites, savedSite] }));
    } finally { setSyncing(false); }
  };

  const updateSite = async (site: Site) => {
    setSyncing(true);
    try {
      const updated = await ApiService.updateSite(site);
      setState(prev => ({
        ...prev,
        sites: prev.sites.map(s => s.id === updated.id ? updated : s)
      }));
    } finally { setSyncing(false); }
  };

  const addWorker = async (worker: Worker) => {
    setSyncing(true);
    try {
      const savedWorker = await ApiService.addWorker(worker);
      setState(prev => ({ ...prev, workers: [...prev.workers, savedWorker] }));
    } finally { setSyncing(false); }
  };

  const updateWorker = async (updatedWorker: Worker) => {
    setSyncing(true);
    try {
      const saved = await ApiService.updateWorker(updatedWorker);
      setState(prev => ({
        ...prev,
        workers: prev.workers.map(w => w.id === saved.id ? saved : w)
      }));
    } finally { setSyncing(false); }
  };

  const addTransaction = async (t: Transaction) => {
    setSyncing(true);
    try {
      const saved = await ApiService.addTransaction(t);
      setState(prev => ({ ...prev, transactions: [...prev.transactions, saved] }));
    } finally { setSyncing(false); }
  };

  const handleIssuePay = async (t: Transaction, attendanceIds?: string[]) => {
    setSyncing(true);
    try {
      const savedTx = await ApiService.addTransaction(t);
      let updatedAttendance = [...state.attendance];
      
      if (attendanceIds && attendanceIds.length > 0) {
        updatedAttendance = state.attendance.map(a => 
          attendanceIds.includes(a.id) ? { ...a, isPaid: true } : a
        );
        const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        db.attendance = updatedAttendance;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      }

      setState(prev => ({ 
        ...prev, 
        transactions: [...prev.transactions, savedTx],
        attendance: updatedAttendance
      }));
    } finally { setSyncing(false); }
  };

  const addAttendance = async (a: Attendance) => {
    setSyncing(true);
    try {
      const saved = await ApiService.punchIn(a);
      setState(prev => ({ ...prev, attendance: [...prev.attendance, saved] }));
    } finally { setSyncing(false); }
  };

  const updateAttendance = async (a: Attendance) => {
    setSyncing(true);
    try {
      const saved = await ApiService.punchOut(a);
      setState(prev => ({
        ...prev,
        attendance: prev.attendance.map(item => item.id === saved.id ? saved : item)
      }));
    } finally { setSyncing(false); }
  };

  const handleViewSite = (id: string) => {
    setSelectedSiteId(id);
    setActiveTab('site-detail');
  };

  const handleGoToPay = (workerId: string) => {
    setSelectedWorkerIdForPay(workerId);
    setActiveTab('issue-pay');
  };

  const STORAGE_KEY = 'civic_logix_db_v3';

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Engine...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const isAdmin = currentUser.role === UserRole.ADMIN;
    switch (activeTab) {
      case 'dashboard': return isAdmin ? <Dashboard state={state} /> : null;
      case 'sites': return isAdmin ? <SiteList sites={state.sites} onAdd={addSite} onUpdate={updateSite} onViewSite={handleViewSite} /> : null;
      case 'workers': 
        const displayWorkers = isAdmin ? state.workers : state.workers.filter(w => w.id === currentUser.workerId);
        return <WorkerList workers={displayWorkers} sites={state.sites} onAdd={addWorker} onUpdate={updateWorker} onAddTransaction={addTransaction} transactions={state.transactions} isAdmin={isAdmin} onIssuePay={handleGoToPay} />;
      case 'finances': return isAdmin ? <FinanceTracker transactions={state.transactions} sites={state.sites} onAdd={addTransaction} /> : null;
      case 'attendance': return <AttendanceTracker attendance={state.attendance} workers={state.workers} sites={state.sites} onPunchIn={addAttendance} onPunchOut={updateAttendance} currentUser={currentUser} onViewLedger={() => setActiveTab('my-ledger')} />;
      case 'issue-pay': return isAdmin ? <IssuePay state={state} onPay={handleIssuePay} onBack={() => setActiveTab('workers')} initialWorkerId={selectedWorkerIdForPay || ''} /> : null;
      case 'my-ledger': return <WorkerLedger state={state} currentUser={currentUser} onBack={() => setActiveTab('attendance')} />;
      case 'api': return isAdmin ? <ApiDocs /> : null;
      case 'site-detail': 
        const site = state.sites.find(s => s.id === selectedSiteId);
        return site ? <SiteDetail site={site} workers={state.workers} transactions={state.transactions} attendance={state.attendance} onBack={() => setActiveTab('sites')} onUpdateSite={updateSite} /> : <SiteList sites={state.sites} onAdd={addSite} onUpdate={updateSite} onViewSite={handleViewSite} />;
      default: return isAdmin ? <Dashboard state={state} /> : <AttendanceTracker attendance={state.attendance} workers={state.workers} sites={state.sites} onPunchIn={addAttendance} onPunchOut={updateAttendance} currentUser={currentUser} onViewLedger={() => setActiveTab('my-ledger')} />;
    }
  };

  const isSubPage = ['site-detail', 'issue-pay', 'my-ledger'].includes(activeTab);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex-col md:flex-row transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} />
      
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 flex flex-col relative">
        <header className="safe-area-top sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 px-4 md:px-8 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              {isSubPage && (
                <button 
                  onClick={() => {
                    if (activeTab === 'site-detail') setActiveTab('sites');
                    else if (activeTab === 'issue-pay') setActiveTab('workers');
                    else if (activeTab === 'my-ledger') setActiveTab('attendance');
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <i className="fa-solid fa-arrow-left text-sm"></i>
                </button>
              )}
              <div>
                <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white capitalize tracking-tight leading-none">{activeTab.replace('-', ' ')}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                   {syncing && <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1 uppercase"><i className="fa-solid fa-circle-notch animate-spin"></i> Syncing</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => setIsDark(!isDark)}
                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center transition-all"
              >
                <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
              </button>
              <button 
                onClick={handleLogout}
                className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center transition-all hover:bg-rose-100"
                title="Logout"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
              </button>
              <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
                 <i className={`fa-solid ${currentUser.role === UserRole.ADMIN ? 'fa-user-tie' : 'fa-helmet-safety'} text-sm`}></i>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto w-full p-4 md:p-8 flex-1">
          {renderContent()}
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} />
    </div>
  );
};

export default App;
