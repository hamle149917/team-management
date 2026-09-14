'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function MemberDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'member')) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [tasksRes, requestsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/requests`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        const [taskData, requestData] = await Promise.all([tasksRes.json(), requestsRes.json()]);
        setTasks(taskData);
        setRequests(requestData);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) loadData();
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="page-shell">Loading...</div>;
  }

  return (
    <div className="page-shell">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">Member dashboard</p>
        <h1 className="mt-2 text-3xl font-black">My workspace</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="card rounded-2xl p-5">
          <p className="text-sm font-semibold text-slate-500">My tasks</p>
          <div className="mt-3 text-3xl font-black">{tasks.length}</div>
        </div>
        <div className="card rounded-2xl p-5">
          <p className="text-sm font-semibold text-slate-500">In progress</p>
          <div className="mt-3 text-3xl font-black">{tasks.filter((t) => t.status === 'in_progress').length}</div>
        </div>
        <div className="card rounded-2xl p-5">
          <p className="text-sm font-semibold text-slate-500">Open requests</p>
          <div className="mt-3 text-3xl font-black">{requests.filter((r) => r.status === 'pending').length}</div>
        </div>
      </div>
    </div>
  );
}
