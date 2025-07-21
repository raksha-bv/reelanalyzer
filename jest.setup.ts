// Optional: Configure testing utilities here
// jest.setup.js
import "whatwg-fetch";

// Mock environment variables for testing
process.env.MONGODB_URI =
  "mongodb+srv://rakshabvwork:lKbKnIm3mzGaU4kd@cluster0.affyx.mongodb.net/reel-analyser-db?retryWrites=true&w=majority&appName=Cluster0";
process.env.RAPIDAPI_KEY = "9a14110aadmsh09918daf154b227p11d39bjsnd7123c711826";
process.env.APIFY_API_TOKEN = "apify_api_GMcwBD4deq5O4tHQwR1aQdhNPZLL2e2mZqYc";
