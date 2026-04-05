import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getOverallProgressLeaderboard } from './services/learningLeaderboardService.js';

dotenv.config();

async function testLearningLeaderboard() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    console.log('\n=== Testing Learning Leaderboard ===');
    
    // Test overall progress leaderboard
    const leaderboard = await getOverallProgressLeaderboard(5);
    console.log('\nTop 5 Overall Progress:');
    leaderboard.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.totalLearningScore} points`);
      console.log(`   Lessons: ${user.completedLevels}, Achievements: ${user.achievementsCount}, Streak: ${user.currentStreak}`);
    });
    
    await mongoose.connection.close();
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLearningLeaderboard();