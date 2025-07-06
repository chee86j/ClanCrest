const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');
const { errorHandler, AuthError } = require('../utils/errorHandler');

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Handle Google OAuth callback
 */
const handleGoogleAuth = errorHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AuthError('No token provided');
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const googleUser = ticket.getPayload();
    console.log("✅ Google user verified:", googleUser.email);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          picture: googleUser.picture
        }
      });
      console.log("👤 Created new user:", user.email);
    } else {
      // Update existing user's Google info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          picture: googleUser.picture,
          name: googleUser.name
        }
      });
      console.log("👤 Updated existing user:", user.email);
    }

    // Generate JWT
    const authToken = generateToken(user);

    res.json({
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error("🚨 Google auth error:", error);
    throw new AuthError('Failed to authenticate with Google');
  }
});

/**
 * Get current user profile
 */
const getProfile = errorHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AuthError('User not found');
  }

  res.json(user);
});

module.exports = {
  handleGoogleAuth,
  getProfile
};
