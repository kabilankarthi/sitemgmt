
import React, { useState, useEffect } from 'react';
import { AppState, Worker, Transaction, TransactionType, Attendance } from '../types';

interface IssuePayProps {
  state: AppState;
  onPay: (t: Transaction, attendanceIds?: string[]) => void;
  onBack: () => void;
  initialWorkerId?: string;
}

const IssuePay: React.FC<IssuePayProps> = ({ state, onPay, onBack, initialWorkerId }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState(initialWorkerId || '');
  const [payData, setPayData] = useState({ 
    siteId: '', 
    amount: '', 
    description: 'Wage Payment', 
    type: 'SALARY' 
  });
  const [suggestedWage, setSuggestedWage] = useState(0);
  const [unpaidHours, setUnpaidHours] = useState(0);
  const [unpaidRecords, setUnpaidRecords] = useState<Attendance[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const worker = state.workers.find(w => w.id === selectedWorkerId);
    if (!worker) {
      setSuggestedWage(0);
      setUnpaidHours(0);
      setUnpaidRecords([]);
      return;
    }

    // Filter finished attendance logs for this worker that haven't been paid yet
    const unpaid = state.attendance.filter(a => a.workerId === worker.id && a.punchOut && !a.isPaid);
    setUnpaidRecords(unpaid);

    let totalHours = 0;
    unpaid.forEach(log => {
      if (log.punchOut) {
        const start = new Date(log.punchIn).getTime();
        const end = new Date(log.punchOut).getTime();
        totalHours += (end - start) / (1000 * 60 * 60);
      }
    });

    setUnpaidHours(totalHours);
    // Calculation: (Hours Worked / 9) * Daily Rate
    const suggested = (totalHours / 9) * worker.dailyRate;
    setSuggestedWage(Math.round(suggested * 100) / 100);
    
    setPayData(prev => ({
      ...prev,
      amount: suggested > 0 ? (Math.round(suggested * 100) / 100).toString() : prev.amount,
      siteId: worker.assignedSiteId || '',
      description: prev.type === 'SALARY' ? `Wage Payment (${totalHours.toFixed(1)} hrs)` : prev.description
    }));
  }, [selectedWorkerId, state.attendance, state.workers]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = state.workers.find(w => w.id === selectedWorkerId);
    if (!worker) return;

    onPay({
      id: 'txn-' + Date.now(),
      siteId: payData.siteId || 'general',
      type: TransactionType.EXPENSE,
      amount: parseFloat(payData.amount),
      description: `${payData.type}: ${payData.description}`,
      date: new Date(),
      entityId: worker.id
    }, payData.type === 'SALARY' ? unpaidRecords.map(r => r.id) : []);

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelectedWorkerId('');
      setPayData({ siteId: '', amount: '', description: 'Wage Payment', type: 'SALARY' });
    }, 2000);
  };

  const selectedWorker = state.workers.find(w => w.id === selectedWorkerId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
        <h2 className="text-xl font-black mb-8 text-slate-900 dark:text-white flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center">
              <i className="fa-solid fa-money-check-dollar"></i>
           </div>
           Financial Settlement
        </h2>

        {success ? (
          <div className="py-12 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-check text-4xl"></i>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">Transaction Recorded</p>
            <p className="text-slate-500 text-sm">Disbursement has been finalized.</p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Pay To Staff Member</label>
              <select 
                required
                value={selectedWorkerId} 
                onChange={e => setSelectedWorkerId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white"
              >
                <option value="">Search System Directory...</option>
                {state.workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
              </select>
            </div>

            {selectedWorker && (
              <div className="space-y-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unpaid Shift Log</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{unpaidHours.toFixed(1)} <span className="text-xs text-slate-400">hours</span></p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Suggested Wage</p>
                    <p className="text-xl font-black text-emerald-600">${suggestedWage.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase italic">(9hr / day rule)</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPayData({...payData, type: 'SALARY', amount: suggestedWage.toString(), description: `Wage Settlement (${unpaidHours.toFixed(1)} hrs)`})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${payData.type === 'SALARY' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                  >
                    Salary Settlement
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPayData({...payData, type: 'ADVANCE', description: 'Advance on Wages'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${payData.type === 'ADVANCE' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                  >
                    Advance Pay
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Disbursement Amount ($)</label>
                    <div className="relative">
                      <input 
                        required 
                        type="number" 
                        step="0.01"
                        value={payData.amount} 
                        onChange={e => setPayData({...payData, amount: e.target.value})}
                        className="w-full px-5 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-amber-500/30 dark:border-amber-500/20 rounded-2xl outline-none font-black text-2xl dark:text-white pr-16"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                         Override
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Narrative Log</label>
                    <input 
                      required 
                      value={payData.description} 
                      onChange={e => setPayData({...payData, description: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white"
                      placeholder="Specific notes about this payment..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Financial Hub (Site)</label>
                    <select 
                      required
                      value={payData.siteId} 
                      onChange={e => setPayData({...payData, siteId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white"
                    >
                      <option value="">General Overhead</option>
                      {state.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {payData.type === 'SALARY' && unpaidRecords.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-dashed border-amber-200">
                    <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-2">
                       <i className="fa-solid fa-circle-info mr-1"></i> Settlement Notice
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-500 font-medium">
                      Finalizing this Salary payment will mark <strong>{unpaidRecords.length} shifts</strong> as settled in the system.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={!selectedWorkerId}
              className="w-full py-5 gradient-brand text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-40"
            >
              Authorize & Issue Disbursement
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default IssuePay;
