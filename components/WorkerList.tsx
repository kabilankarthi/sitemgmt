
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
}

const WorkerList: React.FC<WorkerListProps> = ({ workers, sites, onAdd, onUpdate, transactions, onAddTransaction, isAdmin }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [historyWorkerId, setHistoryWorkerId] = useState<string | null>(null);
  const [payWorkerId, setPayWorkerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', dailyRate: '', phone: '', siteId: '' });
  
  const [payData, setPayData] = useState({ 
    siteId: '', 
    amount: '', 
    description: 'Daily Salary', 
    type: 'SALARY' 
  });

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

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payWorkerId) return;

    onAddTransaction({
      id: 'txn-' + Date.now(),
      siteId: payData.siteId,
      type: TransactionType.EXPENSE,
      amount: parseFloat(payData.amount),
      description: `${payData.type}: ${payData.description}`,
      date: new Date(),
      entityId: payWorkerId
    });

    setPayWorkerId(null);
    setPayData({ siteId: '', amount: '', description: 'Daily Salary', type: 'SALARY' });
  };

  const getSiteName = (id: string | null) => sites.find(s => s.id === id)?.name || 'Unassigned';

  const selectedHistoryWorker = workers.find(w => w.id === historyWorkerId);
  const selectedPayWorker = workers.find(w => w.id === payWorkerId);
  
  const workerHistory = transactions.filter(t => t.entityId === historyWorkerId && t.type === TransactionType.EXPENSE);
  const totalPaid = workerHistory.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">{isAdmin ? 'Workforce Directory' : 'My Employment Profile'}</h2>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-amber-500 text-slate-900 font-bold px-4 py-3 sm:py-2 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <i className="fa-solid fa-user-plus"></i> Hire Worker
          </button>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {workers.map(worker => (
          <div key={worker.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 text-lg">{worker.name}</p>
                <p className="text-sm text-slate-500">{worker.role}</p>
              </div>
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold">
                {worker.id}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-2">
              <span className="text-slate-500">Site: <span className="text-amber-700 font-semibold">{getSiteName(worker.assignedSiteId)}</span></span>
              <span className="text-slate-900 font-bold">${worker.dailyRate}/d</span>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <button 
                  onClick={() => {
                    setPayWorkerId(worker.id);
                    setPayData({ ...payData, amount: worker.dailyRate.toString(), siteId: worker.assignedSiteId || '' });
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-hand-holding-dollar"></i> Pay
                </button>
              )}
              <button 
                onClick={() => setHistoryWorkerId(worker.id)}
                className="flex-1 border border-slate-200 py-2 rounded-lg text-sm font-bold text-slate-600 active:bg-slate-50"
              >
                History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Name & Role</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Site Assignment</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Rate</th>
              {isAdmin && <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Contact</th>}
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.map(worker => (
              <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{worker.name}</p>
                  <p className="text-sm text-slate-500">{worker.role}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.assignedSiteId ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {getSiteName(worker.assignedSiteId)}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">${worker.dailyRate}/day</td>
                {isAdmin && <td className="px-6 py-4 text-slate-500 text-sm">{worker.phone}</td>}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setPayWorkerId(worker.id);
                          setPayData({ ...payData, amount: worker.dailyRate.toString(), siteId: worker.assignedSiteId || '' });
                        }}
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        <i className="fa-solid fa-hand-holding-dollar mr-1"></i> Pay
                      </button>
                    )}
                    <button 
                      onClick={() => setHistoryWorkerId(worker.id)}
                      className="text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                    >
                      <i className="fa-solid fa-history mr-1"></i> Payments
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {payWorkerId && selectedPayWorker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[120] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Issue Payment</h2>
                <p className="text-sm text-slate-500">To: {selectedPayWorker.name}</p>
              </div>
              <button onClick={() => setPayWorkerId(null)} className="text-slate-400 p-2"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payment Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPayData({...payData, type: 'SALARY', amount: selectedPayWorker.dailyRate.toString(), description: 'Daily Salary'})}
                    className={`flex-1 py-2 rounded-lg font-bold border transition-all ${payData.type === 'SALARY' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    Daily Wage
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPayData({...payData, type: 'ADVANCE', description: 'Advance Payment'})}
                    className={`flex-1 py-2 rounded-lg font-bold border transition-all ${payData.type === 'ADVANCE' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    Advance
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Charge to Site</label>
                <select required value={payData.siteId} onChange={e => setPayData({...payData, siteId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option value="">Select Project...</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                  <input required type="number" value={payData.amount} onChange={e => setPayData({...payData, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Memo</label>
                  <input required value={payData.description} onChange={e => setPayData({...payData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                  <i className="fa-solid fa-check-double"></i> Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyWorkerId && selectedHistoryWorker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedHistoryWorker.name}'s History</h2>
                <p className="text-sm text-slate-500">{selectedHistoryWorker.role} • ID: {selectedHistoryWorker.id}</p>
              </div>
              <button onClick={() => setHistoryWorkerId(null)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-slate-900">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Daily Rate</p>
                <p className="text-2xl font-bold text-slate-900">${selectedHistoryWorker.dailyRate}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Payment Records</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {workerHistory.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-receipt text-slate-300 text-3xl mb-2"></i>
                  <p className="text-slate-400 text-sm">No payment records found.</p>
                </div>
              ) : (
                workerHistory.map(txn => (
                  <div key={txn.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{txn.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                          {sites.find(s => s.id === txn.siteId)?.name || 'General'}
                        </span>
                        <span>•</span>
                        <span>{new Date(txn.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-red-600 font-bold text-lg">-${txn.amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-6 sm:pt-4 mt-auto">
              <button 
                onClick={() => setHistoryWorkerId(null)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Hire Worker</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-2"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Enter name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role/Trade</label>
                  <input required placeholder="e.g. Mason" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Daily Rate ($)</label>
                  <input required type="number" value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Site Assignment</label>
                <select value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none">
                  <option value="">Unassigned</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4 pb-4 sm:pb-0">
                <button type="submit" className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">Add to Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerList;
