import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_BASE_URL = 'http://localhost:5002/api';

// Test the levels API
const testLevelsAPI = async () => {
  try {
    console.log('=== Testing AI Communication Mentor API ===\n');
    
    // Test 1: Get all levels (this will fail without authentication)
    console.log('1. Testing GET /levels (without auth)...');
    try {
      await axios.get(`${API_BASE_URL}/levels`);
      console.log('   ❌ Should have failed - no authentication provided');
    } catch (error) {
      console.log('   ✅ Correctly rejected - authentication required');
    }
    
    // Test 2: Health check
    console.log('\n2. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/../health`);
    console.log('   ✅ Health check successful:', healthResponse.data);
    
    // Test 3: Test user login to get token
    console.log('\n3. Testing user authentication...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      const token = loginResponse.data.token;
      console.log('   ✅ Login successful, token received');
      
      // Test 4: Get levels with authentication
      console.log('\n4. Testing GET /levels (with auth)...');
      const levelsResponse = await axios.get(`${API_BASE_URL}/levels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('   ✅ Levels fetched successfully');
      console.log('   - Total levels:', levelsResponse.data.totalLevels);
      console.log('   - Current level:', levelsResponse.data.currentLevel);
      console.log('   - Completed levels:', levelsResponse.data.completedLevels);
      console.log('   - Progress percentage:', levelsResponse.data.progressPercentage);
      
      // Test 5: Get specific level
      console.log('\n5. Testing GET /levels/1...');
      const level1Response = await axios.get(`${API_BASE_URL}/levels/1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('   ✅ Level 1 details fetched');
      console.log('   - Title:', level1Response.data.title);
      console.log('   - Questions:', level1Response.data.questions.length);
      console.log('   - XP Reward:', level1Response.data.xpReward);
      
      // Test 6: Start a level
      console.log('\n6. Testing POST /levels/1/start...');
      const startResponse = await axios.post(`${API_BASE_URL}/levels/1/start`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('   ✅ Level 1 started successfully');
      console.log('   - Message:', startResponse.data.message);
      console.log('   - Current level:', startResponse.data.currentLevel);
      
      // Test 7: Complete a level with sample answers
      console.log('\n7. Testing POST /levels/1/complete...');
      const completeResponse = await axios.post(`${API_BASE_URL}/levels/1/complete`, {
        answers: [
          { answer: "Hi" },
          { answer: "Hello" },
          { answer: "Good morning" }
        ],
        score: 100
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('   ✅ Level 1 completed successfully');
      console.log('   - Message:', completeResponse.data.message);
      console.log('   - Score:', completeResponse.data.score);
      console.log('   - XP Earned:', completeResponse.data.xpEarned);
      console.log('   - Badge Earned:', completeResponse.data.badgeEarned);
      console.log('   - Appreciation:', completeResponse.data.appreciationMessage);
      
      // Test 8: Get updated progress
      console.log('\n8. Testing GET /levels/progress/user...');
      const progressResponse = await axios.get(`${API_BASE_URL}/levels/progress/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('   ✅ User progress fetched');
      console.log('   - Current level:', progressResponse.data.currentLevel);
      console.log('   - Completed levels:', progressResponse.data.completedLevels);
      console.log('   - Progress percentage:', progressResponse.data.progressPercentage);
      
    } catch (error) {
      if (error.response) {
        console.log('   ❌ API Error:', error.response.status, error.response.data);
      } else {
        console.log('   ❌ Network Error:', error.message);
      }
    }
    
    console.log('\n=== API Testing Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testLevelsAPI();