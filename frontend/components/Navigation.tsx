'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Property } from '@/lib/types';
import { getProperties } from '@/lib/storage';
import {
  Building2,
  Home,
  Camera,
  Wrench,
  LogOut,
  BrainCircuit,
  FileText,
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string>('prop-greenwood-204');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadProps() {
      const list = await getProperties();
      setProperties(list);
      if (list.length > 0 && !list.find((p) => p.id === selectedPropId)) {
        setSelectedPropId(list[0].id);
      }
    }
    loadProps();
  }, []);

  const selectedProp = properties.find((p) => p.id === selectedPropId) || properties[0];

  const hasApiKey = false; // Demo mode active by default or when OPENAI_API_KEY is unset

  const navLinks = [
    { href: `/dashboard`, label: 'Dashboard', icon: Home },
    { href: `/properties/${selectedPropId}`, label: 'Property Overview', icon: Building2 },
    { href: `/properties/${selectedPropId}/move-in`, label: 'Move-In Evidence', icon: Camera },
    { href: `/properties/${selectedPropId}/maintenance`, label: 'Maintenance Events', icon: Wrench },
    { href: `/properties/${selectedPropId}/move-out`, label: 'Move-Out Evidence', icon: LogOut },
    { href: `/properties/${selectedPropId}/analysis`, label: 'Damage Analysis', icon: BrainCircuit },
    { href: `/properties/[id]/report`.replace('[id]', selectedPropId), label: 'Evidence Report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 text-zinc-100 font-bold text-lg tracking-tight group">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/30 transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <span>Proof<span className="text-blue-400">Stay</span></span>
            </Link>

            {/* Active Property Dropdown Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[160px]">{selectedProp?.name || 'Greenwood Apartment 204'}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400 ml-1" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-zinc-800 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                    Select Property Record
                  </div>
                  {properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPropId(p.id);
                        setIsDropdownOpen(false);
                        router.push(`/properties/${p.id}`);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-800/60 transition-colors ${
                        p.id === selectedPropId ? 'text-blue-400 font-medium bg-blue-950/20' : 'text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="text-[10px] text-zinc-500">Active</span>
                    </button>
                  ))}
                  <div className="border-t border-zinc-800 mt-1 pt-1">
                    <Link
                      href="/properties"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-blue-400 hover:bg-zinc-800/60 font-medium text-center"
                    >
                      + Create New Property Record
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 text-blue-400 font-semibold border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mode Badge Indicator */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Demo Analysis Mode</span>
            </div>
          </div>

        </div>
      </div>

      {/* Secondary Sub-nav for Mobile/Tablet */}
      <div className="lg:hidden border-t border-zinc-800/60 bg-zinc-950/80 px-4 py-2 overflow-x-auto flex items-center gap-2 text-xs">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-2.5 py-1 rounded text-xs ${
                isActive ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-zinc-400'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
