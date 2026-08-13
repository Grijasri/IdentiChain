import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, FileText, Activity, Wallet, Search, MapPin, ShieldCheck, QrCode } from 'lucide-react';

export default function Sidebar({ onOpenQR }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-6">
        
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'ID'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</h4>
              <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 truncate">{user.digitalId}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
              {user.role}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          {user.role === 'refugee' && onOpenQR && (
            <button
              onClick={onOpenQR}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-800 dark:text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <QrCode className="w-3.5 h-3.5" /> Show Digital ID QR
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          {user.role === 'refugee' ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                  isActive('/dashboard')
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
              </Link>
              <Link
                to="/vault"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                  isActive('/vault')
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" /> {t('nav.vault')}
              </Link>
              <Link
                to="/triage"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                  isActive('/triage')
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" /> {t('nav.triage')}
              </Link>
              <Link
                to="/wallet"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                  isActive('/wallet')
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" /> {t('nav.wallet')}
              </Link>
            </>
          ) : (
            <Link
              to="/verifier"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                isActive('/verifier')
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" /> {t('nav.verifier')}
            </Link>
          )}

          <Link
            to="/partners"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
              isActive('/partners')
                ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" /> {t('nav.partners')}
          </Link>
        </div>

        {/* Security badge info */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-500" /> Decentralized Security
          </p>
          <p>Every uploaded document receives a cryptographic SHA-256 hash stamp on the IdentiChain ledger.</p>
        </div>

      </div>
    </aside>
  );
}
