import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import DocumentCard from '../components/DocumentCard';
import UploadModal from '../components/UploadModal';
import TriageModal from '../components/TriageModal';
import AidModal from '../components/AidModal';
import QRModal from '../components/QRModal';
import Toast from '../components/Toast';
import API from '../services/api';
import { QrCode, UploadCloud, Stethoscope, Wallet, ShieldCheck, FileText, Activity, ArrowUpRight, Lock, Globe, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [triageHistory, setTriageHistory] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showAidModal, setShowAidModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, triageRes, walletRes] = await Promise.all([
        API.get('/documents'),
        API.get('/triage/history'),
        API.get('/wallet/summary'),
      ]);
      setDocuments(docRes.data);
      setTriageHistory(triageRes.data);
      setWallet(walletRes.data);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleVisibility = async (id) => {
    try {
      const res = await API.patch(`/documents/${id}/visibility`);
      setDocuments(prev => prev.map(d => d._id === id ? { ...d, isShareable: res.data.isShareable } : d));
      showToast('info', 'Privacy Setting Updated', res.data.message);
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document from your vault?')) return;
    try {
      await API.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d._id !== id));
      showToast('success', 'Document Deleted', 'Document removed from vault.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const shareableCount = documents.filter(d => d.isShareable).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          
          {/* Sidebar */}
          <Sidebar onOpenQR={() => setShowQRModal(true)} />

          {/* Main Content Area */}
          <main className="flex-1 space-y-6 min-w-0">
            
            {/* Top Welcome Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-teal-900 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/80 border border-cyan-700 text-cyan-300 text-xs font-semibold mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" /> Self-Sovereign Identity Active
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome, {user?.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 font-mono">
                    Digital ID: {user?.digitalId} • {user?.countryOfOrigin || 'Ukraine'} refugee corridor
                  </p>
                </div>

                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <QrCode className="w-5 h-5 text-cyan-400" /> Show Digital ID QR Card
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Vault Documents</span>
                  <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {documents.length}
                </p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
                  {shareableCount} shareable with verifiers
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Aid Wallet</span>
                  <Wallet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  €{wallet.balance} <span className="text-xs font-sans text-slate-400">EUR</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {wallet.transactions.length} total transactions
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Medical Triage</span>
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {triageHistory.length > 0 ? triageHistory[0].urgencyLevel : 'No Check'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {triageHistory.length} symptom evaluations
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ledger Security</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  100% SHA-256
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Tamper-proof verified
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Operations:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <UploadCloud className="w-4 h-4" /> Upload Document
                </button>
                <button
                  onClick={() => setShowTriageModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Stethoscope className="w-4 h-4" /> AI Medical Triage
                </button>
                <button
                  onClick={() => setShowAidModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Wallet className="w-4 h-4" /> Request Micro-Aid
                </button>
              </div>
            </div>

            {/* Document Vault Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Vault Documents ({documents.length})
                </h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Document
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                  <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Your Document Vault is Empty</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Upload your passport, medical prescriptions, or property deeds to generate cryptographic SHA-256 proof.
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
                  >
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      doc={doc}
                      onToggleVisibility={handleToggleVisibility}
                      onDelete={handleDeleteDocument}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Latest AI Triage summary card if available */}
            {triageHistory.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" /> Recent AI Medical Evaluation
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(triageHistory[0].createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Symptoms: "{triageHistory[0].symptoms}"</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{triageHistory[0].explanation}</p>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Render Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchData}
        showToast={showToast}
      />
      <TriageModal
        isOpen={showTriageModal}
        onClose={() => setShowTriageModal(false)}
        onSuccess={fetchData}
        showToast={showToast}
      />
      <AidModal
        isOpen={showAidModal}
        onClose={() => setShowAidModal(false)}
        onSuccess={fetchData}
        showToast={showToast}
      />
      {user && (
        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          user={user}
        />
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
