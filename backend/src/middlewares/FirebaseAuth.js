const { adminAuth } = require('../config/firebase-admin');
const { UserModel } = require('../models');
const { generatoken } = require('../utils/Token.utils');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authorization.split('Bearer ')[1];
    
    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Find or create user in your database
    let user = await UserModel.findOne({ email: decodedToken.email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await UserModel.create({
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        password: Math.random().toString(36).slice(-8), // Random password for social users
        provider: decodedToken.firebase.sign_in_provider,
        isEmailVerified: decodedToken.email_verified || false
      });
    }

    // Generate your application's JWT token
    const jwtToken = generatoken(user);
    
    // Attach user and token to the request
    req.user = user;
    res.locals.token = jwtToken;

    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token',
      error: error.message 
    });
  }
};

module.exports = { verifyFirebaseToken };
