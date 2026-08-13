import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AidModal from '../components/AidModal';
import QRModal from '../components/QRModal';
import Toast from '../components/Toast';
import API from '../services/api';
import { Wallet, Plus, ArrowDownRight, ArrowUpRight, ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [], aidRequests: [] });
  const [loading, setLoading] = useState(true);
  const [showAidModal, setShowAidModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await API.get('/wallet/summary');
      setWallet(res.data);
    } catch (err) {
      console.error('Fetch wallet error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          
          <Sidebar onOpenQR={() => setShowQRModal(true)} />

          <main className="flex-1 space-y-6 min-w-0">
            
            {/* Wallet Header Balance Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700 text-teal-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> IdentiChain Cross-Border Aid Pool
                </span>
                <p className="text-xs text-slate-300">Available Emergency Micro-Aid Balance</p>
                <p className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                  €{wallet.balance} <span className="text-lg font-sans font-normal text-teal-300">EUR</span>
                </p>
              </div>

              <button
                onClick={() => setShowAidModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Request Emergency Micro-Aid
              </button>
            </div>

            {/* Aid Applications Status Section */}
            {wallet.aidRequests && wallet.aidRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Micro-Aid Applications ({wallet.aidRequests.length})
                </h3>
                <div className="space-y-3">
                  {wallet.aidRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            req.status === 'Approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {req.status}
                          </span>
                          <span className="font-mono text-slate-400">Risk Score: {req.riskScore}/100</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{req.urgencyReason}</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{req.riskReasoning}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                          €{req.amountRequested} EUR
                        </span>
                        <p className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Ledger Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Transaction Ledger ({wallet.transactions.length})
              </h3>

              {loading ? (
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              ) : wallet.transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No transactions recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                        <th className="pb-3 font-semibold">Transaction</th>
                        <th className="pb-3 font-semibold">Sender / Channel</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {wallet.transactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                                <ArrowDownRight className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{tx.title}</p>
                                <p className="text-[10px] font-mono text-slate-400">{tx.txHash?.substring(0, 20)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 font-medium text-slate-600 dark:text-slate-300">
                            {tx.sender}
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                            +€{tx.amount} {tx.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

      <AidModal
        isOpen={showAidModal}
        onClose={() => setShowAidModal(false)}
        onSuccess={fetchWallet}
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
