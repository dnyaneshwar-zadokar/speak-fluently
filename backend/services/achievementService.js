import Achievement from '../models/Achievement.js';
import User from '../models/User.js';

// Check and unlock achievements based on user progress
export const checkAndUnlockAchievements = async (userId, eventType, eventData = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const unlockedAchievements = [];
    
    // Get all achievements
    const allAchievements = await Achievement.find();
    
    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      const alreadyUnlocked = user.achievements.some(item => 
        item.achievementId && item.achievementId.toString() === achievement._id.toString()
      );
      
      if (alreadyUnlocked) continue;
      
      let shouldUnlock = false;
      
      // Check achievement criteria based on type
      switch (achievement.name) {
        case 'First Steps':
          // Unlock on first practice session or level completion
          shouldUnlock = eventType === 'level_completed' || eventType === 'practice_session';
          break;
          
        case 'Level 1 Master':
          // Unlock when completing first level
          shouldUnlock = eventType === 'level_completed' && eventData.levelId === 1;
          break;
          
        case 'Conversation Starter':
          // Unlock when completing 5 levels
          shouldUnlock = eventType === 'level_completed' && 
                        user.completedLevels && user.completedLevels.length >= 5;
          break;
          
        case 'Sentence Builder':
          // Unlock when completing 10 levels
          shouldUnlock = eventType === 'level_completed' && 
                        user.completedLevels && user.completedLevels.length >= 10;
          break;
          
        case 'Fluency Champion':
          // Unlock when completing 15 levels
          shouldUnlock = eventType === 'level_completed' && 
                        user.completedLevels && user.completedLevels.length >= 15;
          break;
          
        case 'Communication Master':
          // Unlock when completing all 25 levels
          shouldUnlock = eventType === 'level_completed' && 
                        user.completedLevels && user.completedLevels.length >= 25;
          break;
          
        case 'Perfect Score':
          // Unlock when getting 95+ score
          shouldUnlock = eventType === 'level_completed' && eventData.score >= 95;
          break;
          
        case 'Master Speaker':
          // Unlock when completing 50 practice sessions
          shouldUnlock = (eventType === 'level_completed' || eventType === 'practice_session') && 
                        (user.sessionCount || 0) >= 50;
          break;
          
        case 'Quick Learner':
          // Unlock when completing 10 micro-lessons (placeholder for now)
          shouldUnlock = eventType === 'micro_lesson_completed' && eventData.count >= 10;
          break;
          
        case 'Century Club':
          // Unlock when earning 100 points
          shouldUnlock = user.totalPoints >= 100;
          break;
          
        case 'Week Warrior':
          // Unlock when maintaining 7-day streak
          shouldUnlock = user.streak >= 7;
          break;
          
        case 'Consistency King':
          // Unlock when maintaining 30-day streak
          shouldUnlock = user.streak >= 30;
          break;
      }
      
      if (shouldUnlock) {
        // Unlock the achievement
        user.achievements.push({
          achievementId: achievement._id,
          unlockedAt: new Date()
        });
        
        // Add points
        user.totalPoints = (user.totalPoints || 0) + achievement.points;
        
        unlockedAchievements.push({
          ...achievement.toObject(),
          pointsAwarded: achievement.points
        });
        
        console.log(`🎉 Achievement unlocked for user ${user.username}: ${achievement.name}`);
      }
    }
    
    if (unlockedAchievements.length > 0) {
      await user.save();
    }
    
    return unlockedAchievements;
    
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Initialize achievements in database
export const initializeAchievements = async () => {
  try {
    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('🗑️ Cleared existing achievements');
    
    // Insert default achievements
    const defaultAchievements = [
      // Basic Achievements
      { 
        name: 'First Steps', 
        description: 'Complete your first practice session', 
        icon: '🎯', 
        points: 10, 
        category: 'milestone' 
      },
      { 
        name: 'Week Warrior', 
        description: 'Practice 7 days in a row', 
        icon: '🔥', 
        points: 50, 
        category: 'streak' 
      },
      { 
        name: 'Perfect Score', 
        description: 'Get a score of 95 or higher', 
        icon: '⭐', 
        points: 30, 
        category: 'mastery' 
      },
      { 
        name: 'Social Butterfly', 
        description: 'Chat with 5 different peers', 
        icon: '💬', 
        points: 20, 
        category: 'social' 
      },
      { 
        name: 'Century Club', 
        description: 'Earn 100 total points', 
        icon: '💯', 
        points: 25, 
        category: 'milestone' 
      },
      
      // AI Communication Mentor Achievements
      { 
        name: 'Level 1 Master', 
        description: 'Complete your first AI Communication level', 
        icon: '⭐', 
        points: 20, 
        category: 'milestone' 
      },
      { 
        name: 'Conversation Starter', 
        description: 'Complete 5 AI Communication levels', 
        icon: '🗣️', 
        points: 50, 
        category: 'milestone' 
      },
      { 
        name: 'Sentence Builder', 
        description: 'Complete 10 AI Communication levels', 
        icon: '🔤', 
        points: 75, 
        category: 'mastery' 
      },
      { 
        name: 'Fluency Champion', 
        description: 'Complete 15 AI Communication levels', 
        icon: '🎤', 
        points: 100, 
        category: 'mastery' 
      },
      { 
        name: 'Communication Master', 
        description: 'Complete all 25 AI Communication levels', 
        icon: '🏆', 
        points: 200, 
        category: 'mastery' 
      },
      
      // Practice Achievements
      { 
        name: 'Master Speaker', 
        description: 'Complete 50 practice sessions', 
        icon: '🏆', 
        points: 100, 
        category: 'mastery' 
      },
      { 
        name: 'Quick Learner', 
        description: 'Complete 10 micro-lessons', 
        icon: '🚀', 
        points: 40, 
        category: 'milestone' 
      },
      { 
        name: 'Consistency King', 
        description: 'Maintain a 30-day practice streak', 
        icon: '👑', 
        points: 150, 
        category: 'streak' 
      },
      { 
        name: 'Top Performer', 
        description: 'Reach the top 5 on the leaderboard', 
        icon: '🏅', 
        points: 75, 
        category: 'mastery' 
      }
    ];
    
    await Achievement.insertMany(defaultAchievements);
    console.log('✅ Achievements initialized successfully');
    
    // Show what was inserted
    const achievements = await Achievement.find();
    console.log('\n📋 Initialized achievements:');
    achievements.forEach(achievement => {
      console.log(`  ${achievement.icon} ${achievement.name} (${achievement.points} pts)`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing achievements:', error);
  }
};