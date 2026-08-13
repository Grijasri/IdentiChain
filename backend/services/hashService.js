const crypto = require('crypto');
const fs = require('fs');

/**
 * Generate SHA-256 cryptographic hash of a file buffer or file path
 */
const generateFileHash = (fileBufferOrPath) => {
  const hash = crypto.createHash('sha256');
  if (Buffer.isBuffer(fileBufferOrPath)) {
    hash.update(fileBufferOrPath);
  } else if (typeof fileBufferOrPath === 'string' && fs.existsSync(fileBufferOrPath)) {
    const fileBuffer = fs.readFileSync(fileBufferOrPath);
    hash.update(fileBuffer);
  } else if (typeof fileBufferOrPath === 'string') {
    hash.update(Buffer.from(fileBufferOrPath));
  } else {
    hash.update(Buffer.from(Date.now().toString() + Math.random().toString()));
  }
  return hash.digest('hex');
};

/**
 * Generate SHA-256 hash for transaction signatures
 */
const generateTxHash = (dataString) => {
  return '0x' + crypto.createHash('sha256').update(dataString + Date.now()).digest('hex');
};

module.exports = {
  generateFileHash,
  generateTxHash,
};
