import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const testUserAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    const user = await User.findOne({username: 'testuser'});
    console.log('User found:', !!user);
    
    if (user) {
      const isValid = await bcrypt.compare('testpassword123', user.password);
      console.log('Password valid:', isValid);
      
      // Test login via API
      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      });
      
      const data = await response.json();
      console.log('Login response:', response.status, data);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

testUserAuth();