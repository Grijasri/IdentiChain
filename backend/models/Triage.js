const mongoose = require('mongoose');

const TriageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symptoms: {
    type: String,
    required: true,
  },
  urgencyLevel: {
    type: String,
    enum: ['Mild', 'Moderate', 'Urgent'],
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  suggestedNextStep: {
    type: String,
    required: true,
  },
  aiSource: {
    type: String,
    default: 'IdentiChain Medical AI Engine (Offline Fallback)',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Triage', TriageSchema);
