const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper to generate QR code string
const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
};

// @route   POST /api/auth/register
// @desc    Register a new Refugee User or Verifier
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, countryOfOrigin, currentLocation, organization, verifierType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique Digital ID (UUID)
    const rawUuid = uuidv4().toUpperCase().split('-')[0];
    const digitalId = `IDC-${rawUuid}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate QR Code Data URL
    const qrPayload = JSON.stringify({
      digitalId,
      name,
      countryOfOrigin: countryOfOrigin || 'Ukraine',
      issuer: 'IdentiChain Global Vault Network',
    });
    const qrCodeUrl = await generateQRCode(qrPayload);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'refugee',
      digitalId,
      countryOfOrigin: countryOfOrigin || 'Ukraine',
      currentLocation: currentLocation || 'Krakow, Poland',
      qrCodeUrl,
      organization: organization || '',
      verifierType: verifierType || '',
    });

    await newUser.save();

    const payload = {
      id: newUser._id,
      role: newUser.role,
      digitalId: newUser.digitalId,
      name: newUser.name,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'identichain_super_secret_jwt_key_2026_refugee_vault',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        digitalId: newUser.digitalId,
        countryOfOrigin: newUser.countryOfOrigin,
        currentLocation: newUser.currentLocation,
        qrCodeUrl: newUser.qrCodeUrl,
        organization: newUser.organization,
        verifierType: newUser.verifierType,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const payload = {
      id: user._id,
      role: user.role,
      digitalId: user.digitalId,
      name: user.name,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'identichain_super_secret_jwt_key_2026_refugee_vault',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        digitalId: user.digitalId,
        countryOfOrigin: user.countryOfOrigin,
        currentLocation: user.currentLocation,
        qrCodeUrl: user.qrCodeUrl,
        organization: user.organization,
        verifierType: user.verifierType,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
});

module.exports = router;
