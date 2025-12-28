import React, { useState } from "react";
import { Attendance, Worker, Site, User, UserRole } from "../types";

// Updated interface to include the missing onViewLedger prop
interface AttendanceTrackerProps {
  attendance: Attendance[];
  workers: Worker[];
  sites: Site[];
  onPunchIn: (a: Attendance) => void;
  onPunchOut: (a: Attendance) => void;
  currentUser: User;
  onViewLedger?: () => void;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  attendance,
  workers,
  sites,
  onPunchIn,
  onPunchOut,
  currentUser,
  onViewLedger,
}) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const [selectedWorkerId, setSelectedWorkerId] = useState(
    isAdmin ? "" : currentUser.workerId || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handlePunchIn = () => {
    if (!selectedWorkerId) return;
    setLoading(true);
    setError(null);

    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker || !worker.assignedSiteId) {
      setError("Worker must have an assigned project site.");
      setLoading(false);
      return;
    }

    const targetSite = sites.find((s) => s.id === worker.assignedSiteId);
    if (!targetSite) {
      setError("Project site data unavailable.");
      setLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          targetSite.lat,
          targetSite.lng
        );
        const GEOFENCE_RADIUS = 1000;

        if (distance > GEOFENCE_RADIUS) {
          setError(
            `GEOFENCE ALERT: You are outside the 1km boundary for ${
              targetSite.name
            }. Currently ${formatDistance(distance)} away.`
          );
          setLoading(false);
          return;
        }

        const newRecord: Attendance = {
          id: "attn-" + Date.now(),
          workerId: selectedWorkerId,
          siteId: worker.assignedSiteId!,
          punchIn: new Date(),
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        };
        onPunchIn(newRecord);
        if (isAdmin) setSelectedWorkerId("");
        setLoading(false);
      },
      (geoError) => {
        let message = "GPS Error: Please enable location services to proceed.";
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message =
              "Location access denied. Please allow location permissions in your mobile browser settings.";
            break;
          case geoError.POSITION_UNAVAILABLE:
            message =
              "GPS position unavailable. Try moving outdoors or near a window.";
            break;
          case geoError.TIMEOUT:
            message =
              "Location request timed out. Please try checking in again.";
            break;
        }
        setError(message);
        setLoading(false);
      },
      options
    );
  };

  const handlePunchOut = (recordId: string) => {
    const record = attendance.find((a) => a.id === recordId);
    if (record) onPunchOut({ ...record, punchOut: new Date() });
  };

  const activeRecords = attendance.filter(
    (a) => !a.punchOut && (isAdmin || a.workerId === currentUser.workerId)
  );
  const completedRecords = attendance
    .filter(
      (a) => !!a.punchOut && (isAdmin || a.workerId === currentUser.workerId)
    )
    .slice()
    .reverse();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <h2 className="text-lg font-black mb-6 text-slate-800 dark:text-white flex items-center justify-between">
          <span>Daily Attendance Log</span>
          {!isAdmin && (
            <button
              className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5"
              onClick={() => onViewLedger?.()}
            >
              <i className="fa-solid fa-receipt"></i> View My Earnings
            </button>
          )}
        </h2>

        {error && (
          <div className="mb-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-bold flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-base"></i>
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isAdmin ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">
                Select Workforce Member
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold dark:text-white"
              >
                <option value="">Choose Staff Member...</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest mb-1">
                  Identity Profile
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                  {currentUser.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  Deployment
                </p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {sites.find(
                    (s) =>
                      s.id ===
                      workers.find((w) => w.id === currentUser.workerId)
                        ?.assignedSiteId
                  )?.name || "NONE"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handlePunchIn}
            disabled={
              loading ||
              !selectedWorkerId ||
              activeRecords.some((r) => r.workerId === selectedWorkerId)
            }
            className="w-full h-14 gradient-brand text-white font-black rounded-xl hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 text-sm uppercase tracking-widest"
          >
            {loading ? (
              <i className="fa-solid fa-spinner animate-spin"></i>
            ) : (
              <i className="fa-solid fa-location-crosshairs"></i>
            )}
            {activeRecords.some((r) => r.workerId === selectedWorkerId)
              ? "Shift in Progress"
              : "Check-In at Site"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black px-2 text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Active Shifts
            {activeRecords.length > 0 && (
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </h3>
          {activeRecords.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-xs font-medium">
                No active personnel on site.
              </p>
            </div>
          ) : (
            activeRecords.map((record) => {
              const worker = workers.find((w) => w.id === record.workerId);
              const site = sites.find((s) => s.id === record.siteId);
              const distanceMeters = site
                ? calculateDistance(
                    record.location.lat,
                    record.location.lng,
                    site.lat,
                    site.lng
                  )
                : 0;

              return (
                <div
                  key={record.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center">
                        <i className="fa-solid fa-clock text-lg"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {worker?.name}
                          </p>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                              distanceMeters > 500
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            }`}
                          >
                            <i className="fa-solid fa-location-dot mr-1"></i>
                            {formatDistance(distanceMeters)}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                          {site?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Check-In
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {new Date(record.punchIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePunchOut(record.id)}
                    className="w-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-rose-100 dark:border-rose-900/40"
                  >
                    Finish Shift & Check-Out
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black px-2 text-slate-500 uppercase tracking-widest">
            Recent Logs
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y dark:divide-slate-800 overflow-hidden">
            {completedRecords.slice(0, 5).map((record) => {
              const worker = workers.find((w) => w.id === record.workerId);
              const site = sites.find((s) => s.id === record.siteId);
              return (
                <div
                  key={record.id}
                  className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <i className="fa-solid fa-check text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {worker?.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        {new Date(record.punchIn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">
                      {new Date(record.punchIn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      —{" "}
                      {new Date(record.punchOut!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                      {site?.name}
                    </p>
                  </div>
                </div>
              );
            })}
            {completedRecords.length === 0 && (
              <p className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Log Archive Empty
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
