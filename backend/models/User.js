const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['refugee', 'verifier'],
    default: 'refugee',
  },
  digitalId: {
    type: String,
    required: true,
    unique: true,
  },
  countryOfOrigin: {
    type: String,
    default: 'Ukraine',
  },
  currentLocation: {
    type: String,
    default: 'Krakow, Poland',
  },
  qrCodeUrl: {
    type: String,
  },
  organization: {
    type: String,
    default: '',
  },
  verifierType: {
    type: String,
    enum: ['ngo', 'clinic', 'bank', 'border_authority', ''],
    default: '',
  },
  verifiedBadge: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
