const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['aid_disbursement', 'grant', 'cross_border_transfer', 'pharmacy_voucher', 'emergency_aid'],
    default: 'emergency_aid',
  },
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'EUR',
  },
  sender: {
    type: String,
    default: 'IdentiChain Global Humanitarian Fund',
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Processing'],
    default: 'Completed',
  },
  txHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
