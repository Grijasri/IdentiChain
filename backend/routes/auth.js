const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const User = require('../models/User');
const auth = require('../middleware/auth');

const mongoose = require('mongoose');

// In-memory fallback store for serverless execution when Mongo connection is unavailable
const memoryUsers = new Map();

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

    const normalizedEmail = email.toLowerCase();
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

    let activeUser = null;

    if (mongoose.connection.readyState === 1) {
      try {
        let existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(400).json({ message: 'An account with this email already exists.' });
        }
        const newUser = new User({
          name,
          email: normalizedEmail,
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
        activeUser = newUser;
      } catch (dbErr) {
        console.warn('DB save warning, switching to memory store:', dbErr.message);
      }
    }

    if (!activeUser) {
      if (memoryUsers.has(normalizedEmail)) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      activeUser = {
        _id: new mongoose.Types.ObjectId(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'refugee',
        digitalId,
        countryOfOrigin: countryOfOrigin || 'Ukraine',
        currentLocation: currentLocation || 'Krakow, Poland',
        qrCodeUrl,
        organization: organization || '',
        verifierType: verifierType || '',
      };
      memoryUsers.set(normalizedEmail, activeUser);
    }

    const payload = {
      id: activeUser._id,
      role: activeUser.role,
      digitalId: activeUser.digitalId,
      name: activeUser.name,
      email: activeUser.email,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'identichain_super_secret_jwt_key_2026_refugee_vault',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: activeUser._id,
        name: activeUser.name,
        email: activeUser.email,
        role: activeUser.role,
        digitalId: activeUser.digitalId,
        countryOfOrigin: activeUser.countryOfOrigin,
        currentLocation: activeUser.currentLocation,
        qrCodeUrl: activeUser.qrCodeUrl,
        organization: activeUser.organization,
        verifierType: activeUser.verifierType,
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

    const normalizedEmail = email.toLowerCase();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (dbErr) {
        console.warn('DB search warning:', dbErr.message);
      }
    }

    if (!user) {
      user = memoryUsers.get(normalizedEmail);
    }

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
      email: user.email,
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
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(req.user.id).select('-password');
      } catch (e) {}
    }
    if (!user) {
      for (const u of memoryUsers.values()) {
        if (u._id.toString() === req.user.id.toString() || u.email === req.user.email) {
          user = u;
          break;
        }
      }
    }
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
