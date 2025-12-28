
import React, { useState } from 'react';
import { Transaction, TransactionType, Site } from '../types';

interface FinanceTrackerProps {
  transactions: Transaction[];
  sites: Site[];
  onAdd: (t: Transaction) => void;
}

const FinanceTracker: React.FC<FinanceTrackerProps> = ({ transactions, sites, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    siteId: '', 
    amount: '', 
    type: TransactionType.INCOME, 
    description: '' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: 'txn-' + Math.random().toString(36).substr(2, 5),
      siteId: formData.siteId,
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
      date: new Date()
    });
    setFormData({ siteId: '', amount: '', type: TransactionType.INCOME, description: '' });
    setShowModal(false);
  };

  const sortedTxns = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Capital Ledger</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto gradient-brand text-white font-black px-6 py-3 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-primary-500/20"
        >
          <i className="fa-solid fa-plus-circle"></i> NEW RECORD
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {sortedTxns.map(txn => (
          <div key={txn.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center card-hover transition-all">
            <div className="flex gap-4 items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${txn.type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
                <i className={`fa-solid ${txn.type === TransactionType.INCOME ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white text-sm leading-tight uppercase tracking-tight">{txn.description}</p>
                <div className="flex gap-2 items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                  <span className="text-primary-500">{sites.find(s => s.id === txn.siteId)?.name || 'CENTRAL'}</span>
                  <span>•</span>
                  <span>{new Date(txn.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <p className={`font-black text-lg ${txn.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {txn.type === TransactionType.INCOME ? '+' : '-'}${txn.amount.toLocaleString()}
            </p>
          </div>
        ))}
        {sortedTxns.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <i className="fa-solid fa-receipt text-slate-200 dark:text-slate-800 text-5xl mb-4"></i>
             <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Zero transaction flow detected</p>
          </div>
        )}
      </div>

      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-all">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[.3em]">Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[.3em]">Memo</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[.3em]">Entity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[.3em]">Value</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[.3em] text-right">Class</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
            {sortedTxns.map(txn => (
              <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">{new Date(txn.date).toLocaleDateString()}</td>
                <td className="px-8 py-5">
                  <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{txn.description}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">
                    {sites.find(s => s.id === txn.siteId)?.name || 'CENTRAL'}
                  </span>
                </td>
                <td className={`px-8 py-5 font-black text-lg ${txn.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {txn.type === TransactionType.INCOME ? '+' : '-'}${txn.amount.toLocaleString()}
                </td>
                <td className="px-8 py-5 text-right">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${txn.type === TransactionType.INCOME ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'}`}>
                    {txn.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ledger Entry</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">Flow Type</label>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: TransactionType.INCOME})}
                    className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-3 ${formData.type === TransactionType.INCOME ? 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-xl shadow-emerald-500/20' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'}`}
                  >
                    <i className="fa-solid fa-download"></i> Income
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: TransactionType.EXPENSE})}
                    className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-3 ${formData.type === TransactionType.EXPENSE ? 'bg-rose-500 text-white border-rose-500 scale-105 shadow-xl shadow-rose-500/20' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'}`}
                  >
                    <i className="fa-solid fa-upload"></i> Expense
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Source/Target Hub</label>
                <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold dark:text-white">
                  <option value="">SELECT PROJECT HUB...</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Capital Value ($)</label>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-5 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-2xl font-black dark:text-white" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Transaction Narrative</label>
                  <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold" placeholder="e.g. Raw material procurement" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 gradient-brand text-white font-black rounded-2xl hover:opacity-95 transition-all shadow-xl shadow-primary-500/30 active:scale-95 text-sm tracking-widest mt-4">
                LEGALIZE RECORD
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTracker;
