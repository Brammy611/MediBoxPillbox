const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medibox_secret_key_2025';

// Middleware untuk verifikasi JWT token
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Tidak ada token, akses ditolak'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token tidak valid',
      error: error.message
    });
  }
};

module.exports = auth;
