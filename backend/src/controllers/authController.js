const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

/**
 * Authenticate with Google OAuth
 * This endpoint is for the token-based approach (not used with redirect flow)
 */
const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token with Google
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    const { sub, email, name, picture } = googleResponse.data;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId: sub },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId: sub,
          email,
          name,
          avatar: picture,
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name,
          avatar: picture,
        },
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    next(error);
  }
};

/**
 * Handle Google OAuth callback
 * This endpoint is for the redirect-based OAuth flow
 */
const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.FRONTEND_URL}/auth`,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info with the access token
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );

    const { sub, email, name, picture } = googleResponse.data;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId: sub },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId: sub,
          email,
          name,
          avatar: picture,
        },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name,
          avatar: picture,
        },
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google Callback Error:", error);
    next(error);
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  getCurrentUser,
};
