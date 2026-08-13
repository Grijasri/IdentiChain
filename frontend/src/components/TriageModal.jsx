import React, { useState } from 'react';
import { X, Activity, Stethoscope, AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import API from '../services/api';

export default function TriageModal({ isOpen, onClose, onSuccess, showToast }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await API.post('/triage/assess', { symptoms });
      setResult(res.data.result);
      if (showToast) {
        showToast('info', 'AI Triage Complete', `Urgency Rating: ${res.data.result.urgencyLevel}`);
      }
      if (onSuccess) onSuccess(res.data.result);
    } catch (err) {
      console.error('Triage error:', err);
      setError(err.response?.data?.message || 'Failed to analyze symptoms.');
    } finally {
      setLoading(false);
    }
  };

  const urgencyBadges = {
    Mild: { color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
    Moderate: { color: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300', icon: <Clock className="w-5 h-5 text-amber-500" /> },
    Urgent: { color: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300', icon: <AlertTriangle className="w-5 h-5 text-rose-500" /> },
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
          <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Medical Symptom Triage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Emergency symptom evaluation & clinical action protocol</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Describe Your Symptoms & Duration
              </label>
              <textarea
                required
                rows={4}
                placeholder="e.g., Persistent asthma flare-up for 3 days, low fever 38°C, difficulty catching breath during movement..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              💡 <strong>Note:</strong> Operates online with LLM APIs or offline with IdentiChain's clinical keyword classifier. Does not replace emergency services.
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
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Evaluating Symptoms...' : 'Analyze Symptoms'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Urgency Header */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${urgencyBadges[result.urgencyLevel]?.color}`}>
              <div className="flex items-center gap-3">
                {urgencyBadges[result.urgencyLevel]?.icon}
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider opacity-75">Triage Level</span>
                  <h4 className="text-xl font-extrabold">{result.urgencyLevel} Urgency</h4>
                </div>
              </div>
            </div>

            {/* Explanation & Next Step */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Clinical Explanation:</span>
                <p className="text-slate-600 dark:text-slate-400">{result.explanation}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-teal-700 dark:text-teal-400 block mb-1">Suggested Action Step:</span>
                <p className="text-slate-900 dark:text-slate-100 font-medium">{result.suggestedNextStep}</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center font-mono">
              Evaluated by: {result.aiSource}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Evaluate Another Symptom
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
