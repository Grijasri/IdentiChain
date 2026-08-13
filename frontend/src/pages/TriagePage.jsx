import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TriageModal from '../components/TriageModal';
import QRModal from '../components/QRModal';
import Toast from '../components/Toast';
import API from '../services/api';
import { Activity, Stethoscope, AlertTriangle, CheckCircle2, Clock, Plus, ShieldCheck } from 'lucide-react';

export default function TriagePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get('/triage/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Fetch triage history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const urgencyStyles = {
    Mild: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-300',
    Moderate: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-800 dark:text-amber-300',
    Urgent: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 text-rose-800 dark:text-rose-300',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          
          <Sidebar onOpenQR={() => setShowQRModal(true)} />

          <main className="flex-1 space-y-6 min-w-0">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
                  <Stethoscope className="w-3.5 h-3.5" /> AI Medical Protocol
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Medical Symptom Triage</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instant clinical priority ranking & emergency healthcare navigation for displaced persons.
                </p>
              </div>

              <button
                onClick={() => setShowTriageModal(true)}
                className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Start New Symptom Check
              </button>
            </div>

            {/* History List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Evaluation History ({history.length})
              </h3>

              {loading ? (
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              ) : history.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">No Triage Records Yet</h4>
                  <p className="text-xs text-slate-400 mt-1">Describe symptoms if feeling unwell to get immediate guidance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className={`p-5 rounded-2xl border ${urgencyStyles[item.urgencyLevel] || 'bg-white'} shadow-sm space-y-3`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-xs">
                            {item.urgencyLevel} Urgency
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.aiSource}
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          Symptoms Reported: "{item.symptoms}"
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.explanation}
                        </p>
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 font-medium text-slate-900 dark:text-slate-100">
                          🎯 Suggested Step: {item.suggestedNextStep}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

      <TriageModal
        isOpen={showTriageModal}
        onClose={() => setShowTriageModal(false)}
        onSuccess={fetchHistory}
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
