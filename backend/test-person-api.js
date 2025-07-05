/**
 * Simple test script for Person API endpoints
 * Run with: node test-person-api.js
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";
let authToken = null;

// Test data
const testPerson = {
  name: "John Doe",
  nameZh: "约翰·多伊",
  notes: "Test person for API validation",
};

const testPersonUpdate = {
  name: "Jane Doe",
  nameZh: "简·多伊",
  notes: "Updated test person",
};

/**
 * Helper function to make authenticated requests
 */
const makeRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    ...(data && { data }),
  };

  try {
    const response = await axios(config);
    console.log(`✅ ${method.toUpperCase()} ${endpoint}:`, response.status);
    return response.data;
  } catch (error) {
    console.error(
      `❌ ${method.toUpperCase()} ${endpoint}:`,
      error.response?.status,
      error.response?.data?.error || error.message
    );
    return null;
  }
};

/**
 * Test all person endpoints
 */
const runTests = async () => {
  console.log("🧪 Starting Person API tests...\n");

  // Note: These tests will fail without authentication
  // In a real scenario, you'd need to authenticate first

  console.log("📋 Testing GET /persons (should fail without auth)");
  await makeRequest("GET", "/persons");

  console.log("\n🔍 Testing GET /persons/search (should fail without auth)");
  await makeRequest("GET", "/persons/search?query=John");

  console.log("\n➕ Testing POST /persons (should fail without auth)");
  await makeRequest("POST", "/persons", testPerson);

  console.log("\n📝 Testing PUT /persons/1 (should fail without auth)");
  await makeRequest("PUT", "/persons/1", testPersonUpdate);

  console.log("\n🗑️ Testing DELETE /persons/1 (should fail without auth)");
  await makeRequest("DELETE", "/persons/1");

  console.log("\n✅ All tests completed!");
  console.log("Note: Tests will fail without authentication token.");
  console.log("To test with auth, you need to:");
  console.log("1. Start the backend server");
  console.log("2. Authenticate via Google OAuth");
  console.log("3. Use the JWT token in requests");
};

// Run tests
runTests().catch(console.error);
