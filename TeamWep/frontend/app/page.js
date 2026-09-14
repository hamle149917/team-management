import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="card max-w-5xl w-full rounded-3xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-600 p-10 text-white">
            <p className="text-sm uppercase tracking-[0.2em] opacity-80">Private Workspace</p>
            <h1 className="mt-6 text-4xl md:text-5xl font-black leading-tight">One workspace for ambitious teams building important things.</h1>
            <p className="mt-6 text-blue-100 leading-7">
              Keep a complex project moving with clear ownership, thoughtful reviews, fast communication, and an AI assistant that stays close to the work.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/login" className="btn-secondary bg-white text-slate-900 border-0">Login</Link>
              <Link href="/register" className="btn-secondary bg-blue-100 text-blue-900 border-blue-100">Create Account</Link>
            </div>
          </div>

          <div className="p-10 md:p-12">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="font-semibold">Manager dashboard</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <p className="font-semibold">Member task tracking</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <p className="font-semibold">Real-time team chat</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <p className="font-semibold">AI workspace assistant</p>
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-slate-50 p-5 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Made for the whole project</p>
              <p className="mt-3 text-lg font-bold text-slate-800">From the first brief to the final delivery.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Give every contributor context, a clear next step, and one dependable place to report progress.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
