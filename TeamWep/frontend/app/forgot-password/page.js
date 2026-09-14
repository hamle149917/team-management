'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send reset code');
      setCodeSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="card w-full max-w-lg rounded-3xl p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">Password reset</p>
        <h1 className="mt-3 text-3xl font-black">Recover your account</h1>

        {!codeSent ? (
          <form onSubmit={requestReset} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Sending code...' : 'Send reset code'}</button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Verification code</label>
              <input className="input" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">New password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Confirm password</label>
              <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Updating password...' : 'Reset password'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
