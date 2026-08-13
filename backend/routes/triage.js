const express = require('express');
const router = express.Router();
const Triage = require('../models/Triage');
const auth = require('../middleware/auth');
const { triageSymptoms } = require('../services/aiService');

// @route   POST /api/triage/assess
// @desc    Run AI Medical Triage on user symptoms
router.post('/assess', auth, async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ message: 'Please describe your symptoms.' });
    }

    const aiResult = await triageSymptoms(symptoms);

    const triageRecord = new Triage({
      userId: req.user.id,
      symptoms,
      urgencyLevel: aiResult.urgencyLevel,
      explanation: aiResult.explanation,
      suggestedNextStep: aiResult.suggestedNextStep,
      aiSource: aiResult.aiSource,
    });

    await triageRecord.save();

    res.status(201).json({
      message: 'AI Triage evaluation complete.',
      result: triageRecord,
    });
  } catch (err) {
    console.error('Triage assessment error:', err);
    res.status(500).json({ message: 'Server error during AI triage assessment.' });
  }
});

// @route   GET /api/triage/history
// @desc    Get user's AI triage evaluation history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Triage.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error('Fetch triage history error:', err);
    res.status(500).json({ message: 'Server error fetching triage history.' });
  }
});

module.exports = router;
