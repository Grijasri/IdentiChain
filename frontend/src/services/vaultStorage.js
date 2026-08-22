// Vault Storage Service for persistent client-side caching & serverless sync

const STORAGE_KEY_PREFIX = 'identichain_vault_docs_';

export const getLocalDocs = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Local vault read error:', e);
  }
  return [];
};

export const saveLocalDoc = (userId, doc) => {
  if (!userId || !doc) return;
  try {
    const existing = getLocalDocs(userId);
    // Avoid duplicate insertions
    const updated = [doc, ...existing.filter((d) => d._id !== doc._id && d.sha256Hash !== doc.sha256Hash)];
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local vault write error:', e);
  }
};

export const updateLocalDocVisibility = (userId, docId, isShareable) => {
  if (!userId || !docId) return;
  try {
    const existing = getLocalDocs(userId);
    const updated = existing.map((d) => (d._id === docId ? { ...d, isShareable } : d));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local vault update error:', e);
  }
};

export const deleteLocalDoc = (userId, docId) => {
  if (!userId || !docId) return;
  try {
    const existing = getLocalDocs(userId);
    const updated = existing.filter((d) => d._id !== docId);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local vault delete error:', e);
  }
};

export const mergeVaultDocuments = (serverDocs = [], userId) => {
  const localDocs = getLocalDocs(userId);
  const map = new Map();

  // Add server docs first
  if (Array.isArray(serverDocs)) {
    serverDocs.forEach((d) => {
      if (d && d._id) map.set(d._id, d);
    });
  }

  // Overlay local docs so newly uploaded docs on serverless never disappear
  localDocs.forEach((d) => {
    if (d && d._id) {
      if (!map.has(d._id)) {
        map.set(d._id, d);
      } else {
        // preserve local updates if newer
        map.set(d._id, { ...map.get(d._id), ...d });
      }
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.uploadedAt || Date.now()) - new Date(a.uploadedAt || Date.now()));
};
