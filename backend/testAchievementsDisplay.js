import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Achievement from './models/Achievement.js';

dotenv.config();

async function testAchievementsDisplay() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get the user "Tejas" 
    const user = await User.findOne({ username: 'Tejas' });
    if (!user) {
      console.log('User Tejas not found');
      return;
    }
    
    console.log('=== USER ACHIEVEMENT DATA ===');
    console.log(`Username: ${user.username}`);
    console.log(`Completed Levels: ${user.completedLevels?.length || 0}`);
    console.log(`Total Points: ${user.totalPoints || 0}`);
    console.log(`Achievements Count: ${user.achievements?.length || 0}`);
    
    // Get all achievements
    const allAchievements = await Achievement.find();
    console.log(`\nTotal Achievements in DB: ${allAchievements.length}`);
    
    // Show user's achievements
    if (user.achievements && user.achievements.length > 0) {
      console.log('\nUser\'s Achievements:');
      for (const userAchievement of user.achievements) {
        const achievement = allAchievements.find(a => 
          a._id.toString() === userAchievement.achievementId?.toString()
        );
        if (achievement) {
          console.log(`  ✅ ${achievement.name} - ${achievement.description} (${achievement.points} pts)`);
        } else {
          console.log(`  ❓ Unknown achievement ID: ${userAchievement.achievementId}`);
        }
      }
    } else {
      console.log('\nUser has no achievements recorded');
    }
    
    // Check what achievements user should qualify for
    console.log('\n=== QUALIFYING ACHIEVEMENTS ===');
    const qualifying = [];
    
    if (user.completedLevels?.length >= 1) qualifying.push('Level 1 Master');
    if (user.completedLevels?.length >= 5) qualifying.push('Conversation Starter');
    if (user.completedLevels?.length >= 10) qualifying.push('Sentence Builder');
    if (user.completedLevels?.length >= 15) qualifying.push('Fluency Champion');
    if (user.completedLevels?.length >= 25) qualifying.push('Communication Master');
    if (user.totalPoints >= 100) qualifying.push('Century Club');
    
    console.log(`Should qualify for: ${qualifying.join(', ')}`);
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAchievementsDisplay();