'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/manager', label: 'Dashboard' },
  { href: '/manager/tasks', label: 'Tasks' },
  { href: '/manager/requests', label: 'Requests' },
  { href: '/manager/profiles', label: 'Team / Profiles' },
  { href: '/manager/chat', label: 'Group Chat' },
  { href: '/manager/ai', label: 'AI Assistant' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

export default function ManagerLayout({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen app-shell">
      <div className="flex min-h-screen">
        <aside className="w-full max-w-[260px] sidebar p-5 hidden md:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">TeamWep</p>
            <h2 className="mt-2 text-2xl font-black">Manager panel</h2>
          </div>

          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link block rounded-xl px-4 py-3 text-sm font-medium transition ${pathname === link.href ? 'sidebar-link-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            className="mt-8 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200"
            onClick={() => { logout(); window.location.href = '/login'; }}
          >
            Logout
          </button>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
