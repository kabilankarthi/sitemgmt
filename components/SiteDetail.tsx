
import React from 'react';
import { Site, Worker, Transaction, Attendance, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SiteDetailProps {
  site: Site;
  workers: Worker[];
  transactions: Transaction[];
  attendance: Attendance[];
  onBack: () => void;
  onUpdateSite: (site: Site) => void;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ site, workers, transactions, attendance, onBack, onUpdateSite }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const siteTransactions = transactions.filter(t => t.siteId === site.id);
  const income = siteTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const expenses = siteTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
  
  const siteWorkers = workers.filter(w => w.assignedSiteId === site.id);
  const activeNow = attendance.filter(a => a.siteId === site.id && !a.punchOut).length;

  const progress = Math.min(100, Math.round((expenses / site.budget) * 100));

  const toggleStatus = () => {
    onUpdateSite({
      ...site,
      status: site.status === 'completed' ? 'ongoing' : 'completed'
    });
  };

  const chartData = [
    { name: 'Income', val: income },
    { name: 'Expenses', val: expenses },
    { name: 'Budget', val: site.budget }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={onBack}
          className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600 transition-colors shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{site.name}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{site.location}</p>
        </div>
        <button 
          onClick={toggleStatus}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
            site.status === 'completed' 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200' 
              : 'bg-emerald-600 text-white shadow-emerald-500/20'
          }`}
        >
          {site.status === 'completed' ? 'Reopen Project' : 'Mark as Completed'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Financial Performance</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                 <MiniStat label="Budget" value={`$${(site.budget/1000).toFixed(1)}k`} />
                 <MiniStat label="Burn" value={`$${(expenses/1000).toFixed(1)}k`} highlight={progress > 90} />
                 <MiniStat label="Income" value={`$${(income/1000).toFixed(1)}k`} color="text-emerald-500" />
                 <MiniStat label="Workers" value={siteWorkers.length} />
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Budget Utilization</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                   <div className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }}></div>
                 </div>
               </div>
             </div>
             <i className="fa-solid fa-chart-line absolute -bottom-4 -right-4 text-8xl text-slate-50 dark:text-slate-800/20"></i>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Active Personnel</h3>
              <div className="space-y-3">
                {siteWorkers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No staff assigned to this hub.</p>
                ) : (
                  siteWorkers.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 text-xs shadow-sm">
                           <i className="fa-solid fa-user"></i>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{w.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{w.role}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${attendance.some(a => a.workerId === w.id && !a.punchOut) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Site Activity</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: 'none' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="val">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#10b981' : entry.name === 'Expenses' ? '#f43f5e' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Site Ledger</h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[500px]">
              {siteTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-10">Archive empty.</p>
              ) : (
                [...siteTransactions].reverse().map(t => (
                  <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{t.description}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`text-xs font-black ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, highlight, color }: { label: string, value: string | number, highlight?: boolean, color?: string }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-lg font-black tracking-tight ${highlight ? 'text-rose-500' : color ? color : 'text-slate-900 dark:text-white'}`}>{value}</p>
  </div>
);

export default SiteDetail;
