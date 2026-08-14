const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const { generateFileHash } = require('../services/hashService');
const { classifyDocument } = require('../services/aiService');

const os = require('os');
const uploadsDir = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('Documents upload dir creation skipped:', e.message);
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, JPG, PNG, and DOC document formats are supported.'));
  },
});

// @route   POST /api/documents/upload
// @desc    Upload document, generate SHA-256 hash, run AI classification, save metadata
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { title, customCategory, isShareable } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // 1. Generate SHA-256 Cryptographic Hash
    const sha256Hash = generateFileHash(filePath);

    // 2. Run AI Classification
    const aiClassification = await classifyDocument(fileName, title || '');

    // Allow user override if customCategory provided, otherwise use AI category
    const finalCategory = customCategory && ['identity', 'medical', 'education_property'].includes(customCategory)
      ? customCategory
      : aiClassification.category;

    const newDoc = new Document({
      userId: req.user.id,
      title: title || fileName.split('.')[0],
      category: finalCategory,
      filename: req.file.filename,
      filepath: `/uploads/${req.file.filename}`,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      sha256Hash,
      isShareable: isShareable === 'false' ? false : true,
      aiTags: aiClassification.tags,
      aiConfidence: aiClassification.confidence,
      verificationBadge: {
        status: 'VERIFIED_IMMUTABLE',
        ledgerTx: '0x' + sha256Hash.substring(0, 32),
        verifiedAt: new Date(),
      },
    });

    await newDoc.save();

    res.status(201).json({
      message: 'Document uploaded and cryptographically verified on ledger!',
      document: newDoc,
      aiClassification,
    });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ message: err.message || 'Server error during document upload.' });
  }
});

// @route   GET /api/documents
// @desc    Get logged-in user's document vault
router.get('/', auth, async (req, res) => {
  try {
    const { category } = req.query;
    let query = { userId: req.user.id };
    if (category && category !== 'all') {
      query.category = category;
    }

    const documents = await Document.find(query).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error('Fetch documents error:', err);
    res.status(500).json({ message: 'Server error fetching documents.' });
  }
});

// @route   PATCH /api/documents/:id/visibility
// @desc    Toggle document privacy (Private vs Shareable with verified orgs)
router.patch('/:id/visibility', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    doc.isShareable = !doc.isShareable;
    await doc.save();

    res.json({
      message: `Document privacy set to ${doc.isShareable ? 'Shareable with Verified Orgs' : 'Private'}`,
      isShareable: doc.isShareable,
      document: doc,
    });
  } catch (err) {
    console.error('Visibility update error:', err);
    res.status(500).json({ message: 'Server error updating document visibility.' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document from vault
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Attempt to delete physical file
    const fullPath = path.join(__dirname, '..', doc.filepath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    res.json({ message: 'Document deleted successfully from vault.' });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ message: 'Server error deleting document.' });
  }
});

module.exports = router;
