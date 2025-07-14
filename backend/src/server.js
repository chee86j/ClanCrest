const app = require("./app");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Get port from environment variable or default to 3001
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});
