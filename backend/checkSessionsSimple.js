import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

async function checkSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const sessions = await PracticeSession.find();
    console.log('Total practice sessions in database:', sessions.length);
    
    if (sessions.length > 0) {
      console.log('\nSession details:');
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. User: ${session.userId}, Duration: ${session.duration} seconds (${Math.floor(session.duration/60)} minutes), Date: ${session.date}`);
      });
    } else {
      console.log('No practice sessions found in database');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSessions();