
import React, { useState } from 'react';
import { Attendance, Worker, Site, User, UserRole } from '../types';

interface AttendanceTrackerProps {
  attendance: Attendance[];
  workers: Worker[];
  sites: Site[];
  onPunchIn: (a: Attendance) => void;
  onPunchOut: (a: Attendance) => void;
  currentUser: User;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ attendance, workers, sites, onPunchIn, onPunchOut, currentUser }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const [selectedWorkerId, setSelectedWorkerId] = useState(isAdmin ? '' : (currentUser.workerId || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Haversine formula to calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  const handlePunchIn = () => {
    if (!selectedWorkerId) return;
    setLoading(true);
    setError(null);

    const worker = workers.find(w => w.id === selectedWorkerId);
    if (!worker || !worker.assignedSiteId) {
      setError("Worker must be assigned to a site to punch in.");
      setLoading(false);
      return;
    }

    const targetSite = sites.find(s => s.id === worker.assignedSiteId);
    if (!targetSite) {
      setError("Assigned site not found in database.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const distance = calculateDistance(userLat, userLng, targetSite.lat, targetSite.lng);

        // Verification: Must be within 500 meters of the site
        const GEOFENCE_RADIUS = 500; 

        if (distance > GEOFENCE_RADIUS) {
          setError(`Location mismatch. You are ${Math.round(distance)}m away from ${targetSite.name}. Must be within ${GEOFENCE_RADIUS}m.`);
          setLoading(false);
          return;
        }

        const newRecord: Attendance = {
          id: 'attn-' + Date.now(),
          workerId: selectedWorkerId,
          siteId: worker.assignedSiteId!,
          punchIn: new Date(),
          location: {
            lat: userLat,
            lng: userLng
          }
        };
        onPunchIn(newRecord);
        if (isAdmin) setSelectedWorkerId('');
        setLoading(false);
      },
      (err) => {
        setError("Location access denied. Please enable GPS to punch in.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePunchOut = (recordId: string) => {
    const record = attendance.find(a => a.id === recordId);
    if (record) {
      onPunchOut({ ...record, punchOut: new Date() });
    }
  };

  const activeRecords = attendance.filter(a => !a.punchOut && (isAdmin || a.workerId === currentUser.workerId));
  const completedRecords = attendance.filter(a => !!a.punchOut && (isAdmin || a.workerId === currentUser.workerId)).slice().reverse();

  return (
    <div className="space-y-6">
      {/* Punch Interface Gated by site assignment and user */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-fingerprint text-amber-500"></i> Punch Console
        </h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isAdmin ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Worker</label>
              <select 
                value={selectedWorkerId} 
                onChange={e => setSelectedWorkerId(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-base"
              >
                <option value="">-- Choose employee --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} • {w.role}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-2">
              <p className="text-xs text-amber-600 font-bold uppercase">Ready for Shift</p>
              <p className="text-lg font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-sm text-slate-500">Site: {sites.find(s => s.id === workers.find(w => w.id === currentUser.workerId)?.assignedSiteId)?.name || 'None Assigned'}</p>
            </div>
          )}
          
          <button 
            onClick={handlePunchIn}
            disabled={loading || !selectedWorkerId || activeRecords.some(r => r.workerId === selectedWorkerId)}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 active:scale-95"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin text-xl"></i> : <i className="fa-solid fa-location-arrow text-xl"></i>}
            {activeRecords.some(r => r.workerId === selectedWorkerId) ? 'Already Punched In' : 'Verify Site & Punch In'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold mb-3 px-1 text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>{isAdmin ? 'Live on Site' : 'Your Current Session'} ({activeRecords.length})</span>
            {activeRecords.length > 0 && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
          </h3>
          <div className="space-y-3">
            {activeRecords.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-slate-400 text-sm">No active shift sessions</p>
              </div>
            )}
            {activeRecords.map(record => {
              const worker = workers.find(w => w.id === record.workerId);
              const site = sites.find(s => s.id === record.siteId);
              return (
                <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{worker?.name}</p>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-tight">{site?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Started At</p>
                      <p className="text-sm font-bold text-slate-800">{new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                    <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-mono flex items-center gap-1">
                      <i className="fa-solid fa-location-dot"></i> Location Verified
                    </div>
                    <button 
                      onClick={() => handlePunchOut(record.id)}
                      className="bg-red-50 text-red-600 px-6 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors active:scale-95 border border-red-100"
                    >
                      PUNCH OUT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 px-1 text-slate-500 uppercase tracking-widest">{isAdmin ? 'All Recent Logs' : 'Your Recent Logs'}</h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden max-h-[400px] overflow-y-auto">
            {completedRecords.map(record => {
              const worker = workers.find(w => w.id === record.workerId);
              const site = sites.find(s => s.id === record.siteId);
              return (
                <div key={record.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fa-solid fa-clock-rotate-left text-xs"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{worker?.name}</p>
                      <p className="text-[10px] text-slate-500">{new Date(record.punchIn).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-800">
                      {new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(record.punchOut!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{site?.name}</p>
                  </div>
                </div>
              )})};
            {completedRecords.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">No recent shift logs</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
