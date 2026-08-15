const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Persistent storage file in /tmp for serverless environments
const storageFile = path.join(os.tmpdir(), 'identichain_users_vault.json');

// Pre-generated password hashes for demo accounts
const defaultRefugeeHash = bcrypt.hashSync('refugee123', 10);
const defaultVerifierHash = bcrypt.hashSync('verifier123', 10);

const defaultDemoUsers = [
  {
    _id: '660a11111111111111111111',
    name: 'Oksana Petrenko',
    email: 'oksana@identichain.org',
    password: defaultRefugeeHash,
    role: 'refugee',
    digitalId: 'IDC-8F92-4A71-9B3E',
    countryOfOrigin: 'Ukraine (Kyiv)',
    currentLocation: 'Warsaw, Poland',
  },
  {
    _id: '660a22222222222222222222',
    name: 'Mykhailo Shevchenko',
    email: 'mykhailo@identichain.org',
    password: defaultRefugeeHash,
    role: 'refugee',
    digitalId: 'IDC-73B1-92F0-4C11',
    countryOfOrigin: 'Ukraine (Kharkiv)',
    currentLocation: 'Krakow, Poland',
  },
  {
    _id: '660a33333333333333333333',
    name: 'Dr. Olena Kovalenko (UNHCR Clinic)',
    email: 'verifier.clinic@identichain.org',
    password: defaultVerifierHash,
    role: 'verifier',
    digitalId: 'IDC-VERIFIER-CLINIC-01',
    organization: 'UNHCR Poland Border Health Clinic',
    verifierType: 'clinic',
    countryOfOrigin: 'Ukraine',
    currentLocation: 'Krakow, Poland',
  },
  {
    _id: '660a44444444444444444444',
    name: 'Jan Nowak (PKO Bank Relief)',
    email: 'verifier.bank@identichain.org',
    password: defaultVerifierHash,
    role: 'verifier',
    digitalId: 'IDC-VERIFIER-BANK-02',
    organization: 'PKO Bank Polski Humanitarian Integration Unit',
    verifierType: 'bank',
    countryOfOrigin: 'Poland',
    currentLocation: 'Warsaw, Poland',
  },
];

const getMemoryUsers = () => {
  const map = new Map();
  defaultDemoUsers.forEach((u) => map.set(u.email.toLowerCase(), u));
  try {
    if (fs.existsSync(storageFile)) {
      const raw = fs.readFileSync(storageFile, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((u) => map.set(u.email.toLowerCase(), u));
      }
    }
  } catch (e) {
    console.warn('Memory user storage read error:', e.message);
  }
  return map;
};

const saveMemoryUser = (userObj) => {
  const map = getMemoryUsers();
  map.set(userObj.email.toLowerCase(), userObj);
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(storageFile, JSON.stringify(list), 'utf8');
  } catch (e) {
    console.warn('Memory user storage write error:', e.message);
  }
};

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
      const memoryUsersMap = getMemoryUsers();
      if (memoryUsersMap.has(normalizedEmail)) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      activeUser = {
        _id: new mongoose.Types.ObjectId().toString(),
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
      saveMemoryUser(activeUser);
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
    res.status(500).json({ message: err.message || 'Server error during registration.' });
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
      const memoryUsersMap = getMemoryUsers();
      user = memoryUsersMap.get(normalizedEmail);
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
      const memoryUsersMap = getMemoryUsers();
      for (const u of memoryUsersMap.values()) {
        const uId = u._id ? u._id.toString() : '';
        if (uId === req.user.id.toString() || u.email.toLowerCase() === req.user.email?.toLowerCase()) {
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

