import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String
  }
});

const microLessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Pronunciation', 'Fluency', 'Grammar', 'Vocabulary', 'Confidence', 'Interview', 'Presentation', 'Business', 'General']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 1,
    max: 15
  },
  keyPoints: [{
    type: String
  }],
  practiceExercise: {
    type: String
  },
  quizQuestions: [quizQuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Add indexes for better query performance
microLessonSchema.index({ category: 1 });
microLessonSchema.index({ difficulty: 1 });

export default mongoose.model('MicroLesson', microLessonSchema);