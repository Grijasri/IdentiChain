import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, QrCode, Sun, Moon, Globe, LogOut, User as UserIcon, Menu, X, FileText, Activity, Wallet, Search, MapPin } from 'lucide-react';
import QRModal from './QRModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-700 via-teal-600 to-emerald-500 text-white shadow-md shadow-cyan-900/20 group-hover:scale-105 transition-transform duration-200">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-cyan-800 to-teal-700 dark:from-white dark:via-cyan-300 dark:to-teal-400 bg-clip-text text-transparent">
                  IdentiChain
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600 dark:text-teal-400 -mt-1">
                  Humanitarian Vault
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/')
                    ? 'bg-slate-200/70 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {t('nav.landing')}
              </Link>
              <Link
                to="/partners"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/partners')
                    ? 'bg-slate-200/70 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {t('nav.partners')}
              </Link>

              {user && user.role === 'refugee' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive('/dashboard')
                        ? 'bg-slate-200/70 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/vault"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive('/vault')
                        ? 'bg-slate-200/70 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {t('nav.vault')}
                  </Link>
                  <Link
                    to="/triage"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive('/triage')
                        ? 'bg-slate-200/70 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {t('nav.triage')}
                  </Link>
                  <Link
                    to="/wallet"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive('/wallet')
                        ? 'bg-slate-200/70 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {t('nav.wallet')}
                  </Link>
                </>
              )}

              {user && user.role === 'verifier' && (
                <Link
                  to="/verifier"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    isActive('/verifier')
                      ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-cyan-600" />
                  {t('nav.verifier')}
                </Link>
              )}
            </div>

            {/* Right Controls (Language, Theme, User ID, QR, Logout) */}
            <div className="flex items-center gap-2">
              
              {/* Language Switcher */}
              <div className="relative inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    language === 'en'
                      ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('uk')}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    language === 'uk'
                      ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  🇺🇦 UA
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Toggle Dark/Light Mode"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* User Digital ID Trigger & Logout */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  {user.role === 'refugee' && (
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-100 dark:hover:bg-cyan-900/80 transition"
                    >
                      <QrCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>{user.digitalId}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {t('nav.landing')}
            </Link>
            <Link
              to="/partners"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {t('nav.partners')}
            </Link>
            {user && user.role === 'refugee' && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/vault"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {t('nav.vault')}
                </Link>
                <Link
                  to="/triage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {t('nav.triage')}
                </Link>
                <Link
                  to="/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {t('nav.wallet')}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowQRModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 mt-2"
                >
                  <QrCode className="w-4 h-4" /> View Digital ID QR Card
                </button>
              </>
            )}

            {user && user.role === 'verifier' && (
              <Link
                to="/verifier"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-cyan-700 dark:text-cyan-300 font-bold"
              >
                {t('nav.verifier')}
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* QR Modal render */}
      {user && (
        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          user={user}
        />
      )}
    </>
  );
}
