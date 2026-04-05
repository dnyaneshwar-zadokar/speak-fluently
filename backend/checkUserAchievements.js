import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Achievement from './models/Achievement.js';
import { checkAndUnlockAchievements } from './services/achievementService.js';

dotenv.config();

async function checkUserAchievements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database\n');

    // Find users with completed levels
    const users = await User.find({ 
      'completedLevels.11': { $exists: true } // Users who have completed at least 12 levels (0-indexed)
    }).select('username completedLevels totalPoints achievements sessionCount streak');
    
    console.log('=== USERS WITH 12+ COMPLETED LEVELS ===\n');
    
    for (const user of users) {
      console.log(`User: ${user.username}`);
      console.log(`  Completed Levels: ${user.completedLevels?.length || 0}`);
      console.log(`  Current Points: ${user.totalPoints || 0}`);
      console.log(`  Current Achievements: ${user.achievements?.length || 0}`);
      console.log(`  Session Count: ${user.sessionCount || 0}`);
      console.log(`  Current Streak: ${user.streak || 0}`);
      
      // Check what achievements they should have
      const allAchievements = await Achievement.find();
      const unlockedAchievementNames = user.achievements?.map(a => 
        allAchievements.find(ach => ach._id.toString() === a.achievementId?.toString())?.name
      ).filter(Boolean) || [];
      
      console.log(`  Unlocked Achievements: ${unlockedAchievementNames.join(', ') || 'None'}`);
      
      // Check what achievements they should qualify for
      const qualifiedAchievements = [];
      
      // Level-based achievements
      if (user.completedLevels && user.completedLevels.length >= 1) {
        qualifiedAchievements.push('Level 1 Master');
      }
      if (user.completedLevels && user.completedLevels.length >= 5) {
        qualifiedAchievements.push('Conversation Starter');
      }
      if (user.completedLevels && user.completedLevels.length >= 10) {
        qualifiedAchievements.push('Sentence Builder');
      }
      if (user.completedLevels && user.completedLevels.length >= 15) {
        qualifiedAchievements.push('Fluency Champion');
      }
      if (user.completedLevels && user.completedLevels.length >= 25) {
        qualifiedAchievements.push('Communication Master');
      }
      
      // Points-based achievements
      if (user.totalPoints >= 100) {
        qualifiedAchievements.push('Century Club');
      }
      
      // Session-based achievements
      if (user.sessionCount >= 50) {
        qualifiedAchievements.push('Master Speaker');
      }
      
      // Streak-based achievements
      if (user.streak >= 7) {
        qualifiedAchievements.push('Week Warrior');
      }
      if (user.streak >= 30) {
        qualifiedAchievements.push('Consistency King');
      }
      
      const missingAchievements = qualifiedAchievements.filter(ach => !unlockedAchievementNames.includes(ach));
      
      console.log(`  Qualified for: ${qualifiedAchievements.join(', ') || 'None'}`);
      console.log(`  Missing: ${missingAchievements.join(', ') || 'None'}`);
      
      if (missingAchievements.length > 0) {
        console.log(`  🎯 RETROACTIVE ACHIEVEMENT UNLOCK FOR ${user.username}:`);
        for (const achievementName of missingAchievements) {
          const achievement = allAchievements.find(a => a.name === achievementName);
          if (achievement) {
            // Add achievement to user
            user.achievements.push({
              achievementId: achievement._id,
              unlockedAt: new Date()
            });
            
            // Add points
            user.totalPoints = (user.totalPoints || 0) + achievement.points;
            
            console.log(`    ✅ Unlocked: ${achievement.name} (+${achievement.points} points)`);
          }
        }
        
        await user.save();
        console.log(`    🔄 Updated user ${user.username} with ${missingAchievements.length} new achievements`);
      }
      
      console.log('---');
    }
    
    await mongoose.connection.close();
    console.log('\nCheck complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserAchievements();