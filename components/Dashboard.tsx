
import React from 'react';
import { AppState, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const totalIncome = state.transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = state.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const activeWorkers = state.attendance.filter(a => !a.punchOut).length;

  const chartData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpenses },
  ];

  const siteStats = state.sites.map(site => {
    const siteExpenses = state.transactions
      .filter(t => t.siteId === site.id && t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: site.name, expense: siteExpenses, budget: site.budget };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Live Sites" value={state.sites.length} icon="fa-building-columns" color="amber" />
        <StatCard label="On-Site" value={activeWorkers} icon="fa-hard-hat" color="emerald" />
        <StatCard label="Total Income" value={`$${(totalIncome/1000).toFixed(1)}k`} icon="fa-vault" color="amber" />
        <StatCard label="Expenses" value={`$${(totalExpenses/1000).toFixed(1)}k`} icon="fa-credit-card" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black mb-6 text-slate-800 dark:text-white">Financial Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} />
                <YAxis stroke={textColor} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black mb-6 text-slate-800 dark:text-white">Project Utilization</h3>
          <div className="space-y-5 overflow-y-auto max-h-64 pr-2">
            {siteStats.map(stat => {
              const percentage = Math.round((stat.expense / stat.budget) * 100);
              return (
                <div key={stat.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[70%]">{stat.name}</span>
                    <span className={percentage > 90 ? 'text-rose-500' : 'text-amber-500'}>{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>${stat.expense.toLocaleString()} spent</span>
                    <span>Goal: ${stat.budget.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) => {
  const colorMap: any = {
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 card-hover">
      <div className={`${colorMap[color]} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
