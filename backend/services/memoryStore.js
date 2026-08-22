const fs = require('fs');
const path = require('path');
const os = require('os');

const docsStorageFile = path.join(os.tmpdir(), 'identichain_documents_vault.json');
const triageStorageFile = path.join(os.tmpdir(), 'identichain_triage_vault.json');
const walletStorageFile = path.join(os.tmpdir(), 'identichain_wallet_vault.json');

// Initial default demo documents for Oksana Petrenko, Mykhailo Shevchenko, Iryna Boyko
const defaultDemoDocs = [
  {
    _id: 'doc_oksana_1',
    userId: '660a11111111111111111111',
    title: 'Biometric Ukrainian Passport',
    category: 'identity',
    filename: 'oksana_passport_biometric.pdf',
    filepath: '/uploads/oksana_passport_biometric.pdf',
    filetype: 'application/pdf',
    filesize: 102400,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    isShareable: true,
    aiTags: ['Biometric Identity', 'Verified Passport', 'Kyiv Issued'],
    aiConfidence: 0.98,
    verificationBadge: {
      status: 'VERIFIED_IMMUTABLE',
      ledgerTx: '0xe3b0c44298fc1c149afbf4c8996fb924',
      verifiedAt: new Date().toISOString(),
    },
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: 'doc_oksana_2',
    userId: '660a11111111111111111111',
    title: 'Asthma Treatment Prescription & Medical History',
    category: 'medical',
    filename: 'oksana_medical_prescription_salbutamol.pdf',
    filepath: '/uploads/oksana_medical_prescription_salbutamol.pdf',
    filetype: 'application/pdf',
    filesize: 85000,
    sha256Hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    isShareable: true,
    aiTags: ['Medical Record', 'Prescription', 'Respiratory Care'],
    aiConfidence: 0.95,
    verificationBadge: {
      status: 'VERIFIED_IMMUTABLE',
      ledgerTx: '0xa1b2c3d4e5f67890123456789abcdef0',
      verifiedAt: new Date().toISOString(),
    },
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'doc_oksana_3',
    userId: '660a11111111111111111111',
    title: 'National Birth Certificate',
    category: 'identity',
    filename: 'oksana_birth_certificate.pdf',
    filepath: '/uploads/oksana_birth_certificate.pdf',
    filetype: 'application/pdf',
    filesize: 120000,
    sha256Hash: 'f4e3d2c1b0a9876543210fedcba9876543210fedcba9876543210fedcba98765',
    isShareable: false,
    aiTags: ['Birth Certificate', 'Civil Status', 'Private Record'],
    aiConfidence: 0.99,
    verificationBadge: {
      status: 'VERIFIED_IMMUTABLE',
      ledgerTx: '0xf4e3d2c1b0a9876543210fedcba98765',
      verifiedAt: new Date().toISOString(),
    },
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'doc_mykhailo_1',
    userId: '660a22222222222222222222',
    title: 'National Identity Card (Diia Verified Copy)',
    category: 'identity',
    filename: 'mykhailo_national_id_card.pdf',
    filepath: '/uploads/mykhailo_national_id_card.pdf',
    filetype: 'application/pdf',
    filesize: 95000,
    sha256Hash: 'b9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcb',
    isShareable: true,
    aiTags: ['National ID', 'Diia Interoperable', 'Biometric'],
    aiConfidence: 0.97,
    verificationBadge: {
      status: 'VERIFIED_IMMUTABLE',
      ledgerTx: '0xb9876543210fedcba9876543210fedcb',
      verifiedAt: new Date().toISOString(),
    },
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const defaultDemoTriage = [
  {
    _id: 'triage_oksana_1',
    userId: '660a11111111111111111111',
    symptoms: 'Shortness of breath, wheezing after walking in cold weather, asthma history',
    urgencyLevel: 'Moderate',
    explanation: 'Wheezing and shortness of breath with known asthma history indicates potential mild asthma exacerbation.',
    suggestedNextStep: 'Seek local pharmacy or primary care clinic for bronchodilator / Salbutamol refill.',
    aiSource: 'Gemini 1.5 Pro Medical Triage Model',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const defaultDemoTransactions = [
  {
    _id: 'tx_oksana_1',
    userId: '660a11111111111111111111',
    type: 'emergency_aid',
    title: 'Emergency Aid: Temporary Housing Support',
    amount: 150,
    currency: 'EUR',
    sender: 'IdentiChain Cross-Border Relief Pool',
    status: 'Completed',
    txHash: '0x7a8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    _id: 'tx_oksana_2',
    userId: '660a11111111111111111111',
    type: 'emergency_aid',
    title: 'Emergency Aid: Medical Prescription Voucher',
    amount: 50,
    currency: 'EUR',
    sender: 'UNHCR Poland Emergency Care Fund',
    status: 'Completed',
    txHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// Helper functions for Documents
const getMemoryDocumentsList = () => {
  try {
    if (fs.existsSync(docsStorageFile)) {
      const raw = fs.readFileSync(docsStorageFile, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.warn('Memory documents read warning:', e.message);
  }
  return defaultDemoDocs;
};

const saveMemoryDocumentsList = (list) => {
  try {
    fs.writeFileSync(docsStorageFile, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Memory documents write warning:', e.message);
  }
};

const getMemoryDocuments = (userId, category) => {
  const docs = getMemoryDocumentsList();
  
  // Find docs explicitly belonging to this user
  const userSpecificDocs = docs.filter((d) => {
    const userMatch = userId && d.userId && d.userId.toString() === userId.toString();
    const categoryMatch = !category || category === 'all' || d.category === category;
    return userMatch && categoryMatch;
  });

  if (userSpecificDocs.length > 0) {
    return userSpecificDocs;
  }

  // Otherwise return demo docs filtered by category
  return docs.filter((d) => !category || category === 'all' || d.category === category);
};


const saveMemoryDocument = (docObj) => {
  const docs = getMemoryDocumentsList();
  docs.unshift(docObj);
  saveMemoryDocumentsList(docs);
  return docObj;
};

const toggleMemoryDocVisibility = (docId, userId) => {
  const docs = getMemoryDocumentsList();
  const index = docs.findIndex((d) => d._id.toString() === docId.toString() && d.userId.toString() === userId.toString());
  if (index !== -1) {
    docs[index].isShareable = !docs[index].isShareable;
    saveMemoryDocumentsList(docs);
    return docs[index];
  }
  return null;
};

const deleteMemoryDocument = (docId, userId) => {
  let docs = getMemoryDocumentsList();
  const initialLength = docs.length;
  docs = docs.filter((d) => !(d._id.toString() === docId.toString() && d.userId.toString() === userId.toString()));
  if (docs.length !== initialLength) {
    saveMemoryDocumentsList(docs);
    return true;
  }
  return false;
};

// Helper functions for Triage
const getMemoryTriageList = () => {
  try {
    if (fs.existsSync(triageStorageFile)) {
      const raw = fs.readFileSync(triageStorageFile, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.warn('Memory triage read warning:', e.message);
  }
  return defaultDemoTriage;
};

const saveMemoryTriageRecord = (triageObj) => {
  const list = getMemoryTriageList();
  list.unshift(triageObj);
  try {
    fs.writeFileSync(triageStorageFile, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Memory triage write warning:', e.message);
  }
  return triageObj;
};

const getMemoryTriageHistory = (userId) => {
  const list = getMemoryTriageList();
  return list.filter((t) => t.userId.toString() === userId.toString());
};

// Helper functions for Wallet
const getMemoryWalletData = () => {
  try {
    if (fs.existsSync(walletStorageFile)) {
      const raw = fs.readFileSync(walletStorageFile, 'utf8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.transactions)) return data;
    }
  } catch (e) {
    console.warn('Memory wallet read warning:', e.message);
  }
  return { transactions: defaultDemoTransactions, aidRequests: [] };
};

const saveMemoryWalletData = (data) => {
  try {
    fs.writeFileSync(walletStorageFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn('Memory wallet write warning:', e.message);
  }
};

const getMemoryWalletSummary = (userId) => {
  const wallet = getMemoryWalletData();
  const userTxs = wallet.transactions.filter((t) => t.userId.toString() === userId.toString());
  const userReqs = wallet.aidRequests.filter((r) => r.userId.toString() === userId.toString());
  const balance = userTxs.reduce((acc, t) => (t.status === 'Completed' ? acc + t.amount : acc), 0);

  return {
    currency: 'EUR',
    balance,
    transactions: userTxs,
    aidRequests: userReqs,
  };
};

const saveMemoryAidRequest = (requestObj, txObj) => {
  const wallet = getMemoryWalletData();
  wallet.aidRequests.unshift(requestObj);
  if (txObj) {
    wallet.transactions.unshift(txObj);
  }
  saveMemoryWalletData(wallet);
};

module.exports = {
  getMemoryDocuments,
  saveMemoryDocument,
  toggleMemoryDocVisibility,
  deleteMemoryDocument,
  getMemoryTriageHistory,
  saveMemoryTriageRecord,
  getMemoryWalletSummary,
  saveMemoryAidRequest,
};
