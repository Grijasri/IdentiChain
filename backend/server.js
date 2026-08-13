const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const triageRoutes = require('./routes/triage');
const walletRoutes = require('./routes/wallet');
const verifierRoutes = require('./routes/verifier');
const partnerRoutes = require('./routes/partners');
const seedData = require('./seed');
const User = require('./models/User');

const app = express();

// Connect Database & Auto-seed if empty
connectDB().then(async () => {
  try {
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      console.log('Database empty. Running automatic demo seed...');
      await seedData();
    }
  } catch (err) {
    console.error('Auto-seed check error:', err);
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve Uploaded Files Statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/partners', partnerRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'IdentiChain Full-Stack Server',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Serve Frontend Build (dist)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log(`Serving static frontend build from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #0f172a; color: #fff; min-height: 100vh;">
        <h1 style="color: #14b8a6;">IdentiChain API Server Running!</h1>
        <p>Backend API is active on <strong>http://localhost:5000</strong></p>
        <p>To run frontend in dev mode: <code>npm --prefix frontend run dev</code></p>
        <p>To build frontend for 1-click single-port serving: <code>npm --prefix frontend run build</code></p>
      </div>
    `);
  });
}

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  IdentiChain Server running on port ${PORT}`);
    console.log(`  App URL: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

module.exports = app;

