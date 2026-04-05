import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initializeAchievements } from './services/achievementService.js';

dotenv.config();

async function initAchievements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    await initializeAchievements();
    
    mongoose.connection.close();
    console.log('Achievements initialized successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initAchievements();