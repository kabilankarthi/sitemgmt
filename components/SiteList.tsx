
import React, { useState } from 'react';
import { Site } from '../types';

interface SiteListProps {
  sites: Site[];
  onAdd: (site: Site) => void;
}

const SiteList: React.FC<SiteListProps> = ({ sites, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', clientName: '', budget: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      location: formData.location,
      clientName: formData.clientName,
      budget: parseFloat(formData.budget),
      status: 'ongoing'
    });
    setFormData({ name: '', location: '', clientName: '', budget: '' });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Active Construction Sites</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Add New Site
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map(site => (
          <div key={site.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-900">{site.name}</h3>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded uppercase font-bold">{site.status}</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <p><i className="fa-solid fa-location-dot w-5 text-slate-400"></i> {site.location}</p>
              <p><i className="fa-solid fa-user-tie w-5 text-slate-400"></i> Client: {site.clientName}</p>
              <p><i className="fa-solid fa-wallet w-5 text-slate-400"></i> Budget: ${site.budget.toLocaleString()}</p>
            </div>
            <button className="w-full text-center text-sm font-semibold text-amber-600 hover:text-amber-700 py-2 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
              View Detailed Analytics
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Site</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Budget ($)</label>
                <input required type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-600 transition-colors">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteList;
