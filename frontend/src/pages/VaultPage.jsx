import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DocumentCard from '../components/DocumentCard';
import UploadModal from '../components/UploadModal';
import QRModal from '../components/QRModal';
import Toast from '../components/Toast';
import API from '../services/api';
import { FileText, UploadCloud, Search, ShieldCheck, Lock, Globe, Plus } from 'lucide-react';

import { mergeVaultDocuments, updateLocalDocVisibility, deleteLocalDoc } from '../services/vaultStorage';

export default function VaultPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/documents');
      const merged = mergeVaultDocuments(res.data, user?.id);
      setDocuments(merged);
    } catch (err) {
      console.error('Fetch vault error:', err);
      if (user?.id) {
        setDocuments(mergeVaultDocuments([], user.id));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  const handleToggleVisibility = async (id) => {
    try {
      const res = await API.patch(`/documents/${id}/visibility`);
      setDocuments(prev => prev.map(d => d._id === id ? { ...d, isShareable: res.data.isShareable } : d));
      if (user?.id) updateLocalDocVisibility(user.id, id, res.data.isShareable);
      showToast('info', 'Visibility Updated', res.data.message);
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document from your vault?')) return;
    try {
      await API.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d._id !== id));
      if (user?.id) deleteLocalDoc(user.id, id);
      showToast('success', 'Document Removed', 'Document deleted.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };


  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          
          <Sidebar onOpenQR={() => setShowQRModal(true)} />

          <main className="flex-1 space-y-6 min-w-0">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 Ledger Vault
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Multi-Category Document Vault</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cryptographically secured records. You control granular organization access.
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Upload New Document
              </button>
            </div>

            {/* Category Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeCategory === 'all'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  All ({documents.length})
                </button>
                <button
                  onClick={() => setActiveCategory('identity')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeCategory === 'identity'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Identity Docs ({documents.filter(d => d.category === 'identity').length})
                </button>
                <button
                  onClick={() => setActiveCategory('medical')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeCategory === 'medical'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Medical Records ({documents.filter(d => d.category === 'medical').length})
                </button>
                <button
                  onClick={() => setActiveCategory('education_property')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeCategory === 'education_property'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Education & Property ({documents.filter(d => d.category === 'education_property').length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search document title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Documents List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No Documents Found</h4>
                <p className="text-xs text-slate-400 mt-1">Try selecting a different category or clear search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

          </main>
        </div>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchDocuments}
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
