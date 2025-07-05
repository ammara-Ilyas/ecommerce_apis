import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthenticationError, AuthorizationError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

// Verify JWT token and attach user to request
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.jwt_SECRET_KEY);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new AuthenticationError('Please verify your email first');
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Verify admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    logger.warn({
      message: 'Unauthorized admin access attempt',
      userId: req.user._id,
      userRole: req.user.role,
      ip: req.ip,
      url: req.url
    });
    return next(new AuthorizationError('Admin access required'));
  }

  next();
};

// Verify seller role
export const requireSeller = (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!['admin', 'seller'].includes(req.user.role)) {
    logger.warn({
      message: 'Unauthorized seller access attempt',
      userId: req.user._id,
      userRole: req.user.role,
      ip: req.ip,
      url: req.url
    });
    return next(new AuthorizationError('Seller access required'));
  }

  next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.jwt_SECRET_KEY);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isVerified) {
      req.user = user;
      req.userId = user._id;
    }
    
    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue
    next();
  }
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.jwt_SECRET_KEY,
    {
      expiresIn: '7d',
    }
  );
};

// Refresh token middleware (for future implementation)
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, process.env.jwt_REFRESH_SECRET_KEY);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const newToken = generateToken(user);
    
    res.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    next(error);
  }
}; 