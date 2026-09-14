'use client';

import { useEffect, useState } from 'react';

export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setRequests(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateRequestStatus = async (id, action) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/requests/${id}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          managerResponse: action === 'accept' ? 'Approved by manager' : 'Rejected by manager',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request update failed');
      setRequests((current) => current.map((request) => request._id === id ? { ...request, status: action === 'accept' ? 'accepted' : 'rejected', managerResponse: data.request?.managerResponse || '' } : request));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="card rounded-3xl p-8">
        <h1 className="text-3xl font-black">Requests</h1>
        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="text-slate-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No requests found.</div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold capitalize">{request.type?.replace('_', ' ')}</h3>
                    <p className="text-slate-600 mt-1">{request.message}</p>
                  </div>
                  <span className={`status-badge status-${request.status || 'pending'}`}>{request.status || 'pending'}</span>
                </div>
                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-slate-600">
                  <span><span className="font-semibold text-slate-700">Member:</span> {request.user?.name || 'Unknown'}</span>
                  {request.date ? <span><span className="font-semibold text-slate-700">Date:</span> {request.date}</span> : null}
                </div>
                {request.status === 'pending' ? (
                  <div className="mt-4 flex gap-3">
                    <button className="btn-primary" onClick={() => updateRequestStatus(request._id, 'accept')}>Accept</button>
                    <button className="btn-secondary" onClick={() => updateRequestStatus(request._id, 'reject')}>Reject</button>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Manager response:</span> {request.managerResponse || 'No response yet'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
