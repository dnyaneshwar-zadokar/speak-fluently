import mongoose from 'mongoose';

const practiceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transcript: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String
  },
  metrics: {
    clarity: Number,
    pace: Number,
    vocabulary: Number,
    confidence: Number,
    fillerWords: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
practiceSessionSchema.index({ userId: 1, date: -1 });

export default mongoose.model('PracticeSession', practiceSessionSchema);