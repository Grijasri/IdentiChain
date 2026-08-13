const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const AidRequest = require('../models/AidRequest');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const { scoreAidRisk } = require('../services/aiService');
const { generateTxHash } = require('../services/hashService');

// @route   GET /api/wallet/summary
// @desc    Get user's Aid Wallet balance, total aid received, and transaction ledger
router.get('/summary', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const totalBalance = transactions.reduce((acc, tx) => {
      return tx.status === 'Completed' ? acc + tx.amount : acc;
    }, 0);

    const aidRequests = await AidRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      currency: 'EUR',
      balance: totalBalance,
      transactions,
      aidRequests,
    });
  } catch (err) {
    console.error('Wallet summary error:', err);
    res.status(500).json({ message: 'Server error fetching wallet summary.' });
  }
});

// @route   POST /api/wallet/request-aid
// @desc    Apply for Emergency Micro-Aid (runs AI Risk Scoring)
router.post('/request-aid', auth, async (req, res) => {
  try {
    const { urgencyReason, amountRequested, attachedDocId } = req.body;

    if (!urgencyReason || !amountRequested) {
      return res.status(400).json({ message: 'Urgency reason and amount requested are required.' });
    }

    const amount = Number(amountRequested);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid aid amount.' });
    }

    let attachedDoc = null;
    if (attachedDocId) {
      attachedDoc = await Document.findOne({ _id: attachedDocId, userId: req.user.id });
    }

    // Run AI Risk Scoring
    const aiRisk = await scoreAidRisk(urgencyReason, amount, !!attachedDoc);

    const aidRequest = new AidRequest({
      userId: req.user.id,
      urgencyReason,
      amountRequested: amount,
      attachedDocId: attachedDoc ? attachedDoc._id : null,
      attachedDocTitle: attachedDoc ? attachedDoc.title : 'No Vault Document Attached',
      riskScore: aiRisk.riskScore,
      riskReasoning: aiRisk.reasoning,
      status: aiRisk.status,
    });

    await aidRequest.save();

    let newTransaction = null;
    if (aiRisk.status === 'Approved') {
      const txHash = generateTxHash(`AID-${req.user.id}-${amount}`);
      newTransaction = new Transaction({
        userId: req.user.id,
        type: 'emergency_aid',
        title: `Emergency Aid: ${urgencyReason.substring(0, 30)}...`,
        amount: amount,
        currency: 'EUR',
        sender: 'IdentiChain Cross-Border Relief Pool',
        status: 'Completed',
        txHash,
      });

      await newTransaction.save();
    }

    res.status(201).json({
      message: aiRisk.status === 'Approved' ? 'Emergency Aid Approved & Disbursed!' : 'Aid Request Submitted for Priority Desk Review.',
      aidRequest,
      transaction: newTransaction,
      aiRisk,
    });
  } catch (err) {
    console.error('Aid request error:', err);
    res.status(500).json({ message: 'Server error processing micro-aid request.' });
  }
});

module.exports = router;
