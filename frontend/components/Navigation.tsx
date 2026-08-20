'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Bot,
  FileText,
  Settings,
  Play,
  Search,
  Bell,
  User
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Agent Playground', href: '/demo', icon: Play },
    { section: 'Operations' },
    { name: 'Live Actions', href: '/actions', icon: Activity },
    { name: 'Verification Runs', href: '/verifications', icon: CheckCircle2 },
    { name: 'Violations', href: '/violations', icon: AlertTriangle },
    { section: 'Configuration' },
    { name: 'Policies', href: '/policies', icon: FileCode },
    { name: 'Agents', href: '/agents', icon: Bot },
    { section: 'Compliance' },
    { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
    { section: 'System' },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Shield className="w-6 h-6 text-blue-500 mr-2.5" />
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-100 tracking-wide text-sm font-mono">AVE GATEWAY</span>
            <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-sans">Formal Policy Engine</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 text-xs">
          {navigation.map((item, idx) => {
            if ('section' in item) {
              return (
                <div key={idx} className="pt-4 pb-1.5 px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Environment Status */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 text-[11px] text-zinc-500 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Solver Engine</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 rounded font-mono">Z3 SMT Active</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Mode</span>
          <span className="text-zinc-300">Inline Runtime</span>
        </div>
      </div>
    </aside>
  );
}

export function Header() {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Production Pipeline
        </span>
      </div>

      <div className="flex items-center gap-4 text-zinc-400 text-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search actions, policies, agents..."
            className="bg-zinc-900 border border-zinc-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 w-64"
          />
        </div>

        <button className="p-2 hover:bg-zinc-900 rounded-md transition-colors relative">
          <Bell className="w-4 h-4 text-zinc-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-800" />

        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <User className="w-4 h-4 text-zinc-300" />
          </div>
          <span className="font-medium text-zinc-200">Security Operator</span>
        </div>
      </div>
    </header>
  );
}
