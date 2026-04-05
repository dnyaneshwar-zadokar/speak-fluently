import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check each collection
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(collection.name + ': ' + count + ' documents');
      
      if (count > 0 && collection.name !== 'users') {
        const sample = await mongoose.connection.db.collection(collection.name).findOne();
        console.log('Sample document from ' + collection.name + ':');
        console.log(JSON.stringify(sample, null, 2));
        console.log('---');
      }
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCollections();