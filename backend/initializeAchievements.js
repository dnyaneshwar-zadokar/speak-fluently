import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Achievement from './models/Achievement.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Default achievements
const defaultAchievements = [
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

async function initializeAchievements() {
  try {
    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('🗑️ Cleared existing achievements');
    
    // Insert default achievements
    await Achievement.insertMany(defaultAchievements);
    console.log('✅ Achievements initialized successfully');
    
    // Show what was inserted
    const achievements = await Achievement.find();
    console.log('\n📋 Initialized achievements:');
    achievements.forEach(achievement => {
      console.log(`  ${achievement.icon} ${achievement.name} (${achievement.points} pts)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing achievements:', error);
    process.exit(1);
  }
}

initializeAchievements();