'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function StatCard({ label, value, tone = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="card rounded-2xl p-5">
      <div className={`inline-flex rounded-xl px-3 py-2 text-sm font-bold ${colorMap[tone]}`}>{label}</div>
      <div className="mt-4 text-3xl font-black">{value}</div>
    </div>
  );
}

export default function ManagerDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeTasks: 0,
    pendingTasks: 0,
    submittedTasks: 0,
    approvedTasks: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'manager')) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [teamRes, tasksRes, requestsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/requests`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        const [team, tasks, requests] = await Promise.all([
          teamRes.json(),
          tasksRes.json(),
          requestsRes.json(),
        ]);

        setStats({
          totalMembers: team.length,
          activeTasks: tasks.filter((task) => ['pending', 'in_progress', 'submitted'].includes(task.status)).length,
          pendingTasks: tasks.filter((task) => task.status === 'pending').length,
          submittedTasks: tasks.filter((task) => task.status === 'submitted').length,
          approvedTasks: tasks.filter((task) => task.status === 'approved').length,
          pendingRequests: requests.filter((request) => request.status === 'pending').length,
        });
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
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">Manager dashboard</p>
          <h1 className="mt-2 text-3xl font-black">Welcome back, {user.name}</h1>
        </div>
        <Link href="/manager/tasks" className="btn-primary">View tasks</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Team members" value={stats.totalMembers} tone="blue" />
        <StatCard label="Active tasks" value={stats.activeTasks} tone="indigo" />
        <StatCard label="Pending tasks" value={stats.pendingTasks} tone="amber" />
        <StatCard label="Submitted" value={stats.submittedTasks} tone="red" />
        <StatCard label="Approved" value={stats.approvedTasks} tone="emerald" />
        <StatCard label="Pending requests" value={stats.pendingRequests} tone="amber" />
      </div>
    </div>
  );
}
