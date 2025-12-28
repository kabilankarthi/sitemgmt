
import React, { useState } from 'react';
import { Worker, Site, Transaction, TransactionType } from '../types';

interface WorkerListProps {
  workers: Worker[];
  sites: Site[];
  transactions: Transaction[];
  onAdd: (worker: Worker) => void;
  onUpdate: (worker: Worker) => void;
  onAddTransaction: (t: Transaction) => void;
  isAdmin: boolean;
  onIssuePay: (workerId: string) => void;
}

const WorkerList: React.FC<WorkerListProps> = ({ workers, sites, onAdd, onUpdate, transactions, onAddTransaction, isAdmin, onIssuePay }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [historyWorkerId, setHistoryWorkerId] = useState<string | null>(null);
  const [transferWorkerId, setTransferWorkerId] = useState<string | null>(null);
  const [filterSiteId, setFilterSiteId] = useState<string>('all');
  const [formData, setFormData] = useState({ name: '', role: '', dailyRate: '', phone: '', siteId: '' });
  const [newSiteId, setNewSiteId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: 'w-' + Math.random().toString(36).substr(2, 5),
      name: formData.name,
      role: formData.role,
      dailyRate: parseFloat(formData.dailyRate),
      phone: formData.phone,
      assignedSiteId: formData.siteId || null
    });
    setFormData({ name: '', role: '', dailyRate: '', phone: '', siteId: '' });
    setShowAddModal(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find(w => w.id === transferWorkerId);
    if (worker) {
      onUpdate({ ...worker, assignedSiteId: newSiteId || null });
    }
    setTransferWorkerId(null);
    setNewSiteId('');
  };

  const getSiteName = (id: string | null) => sites.find(s => s.id === id)?.name || 'Unassigned (Pool)';

  const selectedHistoryWorker = workers.find(w => w.id === historyWorkerId);
  const selectedTransferWorker = workers.find(w => w.id === transferWorkerId);
  
  const workerHistory = transactions.filter(t => t.entityId === historyWorkerId && t.type === TransactionType.EXPENSE);
  const totalPaid = workerHistory.reduce((sum, t) => sum + t.amount, 0);

  const filteredWorkers = workers.filter(worker => {
    if (filterSiteId === 'all') return true;
    if (filterSiteId === 'none') return !worker.assignedSiteId;
    return worker.assignedSiteId === filterSiteId;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Active Workforce</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Showing {filteredWorkers.length} of {workers.length} Members</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {isAdmin && (
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={filterSiteId}
                onChange={(e) => setFilterSiteId(e.target.value)}
                className="w-full sm:w-48 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 appearance-none shadow-sm"
              >
                <option value="all">View All Sites</option>
                <option value="none">Unassigned Only</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <i className="fa-solid fa-filter text-[10px]"></i>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-black px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm"
              >
                <i className="fa-solid fa-plus-circle text-amber-500"></i> Onboard
              </button>
              <button 
                className="flex-1 sm:flex-none gradient-brand text-white font-black px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95"
                onClick={() => onIssuePay('')}
              >
                <i className="fa-solid fa-hand-holding-dollar"></i> Payroll
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-300">
            <i className="fa-solid fa-user-slash text-2xl"></i>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No personnel found for this selection</p>
          <button onClick={() => setFilterSiteId('all')} className="mt-4 text-[10px] font-black uppercase text-amber-500 tracking-tighter hover:underline">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => (
            <div key={worker.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all card-hover group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-hard-hat"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{worker.name}</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{worker.role}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Hub:</span>
                  <span className={`font-black uppercase tracking-widest text-[10px] ${worker.assignedSiteId ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                    {getSiteName(worker.assignedSiteId)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Wage:</span>
                  <span className="text-slate-900 dark:text-white font-black">${worker.dailyRate}<span className="text-[10px] font-bold text-slate-400">/day</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {isAdmin && (
                  <button 
                    onClick={() => onIssuePay(worker.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                  >
                    <i className="fa-solid fa-wallet mr-1.5"></i> Pay Wages
                  </button>
                )}
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setTransferWorkerId(worker.id);
                      setNewSiteId(worker.assignedSiteId || '');
                    }}
                    className="bg-slate-900 dark:bg-slate-800 hover:opacity-80 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-shuffle mr-1.5"></i> Reassign
                  </button>
                )}
                <button 
                  onClick={() => setHistoryWorkerId(worker.id)}
                  className={`border-2 border-slate-100 dark:border-slate-800 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all ${isAdmin ? 'col-span-2' : 'col-span-2'}`}
                >
                  <i className="fa-solid fa-history mr-1.5"></i> Disbursement Records
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfer Modal */}
      {transferWorkerId && selectedTransferWorker && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[130] p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff Deployment</h2>
              <button onClick={() => setTransferWorkerId(null)} className="text-slate-400"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest mb-1 text-center">CURRENT HUB</p>
                <p className="text-lg font-black text-slate-900 dark:text-white text-center">{getSiteName(selectedTransferWorker.assignedSiteId)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">DESTINATION SITE</label>
                <select 
                  required 
                  value={newSiteId} 
                  onChange={e => setNewSiteId(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white"
                >
                  <option value="">POOL (UNASSIGNED)</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-5 gradient-brand text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
                Authorize Relocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyWorkerId && selectedHistoryWorker && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedHistoryWorker.name}'s Ledger</h2>
              <button onClick={() => setHistoryWorkerId(null)} className="text-slate-400"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Earnings</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">${totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wage Rate</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">${selectedHistoryWorker.dailyRate}/d</p>
                </div>
              </div>
              
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">Recent Disbursements</h4>
              {workerHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">No disbursements found in system registry.</div>
              ) : (
                workerHistory.slice().reverse().map(txn => (
                  <div key={txn.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                       <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{txn.description}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-lg font-black text-emerald-600">+${txn.amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff Onboarding</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Identity</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Specialization</label>
                  <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Wage/Rate ($)</label>
                  <input required type="number" value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Mobile</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold dark:text-white" />
                </div>
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Initial Deployment</label>
                <select 
                  value={formData.siteId} 
                  onChange={e => setFormData({...formData, siteId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold dark:text-white"
                >
                  <option value="">Pool (Unassigned)</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-5 gradient-brand text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
                Authorize Onboarding
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerList;
