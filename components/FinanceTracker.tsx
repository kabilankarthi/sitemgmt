
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
        <h2 className="text-xl font-bold text-slate-900">Financial Ledger</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-slate-900 text-white font-bold px-4 py-3 sm:py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-plus-circle"></i> Add Entry
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {sortedTxns.map(txn => (
          <div key={txn.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === TransactionType.INCOME ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <i className={`fa-solid ${txn.type === TransactionType.INCOME ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm leading-tight">{txn.description}</p>
                <div className="flex gap-2 items-center text-[10px] text-slate-500 mt-0.5">
                  <span className="font-semibold text-amber-600">{sites.find(s => s.id === txn.siteId)?.name || 'General'}</span>
                  <span>•</span>
                  <span>{new Date(txn.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <p className={`font-bold text-base ${txn.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
              {txn.type === TransactionType.INCOME ? '+' : '-'}${txn.amount.toLocaleString()}
            </p>
          </div>
        ))}
        {sortedTxns.length === 0 && <p className="text-center text-slate-400 py-10">No transactions recorded yet.</p>}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Date</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Description</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Project</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Amount</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase text-right">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTxns.map(txn => (
              <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(txn.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{txn.description}</p>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {sites.find(s => s.id === txn.siteId)?.name || 'General'}
                </td>
                <td className={`px-6 py-4 font-bold ${txn.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === TransactionType.INCOME ? '+' : '-'}${txn.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${txn.type === TransactionType.INCOME ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {txn.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 p-2"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Transaction Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: TransactionType.INCOME})}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${formData.type === TransactionType.INCOME ? 'bg-green-500 text-white border-green-500 scale-[1.02]' : 'bg-white text-slate-400 border-slate-100'}`}
                  >
                    <i className="fa-solid fa-download mr-2"></i> Income
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: TransactionType.EXPENSE})}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-red-500 text-white border-red-500 scale-[1.02]' : 'bg-white text-slate-400 border-slate-100'}`}
                  >
                    <i className="fa-solid fa-upload mr-2"></i> Expense
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Site</label>
                <select required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none">
                  <option value="">Choose Site...</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xl font-bold" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                  <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="e.g. Concrete Materials" />
                </div>
              </div>
              <div className="flex gap-4 pt-4 pb-4 sm:pb-0">
                <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTracker;
