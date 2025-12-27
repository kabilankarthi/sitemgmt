
import React from 'react';
import { AppState, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Projects" value={state.sites.length} icon="fa-briefcase" color="blue" />
        <StatCard label="Active Workers" value={activeWorkers} icon="fa-user-clock" color="green" />
        <StatCard label="Total Revenue" value={`$${totalIncome.toLocaleString()}`} icon="fa-money-bill-trend-up" color="amber" />
        <StatCard label="Burn Rate (Expenses)" value={`$${totalExpenses.toLocaleString()}`} icon="fa-credit-card" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Financial Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#f59e0b">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Project Budget Consumption</h3>
          <div className="space-y-4 overflow-y-auto max-h-64">
            {siteStats.map(stat => (
              <div key={stat.name} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{stat.name}</span>
                  <span>{Math.round((stat.expense / stat.budget) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stat.expense > stat.budget ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (stat.expense / stat.budget) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`${colorMap[color]} w-12 h-12 rounded-lg flex items-center justify-center text-xl`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
