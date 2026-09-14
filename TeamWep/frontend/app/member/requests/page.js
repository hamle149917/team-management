'use client';

import { useEffect, useState } from 'react';

export default function MemberRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ type: 'day_off', message: '', date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/requests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setRequests(data || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setRequests((current) => [data, ...current]);
      setForm({ type: 'day_off', message: '', date: '' });
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card rounded-3xl p-8">
        <h1 className="text-3xl font-black">Requests</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="day_off">Day Off</option>
              <option value="combine_tasks">Combine Tasks</option>
              <option value="extra_task">Extra Task</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Date</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Message</label>
            <textarea className="input min-h-[120px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary" disabled={saving}>{saving ? 'Sending...' : 'Submit request'}</button>
          </div>
        </form>

        <div className="mt-10 space-y-4">
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No requests found.</div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-xl font-bold capitalize">{request.type?.replace('_', ' ')}</h3>
                  <span className={`status-badge status-${request.status || 'pending'}`}>{request.status || 'pending'}</span>
                </div>
                <p className="mt-2 text-slate-600">{request.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
