import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const email = "dnyaneshwarzadokar@gmail.com";
const password = "Dnyaneshwar@123";
const username = "dnyaneshwar"; 

async function setupAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in .env!");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to New MongoDB...");

    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.password = hashedPassword;
      user.isAdmin = true;
      await user.save();
      console.log("Existing user updated and made Admin successfully!");
    } else {
      user = new User({
        username,
        email,
        password: hashedPassword,
        isAdmin: true,
        level: 1,
        totalPoints: 0
      });
      await user.save();
      console.log("New Admin account created successfully in the new database!");
    }
  } catch(e) {
    console.error("Error setting up admin:", e);
  } finally {
    mongoose.connection.close();
  }
}

setupAdmin();
