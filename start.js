#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🌳 ClanCrest - Family Tree Application");
console.log("=====================================\n");

// Check if .env file exists in backend
const backendEnvPath = path.join(__dirname, "backend", ".env");
if (!fs.existsSync(backendEnvPath)) {
  console.log("📝 Creating backend environment file...");

  const envContent = `# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/clancrest"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI API (Optional - for kinship analysis)
OPENAI_API_KEY="your-openai-api-key"

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:8080"

# Server Configuration
PORT=3000
NODE_ENV=development
`;

  fs.writeFileSync(backendEnvPath, envContent);
  console.log("✅ Backend .env file created");
  console.log(
    "⚠️  Please update the DATABASE_URL in backend/.env with your PostgreSQL connection string\n"
  );
}

// Check if node_modules exist
const backendNodeModules = path.join(__dirname, "backend", "node_modules");
const frontendNodeModules = path.join(__dirname, "frontend", "node_modules");

if (!fs.existsSync(backendNodeModules)) {
  console.log("📦 Installing backend dependencies...");
  try {
    execSync("npm install", {
      cwd: path.join(__dirname, "backend"),
      stdio: "inherit",
    });
    console.log("✅ Backend dependencies installed");
  } catch (error) {
    console.error("❌ Failed to install backend dependencies:", error.message);
    process.exit(1);
  }
}

if (!fs.existsSync(frontendNodeModules)) {
  console.log("📦 Installing frontend dependencies...");
  try {
    execSync("npm install", {
      cwd: path.join(__dirname, "frontend"),
      stdio: "inherit",
    });
    console.log("✅ Frontend dependencies installed");
  } catch (error) {
    console.error("❌ Failed to install frontend dependencies:", error.message);
    process.exit(1);
  }
}

// Check if Prisma client is generated
const prismaClientPath = path.join(
  __dirname,
  "backend",
  "node_modules",
  "@prisma",
  "client"
);
if (!fs.existsSync(prismaClientPath)) {
  console.log("🔧 Generating Prisma client...");
  try {
    execSync("npx prisma generate", {
      cwd: path.join(__dirname, "backend"),
      stdio: "inherit",
    });
    console.log("✅ Prisma client generated");
  } catch (error) {
    console.error("❌ Failed to generate Prisma client:", error.message);
    process.exit(1);
  }
}

// Build frontend
console.log("🔨 Building frontend library...");
try {
  execSync("npm run build", {
    cwd: path.join(__dirname, "frontend"),
    stdio: "inherit",
  });
  console.log("✅ Frontend library built");
} catch (error) {
  console.error("❌ Failed to build frontend:", error.message);
  process.exit(1);
}

console.log("\n🎉 Setup complete!");
console.log("\n📋 Next steps:");
console.log(
  "1. Update the DATABASE_URL in backend/.env with your PostgreSQL connection string"
);
console.log("2. Run database migrations: cd backend && npx prisma migrate dev");
console.log("3. Start the development servers: npm run dev");
console.log("\n🌐 The application will be available at:");
console.log("   - Frontend: http://localhost:5173");
console.log("   - Backend API: http://localhost:3000");
console.log("   - API Documentation: http://localhost:3000/api/docs");
console.log("\n📖 Check the README.md file for more detailed instructions.");
