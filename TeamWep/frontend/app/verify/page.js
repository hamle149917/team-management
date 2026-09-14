'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      alert(data.message || 'Code sent');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="card w-full max-w-lg rounded-3xl p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">Verify account</p>
        <h1 className="mt-3 text-3xl font-black">Enter your 6-digit code</h1>
        <p className="mt-3 text-slate-600">We sent a verification code to {email || 'your email'}.</p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <input className="input text-center text-2xl tracking-[0.5em]" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify Email'}</button>
        </form>

        <button onClick={handleResend} className="mt-5 btn-secondary w-full">Resend code</button>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="page-shell">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
