import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import QRScannerModal from '../components/QRScannerModal';
import DocumentCard from '../components/DocumentCard';
import API from '../services/api';
import { Search, Camera, ShieldCheck, Lock, Users, FileCheck, Wallet, Activity, AlertCircle, Building, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function VerifierDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('IDC-8F92-4A71-9B3E'); // Default demo lookup
  const [searchResult, setSearchResult] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/verifier/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
    }
  };

  const handleSearch = async (queryToSearch) => {
    const q = queryToSearch || searchQuery;
    if (!q || !q.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await API.get(`/verifier/lookup/${encodeURIComponent(q.trim())}`);
      setSearchResult(res.data);
    } catch (err) {
      console.error('Verifier search error:', err);
      setSearchResult(null);
      setError(err.response?.data?.message || 'No refugee record found matching this Digital ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    handleSearch('IDC-8F92-4A71-9B3E'); // Auto load demo user Oksana on mount
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Verifier Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-teal-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/80 border border-cyan-700 text-cyan-300 text-xs font-semibold mb-3">
              <Building className="w-3.5 h-3.5" /> Official Verifier Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.organization || 'Humanitarian Verification Node'}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
              Accredited Node Officer: {user?.name} • Role: {user?.verifierType?.toUpperCase() || 'VERIFIER'}
            </p>
          </div>

          <button
            onClick={() => setShowScanner(true)}
            className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" /> Scan Refugee QR Code
          </button>
        </div>

        {/* Search Bar Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-600" /> Digital ID Verification Search
          </h3>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Digital ID (e.g., IDC-8F92-4A71-9B3E) or scanned payload..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Searching Ledger...' : 'Lookup Record'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Refugee Record Search Result Container */}
        {searchResult && searchResult.user && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in duration-300">
            
            {/* User Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {searchResult.user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {searchResult.user.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Refugee Record
                    </span>
                  </div>
                  <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold mt-0.5">
                    Digital ID: {searchResult.user.digitalId}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Origin: {searchResult.user.countryOfOrigin} • Current: {searchResult.user.currentLocation}
                  </p>
                </div>
              </div>

              {/* Privacy Badge Summary */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-right space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {searchResult.sharedDocuments.length} Shared Documents Accessible
                </p>
                <p className="text-[11px] text-slate-400 flex items-center justify-end gap-1 font-mono">
                  <Lock className="w-3 h-3" /> {searchResult.totalPrivateDocsHidden} Private Docs Masked by User
                </p>
              </div>
            </div>

            {/* Shared Documents Section */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                Verified Shared Documents ({searchResult.sharedDocuments.length})
              </h3>
              {searchResult.sharedDocuments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  User has not marked any documents as shareable with verifier organizations.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResult.sharedDocuments.map((doc) => (
                    <DocumentCard key={doc._id} doc={doc} />
                  ))}
                </div>
              )}
            </div>

            {/* Medical Triage History */}
            {searchResult.triageHistory && searchResult.triageHistory.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Medical Triage History ({searchResult.triageHistory.length})
                </h3>
                <div className="space-y-2">
                  {searchResult.triageHistory.map((t) => (
                    <div key={t._id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-600 dark:text-amber-400">{t.urgencyLevel} Urgency Rating</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">Symptoms: "{t.symptoms}"</p>
                      <p className="text-slate-500 dark:text-slate-400">{t.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Analytics Panel with Recharts */}
        {analytics && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              System Analytics & Corridor Metrics
            </h3>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Registered Refugees</span>
                  <Users className="w-4 h-4 text-cyan-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {analytics.overview.totalRegisteredRefugees}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Verified Docs Stamped</span>
                  <FileCheck className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {analytics.overview.totalVerifiedDocuments}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Total Aid Disbursed</span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  €{analytics.overview.totalAidDisbursedEUR} <span className="text-xs font-sans text-slate-400">EUR</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Active Verifiers</span>
                  <Building className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {analytics.overview.totalVerifiers}
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Triage Urgency Distribution Bar Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Medical Triage Urgency Breakdown
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.triageBreakdown}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="count" fill="#0e7490" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Document Categories Pie Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Document Vault Category Distribution
                </h4>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.documentCategories}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {analytics.documentCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Recent Verifications Activity Ticker */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recent Interoperability Verification Activity
              </h4>
              <div className="space-y-2 text-xs">
                {analytics.recentVerifications.map((v, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{v.node}</span>
                      <p className="text-slate-500 font-mono text-[10px]">{v.docType}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{v.status}</span>
                      <p className="text-slate-400 text-[10px]">{v.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanResult={(scannedId) => {
          setSearchQuery(scannedId);
          handleSearch(scannedId);
        }}
      />
    </div>
  );
}
