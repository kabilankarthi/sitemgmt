
import React, { useState } from 'react';
import { Site } from '../types';

interface SiteListProps {
  sites: Site[];
  onAdd: (site: Site) => void;
  onUpdate: (site: Site) => void;
  onViewSite: (id: string) => void;
}

const SiteList: React.FC<SiteListProps> = ({ sites, onAdd, onUpdate, onViewSite }) => {
  const [showModal, setShowModal] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const initialForm = { 
    name: '', 
    location: '', 
    clientName: '', 
    budget: '',
    lat: '' as string | number,
    lng: '' as string | number,
    status: 'ongoing' as Site['status']
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenModal = (site?: Site) => {
    if (site) {
      setEditSite(site);
      setFormData({
        name: site.name,
        location: site.location,
        clientName: site.clientName,
        budget: site.budget.toString(),
        lat: site.lat,
        lng: site.lng,
        status: site.status
      });
    } else {
      setEditSite(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const handleGetLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoadingLocation(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout for mobile GPS
      maximumAge: 0   // Do not use a cached position
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        }));
        setLoadingLocation(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        let message = "Unable to retrieve location.";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "GPS signal lost or unavailable. Try moving to an open area.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out. Please try again.";
            break;
        }
        alert(message);
        setLoadingLocation(false);
      },
      options
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = typeof formData.lat === 'string' ? parseFloat(formData.lat) : formData.lat;
    const lng = typeof formData.lng === 'string' ? parseFloat(formData.lng) : formData.lng;

    if (isNaN(lat as number) || isNaN(lng as number)) {
      alert("Please enter valid site GPS coordinates before saving.");
      return;
    }

    const siteData: Site = {
      id: editSite ? editSite.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      location: formData.location,
      clientName: formData.clientName,
      budget: parseFloat(formData.budget),
      lat: lat as number,
      lng: lng as number,
      status: formData.status
    };

    if (editSite) {
      onUpdate(siteData);
    } else {
      onAdd(siteData);
    }
    
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Active Projects</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="gradient-brand text-white font-black px-5 py-2.5 rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <i className="fa-solid fa-plus-circle"></i> NEW SITE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map(site => (
          <div key={site.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all card-hover group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                 <i className="fa-solid fa-city"></i>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenModal(site); }}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-600 flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-pencil text-xs"></i>
                </button>
                <span className={`text-[10px] px-3 py-1.5 rounded-full uppercase font-black tracking-widest ${site.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                  {site.status}
                </span>
              </div>
            </div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">{site.name}</h3>
            <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400 mb-8 flex-1">
              <p className="flex items-center gap-3"><i className="fa-solid fa-location-dot w-4 text-amber-500"></i> {site.location}</p>
              <p className="flex items-center gap-3"><i className="fa-solid fa-user-tie w-4 text-amber-500"></i> {site.clientName}</p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">ALLOCATED BUDGET</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">${site.budget.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={() => onViewSite(site.id)}
              className="w-full text-center text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 py-3.5 border-2 border-amber-100 dark:border-amber-900/50 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all active:scale-95"
            >
              ANALYTICS & DATA
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-300 border border-white/20 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {editSite ? 'Update Site' : 'Register New Site'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-rose-500 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Project Identifier</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Geographic Address</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none dark:text-white" />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Latitude</label>
                      <input required type="number" step="any" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Longitude</label>
                      <input required type="number" step="any" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none dark:text-white" />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    className="w-full py-3 bg-slate-900 dark:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all"
                  >
                    {loadingLocation ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-location-crosshairs"></i>}
                    AUTO-DETECT COORDINATES
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Client Entity</label>
                    <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Capital Budget ($)</label>
                    <input required type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none dark:text-white" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-5 gradient-brand text-white font-black rounded-2xl hover:opacity-95 transition-all shadow-xl shadow-amber-500/30 active:scale-95 text-sm tracking-widest">
                {editSite ? 'SAVE CHANGES' : 'INITIALIZE PROJECT SITE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteList;
