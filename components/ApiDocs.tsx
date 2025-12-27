
import React from 'react';

const ApiDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-amber-800">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <i className="fa-solid fa-circle-info"></i> REST API Emulator
        </h2>
        <p className="text-sm">
          Since you requested an API app, this interface acts as a visualization layer for the underlying data structures. 
          Below are the endpoints and JSON schemas used by the CivicLogix backend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ApiEndpoint 
          method="POST" 
          url="/api/v1/attendance/punch-in" 
          description="Used by mobile workers to record start of shift with GPS."
          payload={`{
  "worker_id": "w-123",
  "site_id": "s-456",
  "location": {
    "lat": 34.0522,
    "lng": -118.2437
  }
}`}
        />

        <ApiEndpoint 
          method="GET" 
          url="/api/v1/sites/:id/expenses" 
          description="Fetch all financial costs associated with a specific construction project."
          payload={`{
  "site_id": "s-456",
  "total_burn": 12500.50,
  "last_milestone": "2023-10-15"
}`}
        />

        <ApiEndpoint 
          method="POST" 
          url="/api/v1/admin/sites" 
          description="Create a new construction project (Admin Only)."
          payload={`{
  "name": "New Bridge X",
  "client": "Gov Corp",
  "budget": 5000000
}`}
        />

        <ApiEndpoint 
          method="GET" 
          url="/api/v1/workers/:id/payroll" 
          description="Retrieve historical payment transactions for a specific employee."
          payload={`[
  { "id": "tx-1", "amount": 1500, "date": "2023-09-30" },
  { "id": "tx-2", "amount": 1500, "date": "2023-10-31" }
]`}
        />
      </div>
    </div>
  );
};

const ApiEndpoint = ({ method, url, description, payload }: { method: string, url: string, description: string, payload: string }) => {
  const methodColors: any = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-mono text-xs">
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded font-bold ${methodColors[method]}`}>{method}</span>
          <span className="text-slate-900 font-bold">{url}</span>
        </div>
        <i className="fa-solid fa-copy text-slate-400 cursor-pointer hover:text-slate-600"></i>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-slate-500 font-sans italic">{description}</p>
        <div className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto">
          <pre>{payload}</pre>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
