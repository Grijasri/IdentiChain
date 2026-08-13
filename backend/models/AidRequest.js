const mongoose = require('mongoose');

const AidRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  urgencyReason: {
    type: String,
    required: true,
  },
  amountRequested: {
    type: Number,
    required: true,
  },
  attachedDocId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  attachedDocTitle: {
    type: String,
    default: 'Identity & Legal Proof Attached',
  },
  riskScore: {
    type: Number,
    required: true,
  },
  riskReasoning: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Approved', 'Rejected', 'Under Review'],
    default: 'Approved',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AidRequest', AidRequestSchema);
