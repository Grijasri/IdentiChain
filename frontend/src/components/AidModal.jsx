import React, { useState, useEffect } from 'react';
import { X, Wallet, ShieldCheck, AlertCircle, CheckCircle2, Loader2, DollarSign } from 'lucide-react';
import API from '../services/api';

export default function AidModal({ isOpen, onClose, onSuccess, showToast }) {
  const [urgencyReason, setUrgencyReason] = useState('');
  const [amountRequested, setAmountRequested] = useState(150);
  const [attachedDocId, setAttachedDocId] = useState('');
  const [vaultDocs, setVaultDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchVaultDocs = async () => {
      setLoadingDocs(true);
      try {
        const res = await API.get('/documents');
        setVaultDocs(res.data);
        if (res.data.length > 0) {
          setAttachedDocId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Fetch docs for aid error:', err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchVaultDocs();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!urgencyReason.trim()) {
      setError('Please state the emergency reason for requesting micro-aid.');
      return;
    }

    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const res = await API.post('/wallet/request-aid', {
        urgencyReason,
        amountRequested,
        attachedDocId,
      });

      setResult(res.data);
      if (showToast) {
        showToast(
          res.data.aiRisk.status === 'Approved' ? 'success' : 'info',
          res.data.aiRisk.status === 'Approved' ? 'Emergency Aid Approved!' : 'Request Under Review',
          res.data.aiRisk.reasoning
        );
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Aid request error:', err);
      setError(err.response?.data?.message || 'Failed to submit aid request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Request Emergency Micro-Aid</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instant AI risk-scoring & direct wallet disbursement</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Step 1: Urgency Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                1. What is your immediate emergency reason?
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Emergency winter clothing, transit pass, essential prescription medication..."
                value={urgencyReason}
                onChange={(e) => setUrgencyReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Step 2: Amount Requested */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2. Micro-Aid Amount Requested (€ EUR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">€</span>
                <input
                  type="number"
                  min={25}
                  max={1000}
                  required
                  value={amountRequested}
                  onChange={(e) => setAmountRequested(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Amounts ≤ €250 qualify for instant automated AI approval.</p>
            </div>

            {/* Step 3: Attach Document Proof */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>3. Attach Verified Document Proof from Vault</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Reduces risk score
                </span>
              </label>
              {loadingDocs ? (
                <div className="p-3 text-xs text-slate-400">Loading document vault...</div>
              ) : (
                <select
                  value={attachedDocId}
                  onChange={(e) => setAttachedDocId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">No Vault Document (Higher Risk Score)</option>
                  {vaultDocs.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.title} ({doc.category.toUpperCase()} • SHA-256 Verified)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Running Risk Score...' : 'Submit & Run AI Risk Check'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              result.aiRisk.status === 'Approved'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
            }`}>
              <div className="flex items-center gap-3">
                {result.aiRisk.status === 'Approved' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                )}
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider opacity-75">AI Decision</span>
                  <h4 className="text-xl font-extrabold">{result.aiRisk.status}</h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs block text-slate-500">AI Risk Score</span>
                <span className="text-2xl font-black font-mono">{result.aiRisk.riskScore}/100</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">AI Evaluation Reasoning:</span>
              <p className="text-slate-600 dark:text-slate-400 font-mono leading-relaxed">{result.aiRisk.reasoning}</p>
            </div>

            {result.transaction && (
              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between text-xs">
                <span className="font-medium text-cyan-800 dark:text-cyan-300">Disbursed to Aid Wallet:</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-sm">+€{result.transaction.amount} EUR</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition"
              >
                Close & View Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
