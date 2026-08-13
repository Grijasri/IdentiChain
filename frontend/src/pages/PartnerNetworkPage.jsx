import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Globe, ShieldCheck, MapPin, CheckCircle2, Server, ArrowRight, Building } from 'lucide-react';
import Footer from '../components/Footer';

export default function PartnerNetworkPage() {
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await API.get('/partners');
        setPartnerData(res.data);
      } catch (err) {
        console.error('Fetch partners error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 py-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 flex-1">
        
        {/* Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-teal-900 text-white shadow-xl space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/80 border border-cyan-700 text-cyan-300 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" /> Key Differentiator: Cross-Border Interoperability
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            IdentiChain Cross-Border Partner Network
          </h1>
          <p className="text-sm text-cyan-200/80 max-w-2xl">
            National apps like Diia stop working at borders. Singpass doesn’t cross boundaries. IdentiChain functions seamlessly across verified clinics, banks, and NGOs across displacement corridors.
          </p>
        </div>

        {/* System Node Stats */}
        {partnerData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black font-mono">{partnerData.totalNodes}</p>
                <p className="text-xs text-slate-500 font-medium">Active Interoperability Nodes</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black font-mono">{partnerData.activeCorridors}</p>
                <p className="text-xs text-slate-500 font-medium">European Displacement Corridors</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">W3C DID Standard</p>
                <p className="text-[11px] text-slate-500">Zero-Knowledge Verification Protocol</p>
              </div>
            </div>
          </div>
        )}

        {/* Partners Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Displacement Corridor Active Nodes
          </h3>

          {loading ? (
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          ) : partnerData && partnerData.partners ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerData.partners.map((p) => (
                <div
                  key={p.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{p.flag}</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {p.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {p.country} ({p.city})
                    </h4>
                    <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {p.organization}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Node Type:</strong> {p.type}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Active Verifiers:</strong> {p.activeVerifiers} accredited officers
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      <strong>Protocol:</strong> {p.protocol}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 font-medium">Accepted Verification Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.acceptedCategories.map((cat, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                          ✓ {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

      </div>
      <Footer />
    </div>
  );
}
