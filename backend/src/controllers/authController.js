const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const {
  ValidationError,
  AuthError,
  NotFoundError,
  asyncHandler,
} = require("../utils/errorHandler");

const prisma = new PrismaClient();

/**
 * Verify Google access token and get user info
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Object>} User info from Google
 */
async function verifyGoogleAccessToken(accessToken) {
  try {
    console.log("🔍 Verifying access token:", accessToken);

    // Fetch user info from Google using the access token
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error("Failed to verify access token");
    }

    const userInfo = await response.json();
    console.log("✅ User info from Google:", userInfo);

    return userInfo;
  } catch (error) {
    console.error("❌ Error verifying Google access token:", error);
    throw new AuthError("Invalid access token");
  }
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object from database
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Handle Google OAuth authentication
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;
  console.log("🔐 Received token:", token);

  if (!token) {
    throw new ValidationError("Token is required");
  }

  // For backward compatibility, check if it's a JWT token first
  let googleUser;
  try {
    // Try to decode as JWT first
    const decodedToken = jwt.decode(token);
    if (decodedToken && decodedToken.email) {
      googleUser = decodedToken;
    } else {
      // If not JWT, treat as access token
      googleUser = await verifyGoogleAccessToken(token);
    }
  } catch (error) {
    // If JWT decode fails, treat as access token
    googleUser = await verifyGoogleAccessToken(token);
  }

  console.log("👤 Google user:", googleUser);

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
  });

  if (!user) {
    console.log("🆕 Creating new user:", googleUser.email);
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        googleId: googleUser.id || googleUser.sub,
        name: `${googleUser.given_name} ${googleUser.family_name}`,
        picture: googleUser.picture,
      },
    });
  } else {
    console.log("🔄 Updating existing user:", googleUser.email);
    // Update existing user's Google info
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: googleUser.id || googleUser.sub,
        name: `${googleUser.given_name} ${googleUser.family_name}`,
        picture: googleUser.picture,
      },
    });
  }

  // Generate JWT
  const authToken = generateToken(user);
  console.log("✅ Authentication successful for:", user.email);

  res.json({
    token: authToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
});

/**
 * Get current user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  console.log("📋 Profile fetched for:", user.email);
  res.json(user);
});

module.exports = {
  googleAuth,
  getProfile,
};
