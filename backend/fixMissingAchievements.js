import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Achievement from './models/Achievement.js';

dotenv.config();

async function fixMissingAchievements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Get all achievements
    const allAchievements = await Achievement.find();
    console.log(`Found ${allAchievements.length} achievements in database`);
    
    // Find users with completed levels
    const users = await User.find({ 
      completedLevels: { $exists: true, $not: { $size: 0 } }
    }).select('username completedLevels totalPoints achievements sessionCount streak');
    
    console.log(`\nFound ${users.length} users with completed levels`);
    
    for (const user of users) {
      const completedCount = user.completedLevels?.length || 0;
      if (completedCount >= 12) {
        console.log(`\n=== Checking user: ${user.username} ===`);
        console.log(`Completed levels: ${completedCount}`);
        console.log(`Current achievements: ${user.achievements?.length || 0}`);
        
        // Check what achievements user should have
        const shouldHave = [];
        
        if (completedCount >= 1) shouldHave.push('Level 1 Master');
        if (completedCount >= 5) shouldHave.push('Conversation Starter');
        if (completedCount >= 10) shouldHave.push('Sentence Builder');
        if (completedCount >= 15) shouldHave.push('Fluency Champion');
        if (completedCount >= 25) shouldHave.push('Communication Master');
        
        console.log(`Should have achievements: ${shouldHave.join(', ')}`);
        
        // Check what they actually have
        const userAchievementIds = user.achievements?.map(a => a.achievementId?.toString()) || [];
        const userAchievementNames = userAchievementIds.map(id => {
          const ach = allAchievements.find(a => a._id.toString() === id);
          return ach ? ach.name : 'Unknown';
        });
        
        console.log(`Actually has: ${userAchievementNames.join(', ') || 'None'}`);
        
        // Find missing achievements
        const missing = shouldHave.filter(name => !userAchievementNames.includes(name));
        
        if (missing.length > 0) {
          console.log(`Missing achievements: ${missing.join(', ')}`);
          
          // Add missing achievements
          for (const achievementName of missing) {
            const achievement = allAchievements.find(a => a.name === achievementName);
            if (achievement) {
              user.achievements.push({
                achievementId: achievement._id,
                unlockedAt: new Date()
              });
              user.totalPoints = (user.totalPoints || 0) + achievement.points;
              console.log(`✅ Added: ${achievement.name} (+${achievement.points} points)`);
            }
          }
          
          await user.save();
          console.log(`💾 Saved updated achievements for ${user.username}`);
        } else {
          console.log('✅ All achievements up to date');
        }
      }
    }
    
    await mongoose.connection.close();
    console.log('\nFix complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixMissingAchievements();