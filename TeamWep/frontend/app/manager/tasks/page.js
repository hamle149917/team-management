'use client';

import { useEffect, useState } from 'react';

const emptyTask = {
  title: '',
  description: '',
  example: '',
  assignedTo: '',
  deadline: '',
};

export default function ManagerTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const [form, setForm] = useState(emptyTask);

  const loadTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setTasks(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setMembers((data || []).filter((user) => user.role === 'member'));
      } catch (error) {
        console.error(error);
      }
    };

    const init = async () => {
      await Promise.all([loadTasks(), loadMembers()]);
      setLoading(false);
    };

    init();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create task');
      setTasks((current) => [data, ...current]);
      setForm(emptyTask);
      alert('Task created successfully');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTaskDecision = async (taskId, action) => {
    try {
      const body = {
        managerFeedback: feedbacks[taskId] || (action === 'approve' ? 'Approved by manager.' : 'Rejected by manager. Please revise and resubmit.'),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks/${taskId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Task update failed');
      setTasks((current) => current.map((task) => task._id === taskId ? { ...task, status: action === 'approve' ? 'approved' : 'rejected', managerFeedback: body.managerFeedback } : task));
      setFeedbacks((current) => ({ ...current, [taskId]: '' }));
      alert(action === 'approve' ? 'Task approved.' : 'Task rejected.');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="card rounded-3xl p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">Manager tasks</p>
            <h1 className="mt-2 text-3xl font-black">Task board</h1>
          </div>
        </div>

        <form onSubmit={handleCreateTask} className="mt-8 grid md:grid-cols-2 gap-5 border border-slate-200 rounded-2xl bg-slate-50 p-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Task title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Example</label>
            <input className="input" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Assign to</label>
            <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required>
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Deadline</label>
            <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create task'}</button>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="text-slate-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No tasks yet.</div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">{task.title}</h3>
                    <p className="text-slate-600 mt-1">{task.description}</p>
                  </div>
                  <span className={`status-badge status-${task.status || 'pending'}`}>{task.status || 'pending'}</span>
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-700">Assigned:</span> {task.assignedTo?.name || 'Unassigned'}</div>
                  <div><span className="font-semibold text-slate-700">Deadline:</span> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</div>
                  <div><span className="font-semibold text-slate-700">Submitted:</span> {task.submittedAt ? 'Yes' : 'No'}</div>
                </div>

                {task.status === 'submitted' && (
                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Submission:</span> {task.submissionMessage || 'No message provided'}
                    </div>
                    {task.files?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {task.files.map((file, index) => (
                          <a key={`${file.url}-${index}`} href={file.url} target="_blank" rel="noreferrer" className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {file.name || 'Uploaded file'}
                          </a>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4">
                      <label className="block text-sm font-semibold mb-2">Manager feedback</label>
                      <textarea
                        className="input min-h-[90px]"
                        value={feedbacks[task._id] ?? ''}
                        onChange={(e) => setFeedbacks((current) => ({ ...current, [task._id]: e.target.value }))}
                        placeholder="Write approval or rejection feedback..."
                      />
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="btn-primary" onClick={() => handleTaskDecision(task._id, 'approve')}>Accept task</button>
                      <button className="btn-secondary" onClick={() => handleTaskDecision(task._id, 'reject')}>Reject task</button>
                    </div>
                  </div>
                )}

                {task.status === 'approved' || task.status === 'rejected' ? (
                  <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Manager feedback:</span> {task.managerFeedback || 'No feedback'}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
