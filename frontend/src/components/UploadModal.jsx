import React, { useState } from 'react';
import { X, UploadCloud, FileText, Sparkles, ShieldCheck, Lock, Globe, Loader2 } from 'lucide-react';
import API from '../services/api';

export default function UploadModal({ isOpen, onClose, onSuccess, showToast }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isShareable, setIsShareable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        // Auto populate title from filename
        const baseName = selected.name.substring(0, selected.name.lastIndexOf('.')) || selected.name;
        setTitle(baseName.replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (customCategory) formData.append('customCategory', customCategory);
      formData.append('isShareable', isShareable);

      const res = await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (showToast) {
        showToast('success', 'Document Verified & Uploaded', `SHA-256 Hash generated! AI categorized as ${res.data.document.category}`);
      }

      onSuccess(res.data.document);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upload to IdentiChain Vault</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographic SHA-256 hash + AI auto-tagging</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dropzone File Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Document (PDF, PNG, JPG)
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl p-5 text-center transition bg-slate-50 dark:bg-slate-950 cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileText className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Click or drag file to upload</p>
                  <p className="text-[11px] text-slate-400">Supports PDF passports, medical cards, deeds</p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Display Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Biometric Ukrainian Passport"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Category Selector (Optional override) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Category</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> AI auto-classifies if blank
              </span>
            </label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Auto-Detect Category via AI</option>
              <option value="identity">Identity Documents (Passport, ID, Birth Cert)</option>
              <option value="medical">Medical Records (Prescriptions, Vaccine Logs)</option>
              <option value="education_property">Education & Property (Degrees, Deeds)</option>
            </select>
          </div>

          {/* Privacy Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isShareable ? (
                <Globe className="w-5 h-5 text-cyan-600" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isShareable ? 'Shareable with Verified Organizations' : 'Private Document'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isShareable
                    ? 'Accredited clinics, banks & NGOs can view when QR scanned'
                    : 'Visible only to you inside your personal vault'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsShareable(!isShareable)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                isShareable ? 'bg-cyan-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Generating SHA-256...' : 'Upload & Stamp Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
