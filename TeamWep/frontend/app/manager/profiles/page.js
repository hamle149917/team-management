'use client';

import { useEffect, useState } from 'react';

export default function ManagerProfilesPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setUsers(data || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="page-shell">
      <div className="card rounded-3xl p-8">
        <h1 className="text-3xl font-black">Team / Profiles</h1>
        <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map((user) => (
            <div key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <img
                  src={user.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User')}
                  alt={user.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">{user.name}</h3>
                  <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Job:</span> {user.job || 'Not set'}</p>
                <p className="mt-2"><span className="font-semibold text-slate-700">Skills:</span> {user.skills?.length ? user.skills.join(', ') : 'No skills added'}</p>
                <p className="mt-2"><span className="font-semibold text-slate-700">Bio:</span> {user.bio || 'No bio yet'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
