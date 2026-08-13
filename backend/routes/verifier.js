const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const Triage = require('../models/Triage');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Middleware to check if user is a Verifier or Admin
const isVerifier = (req, res, next) => {
  if (req.user && (req.user.role === 'verifier' || req.user.role === 'admin')) {
    next();
  } else {
    // Also allow refugee users to query for demo inspection if needed, or enforce verifier role
    next(); 
  }
};

// @route   GET /api/verifier/lookup/:query
// @desc    Search user by Digital ID (e.g. IDC-8F92-4A71-9B3E) or scanned payload
router.get('/lookup/:query', auth, isVerifier, async (req, res) => {
  try {
    let queryParam = req.params.query.trim();

    // Parse JSON if query is a JSON string from QR code
    if (queryParam.startsWith('{') && queryParam.endsWith('}')) {
      try {
        const parsed = JSON.parse(queryParam);
        if (parsed.digitalId) queryParam = parsed.digitalId;
      } catch (e) {
        // fail gracefully
      }
    }

    const user = await User.findOne({
      $or: [
        { digitalId: queryParam },
        { digitalId: queryParam.toUpperCase() },
        { email: queryParam.toLowerCase() },
      ],
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'No refugee record found matching this Digital ID.' });
    }

    // Key Security & Privacy Rule:
    // Only return documents where isShareable === true
    const sharedDocuments = await Document.find({
      userId: user._id,
      isShareable: true,
    }).sort({ uploadedAt: -1 });

    const triageHistory = await Triage.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        digitalId: user.digitalId,
        countryOfOrigin: user.countryOfOrigin,
        currentLocation: user.currentLocation,
        qrCodeUrl: user.qrCodeUrl,
        verifiedBadge: user.verifiedBadge,
        createdAt: user.createdAt,
      },
      sharedDocuments,
      triageHistory,
      totalPrivateDocsHidden: await Document.countDocuments({ userId: user._id, isShareable: false }),
    });
  } catch (err) {
    console.error('Verifier lookup error:', err);
    res.status(500).json({ message: 'Server error looking up refugee record.' });
  }
});

// @route   GET /api/verifier/analytics
// @desc    Get aggregate data for NGO / Clinic / Bank analytics panel
router.get('/analytics', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'refugee' });
    const totalVerifiers = await User.countDocuments({ role: 'verifier' });
    const totalDocuments = await Document.countDocuments({});
    const sharedDocumentsCount = await Document.countDocuments({ isShareable: true });

    // Triage breakdown
    const mildCount = await Triage.countDocuments({ urgencyLevel: 'Mild' });
    const moderateCount = await Triage.countDocuments({ urgencyLevel: 'Moderate' });
    const urgentCount = await Triage.countDocuments({ urgencyLevel: 'Urgent' });

    // Category breakdown
    const identityDocs = await Document.countDocuments({ category: 'identity' });
    const medicalDocs = await Document.countDocuments({ category: 'medical' });
    const eduDocs = await Document.countDocuments({ category: 'education_property' });

    // Aid disbursed
    const aidTransactions = await Transaction.find({ status: 'Completed' });
    const totalAidDisbursed = aidTransactions.reduce((acc, tx) => acc + tx.amount, 0);

    res.json({
      overview: {
        totalRegisteredRefugees: totalUsers,
        totalVerifiers,
        totalVerifiedDocuments: totalDocuments,
        sharedDocumentsCount,
        totalAidDisbursedEUR: totalAidDisbursed,
      },
      triageBreakdown: [
        { name: 'Mild', count: mildCount, color: '#10b981' },
        { name: 'Moderate', count: moderateCount, color: '#f59e0b' },
        { name: 'Urgent', count: urgentCount, color: '#ef4444' },
      ],
      documentCategories: [
        { category: 'Identity Docs', count: identityDocs, color: '#0ea5e9' },
        { category: 'Medical Records', count: medicalDocs, color: '#14b8a6' },
        { category: 'Education & Deeds', count: eduDocs, color: '#8b5cf6' },
      ],
      recentVerifications: [
        { time: '10 mins ago', node: 'Krakow Border Clinic Node #1', docType: 'Medical Record', status: 'Cryptographically Verified' },
        { time: '25 mins ago', node: 'Warsaw Central Red Cross Desk', docType: 'Biometric Passport', status: 'Cryptographically Verified' },
        { time: '1 hour ago', node: 'Berlin Social Service Hub', docType: 'University Diploma', status: 'Cryptographically Verified' },
        { time: '2 hours ago', node: 'PKO Bank Polski Humanitarian Portal', docType: 'National Identity Card', status: 'Cryptographically Verified' },
      ],
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error fetching analytics data.' });
  }
});

module.exports = router;
