import React, { useState } from 'react';
import { ShieldCheck, Lock, Globe, FileText, Download, Trash2, Eye, EyeOff, Hash, Check } from 'lucide-react';

export default function DocumentCard({ doc, onToggleVisibility, onDelete }) {
  const [showHashModal, setShowHashModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const categoryBadges = {
    identity: {
      label: 'Identity Document',
      color: 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    },
    medical: {
      label: 'Medical Record',
      color: 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    },
    education_property: {
      label: 'Education & Property',
      color: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
  };

  const badge = categoryBadges[doc.category] || categoryBadges.identity;

  const copyHash = () => {
    navigator.clipboard.writeText(doc.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group">
        
        {/* Top bar: Category Badge + Cryptographic Verified Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
              {badge.label}
            </span>

            <button
              onClick={() => setShowHashModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
              title="Click to view SHA-256 Ledger Hash"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verified & Immutable
            </button>
          </div>

          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
            {doc.title}
          </h4>

          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
            {doc.filename} • {(doc.filesize / 1024).toFixed(1)} KB
          </p>

          {/* AI Auto-Tags */}
          {doc.aiTags && doc.aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {doc.aiTags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom controls: Visibility Toggle + Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          
          {/* Privacy Toggle Switch */}
          <button
            onClick={() => onToggleVisibility(doc._id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              doc.isShareable
                ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {doc.isShareable ? (
              <>
                <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Shareable
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Private
              </>
            )}
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <a
              href={doc.filepath}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Download / View Document"
            >
              <Download className="w-4 h-4" />
            </a>
            {onDelete && (
              <button
                onClick={() => onDelete(doc._id)}
                className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Delete Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SHA-256 Hash Modal */}
      {showHashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">SHA-256 Cryptographic Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">IdentiChain Immutable Ledger Record</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 font-sans block mb-0.5">Document Title:</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{doc.title}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block mb-0.5">SHA-256 Digest Hash:</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 break-all text-cyan-600 dark:text-cyan-400 select-all font-mono font-bold">
                  {doc.sha256Hash}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-sans block mb-0.5">Mock Ledger Tx Stamp:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{doc.verificationBadge?.ledgerTx || '0x' + doc.sha256Hash.substring(0, 32)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={copyHash}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs hover:bg-slate-200 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Hash className="w-4 h-4" />}
                {copied ? 'Hash Copied!' : 'Copy Hash'}
              </button>
              <button
                onClick={() => setShowHashModal(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
