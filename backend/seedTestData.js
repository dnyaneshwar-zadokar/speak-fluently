import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import PracticeSession from './models/PracticeSession.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to database');
    
    // Create test users if none exist
    const userCount = await User.countDocuments();
    let user1, user2, user3;
    
    if (userCount === 0) {
      console.log('Creating test users...');
      
      user1 = new User({
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
        totalPoints: 500,
        level: 5,
        isAdmin: true
      });
      
      user2 = new User({
        username: 'bob',
        email: 'bob@example.com',
        password: 'password123',
        totalPoints: 300,
        level: 3
      });
      
      user3 = new User({
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'password123',
        totalPoints: 750,
        level: 8
      });
      
      await Promise.all([user1.save(), user2.save(), user3.save()]);
      console.log('Test users created');
    } else {
      console.log('Users already exist, fetching them...');
      const users = await User.find().limit(3);
      user1 = users[0];
      user2 = users[1];
      user3 = users[2];
    }
    
    // Create test practice sessions if none exist
    const sessionCount = await PracticeSession.countDocuments();
    
    if (sessionCount === 0) {
      console.log('Creating test practice sessions...');
      
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      // Create sessions for the current week
      const sessions = [];
      
      // Alice's sessions
      sessions.push(new PracticeSession({
        userId: user1._id,
        transcript: 'This is a sample transcript for Alice.',
        duration: 300, // 5 minutes
        score: 85,
        feedback: 'Good job!',
        metrics: { clarity: 80, pace: 75, vocabulary: 90, confidence: 85, fillerWords: 2 },
        date: new Date(now.getTime() - oneDay) // Yesterday
      }));
      
      sessions.push(new PracticeSession({
        userId: user1._id,
        transcript: 'Another practice session for Alice.',
        duration: 600, // 10 minutes
        score: 92,
        feedback: 'Excellent!',
        metrics: { clarity: 90, pace: 85, vocabulary: 95, confidence: 90, fillerWords: 1 },
        date: new Date(now.getTime() - 2 * oneDay) // 2 days ago
      }));
      
      // Bob's sessions
      sessions.push(new PracticeSession({
        userId: user2._id,
        transcript: 'Bob is practicing his speech.',
        duration: 420, // 7 minutes
        score: 78,
        feedback: 'Nice effort!',
        metrics: { clarity: 75, pace: 70, vocabulary: 80, confidence: 75, fillerWords: 3 },
        date: new Date(now.getTime() - oneDay) // Yesterday
      }));
      
      // Charlie's sessions
      sessions.push(new PracticeSession({
        userId: user3._id,
        transcript: 'Charlie is doing great in his practice.',
        duration: 900, // 15 minutes
        score: 95,
        feedback: 'Outstanding performance!',
        metrics: { clarity: 95, pace: 90, vocabulary: 98, confidence: 95, fillerWords: 0 },
        date: new Date() // Today
      }));
      
      await Promise.all(sessions.map(session => session.save()));
      console.log('Test practice sessions created');
    } else {
      console.log('Practice sessions already exist');
    }
    
    console.log('Test data setup complete');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });