'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', skills: '', job: '', photo: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : '',
        job: user.job || '',
        photo: user.photo || '',
      });
    }
  }, [user, loading, router]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Image upload failed');

      setForm((current) => ({ ...current, photo: data.url }));
      alert('Profile image uploaded');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${user.id || user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed');

      const updatedUser = data.user || { ...user, ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Profile updated');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div className="page-shell">Loading...</div>;

  return (
    <main className="page-shell">
      <div className="card rounded-3xl p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-black">Profile</h1>
        <div className="mt-6 flex items-center gap-4">
          <img src={form.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.name || 'User')} alt="Profile" className="h-20 w-20 rounded-full object-cover border-2 border-slate-200" />
          <div>
            <label className="btn-secondary inline-block cursor-pointer">
              {uploadingImage ? 'Uploading...' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>
        <form onSubmit={handleSave} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Profile photo URL</label>
            <input className="input" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Job / position</label>
            <input className="input" value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Skills</label>
            <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Bio</label>
            <textarea className="input min-h-[120px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
        </form>
      </div>
    </main>
  );
}
