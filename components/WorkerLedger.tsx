
import React from 'react';
import { AppState, User, TransactionType } from '../types';

interface WorkerLedgerProps {
  state: AppState;
  currentUser: User;
  onBack: () => void;
}

const WorkerLedger: React.FC<WorkerLedgerProps> = ({ state, currentUser, onBack }) => {
  const workerTransactions = state.transactions.filter(t => t.entityId === currentUser.workerId);
  const workerLogs = state.attendance.filter(a => a.workerId === currentUser.workerId);
  const totalEarned = workerTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1">
          <div className="w-16 h-16 rounded-[1.5rem] gradient-brand flex items-center justify-center text-white text-2xl mb-4 mx-auto md:mx-0">
             <i className="fa-solid fa-wallet"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">Life-to-date Earnings</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center md:text-left">${totalEarned.toLocaleString()}</h2>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-widest">Logs Recalculated</span>
            <span className="text-amber-600 font-black">Just Now</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent Payments Received</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {workerTransactions.length === 0 ? (
              <div className="py-20 text-center">
                <i className="fa-solid fa-receipt text-slate-200 dark:text-slate-800 text-4xl mb-3"></i>
                <p className="text-slate-400 text-xs font-bold uppercase">No payment records found.</p>
              </div>
            ) : (
              [...workerTransactions].reverse().map(txn => (
                <div key={txn.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center">
                         <i className="fa-solid fa-arrow-down-long"></i>
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{txn.description}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(txn.date).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <p className="text-lg font-black text-emerald-600">+${txn.amount.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Work Attendance History</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workerLogs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm italic font-medium">Archive is empty. Start your first shift!</div>
          ) : (
            [...workerLogs].reverse().map(log => {
              const site = state.sites.find(s => s.id === log.siteId);
              return (
                <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">{site?.name}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{new Date(log.punchIn).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{new Date(log.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <i className="fa-solid fa-arrow-right-long text-slate-300"></i>
                    <span>{log.punchOut ? new Date(log.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerLedger;
