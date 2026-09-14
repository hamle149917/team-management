'use client';

import { useEffect, useState } from 'react';

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [drafts, setDrafts] = useState({});

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
    const initializeTasks = async () => {
      await loadTasks();
    };

    initializeTasks();
  }, []);

  const uploadFiles = async (files) => {
    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'File upload failed');
      uploaded.push({ name: file.name, url: data.url });
    }

    return uploaded;
  };

  const handleSubmitTask = async (taskId) => {
    setUploading(true);

    try {
      const files = drafts[taskId]?.files || [];
      const filesToSubmit = files.length ? await uploadFiles(files) : [];
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          submissionMessage: drafts[taskId]?.message || '',
          files: filesToSubmit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Task submit failed');
      setDrafts((current) => ({ ...current, [taskId]: { files: [], message: '' } }));
      await loadTasks();
      alert('Task submitted successfully');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const canEditTask = (status) => ['pending', 'in_progress', 'rejected'].includes(status);

  return (
    <div className="page-shell">
      <div className="card rounded-3xl p-8">
        <h1 className="text-3xl font-black">My Tasks</h1>
        <div className="mt-8 space-y-4">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No tasks assigned yet.</div>
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
                <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-700">Deadline:</span> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</div>
                  <div><span className="font-semibold text-slate-700">Manager feedback:</span> {task.managerFeedback || 'No feedback yet'}</div>
                </div>

                {canEditTask(task.status) ? (
                  <div className="mt-5 border-t border-slate-200 pt-4">
                  <label className="block text-sm font-semibold mb-2">Upload task files</label>
                  <input
                    type="file"
                    multiple
                    className="input"
                    onChange={(e) => setDrafts((current) => ({ ...current, [task._id]: { ...(current[task._id] || {}), files: Array.from(e.target.files) } }))}
                  />
                  <textarea
                    className="input mt-3 min-h-[90px]"
                    placeholder="Add your task update message"
                    value={drafts[task._id]?.message || ''}
                    onChange={(e) => setDrafts((current) => ({ ...current, [task._id]: { ...(current[task._id] || {}), message: e.target.value } }))}
                  />
                  <button className="btn-primary mt-3" onClick={() => handleSubmitTask(task._id)} disabled={uploading}>{uploading ? 'Submitting...' : 'Submit task'}</button>
                  </div>
                ) : (
                  <div className="mt-5 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-500">
                    {task.status === 'approved' ? 'This task is approved and locked.' : 'Your submission is waiting for manager review.'}
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
