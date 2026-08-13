const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['identity', 'medical', 'education_property'],
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  filetype: {
    type: String,
    default: 'application/pdf',
  },
  filesize: {
    type: Number,
    default: 0,
  },
  sha256Hash: {
    type: String,
    required: true,
  },
  isShareable: {
    type: Boolean,
    default: true, // "Shareable with verified organizations"
  },
  aiTags: [
    {
      type: String,
    },
  ],
  aiConfidence: {
    type: Number,
    default: 0.95,
  },
  verificationBadge: {
    status: { type: String, default: 'VERIFIED_IMMUTABLE' },
    ledgerTx: { type: String },
    verifiedAt: { type: Date, default: Date.now },
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Document', DocumentSchema);
