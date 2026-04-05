import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import MicroLesson from '../models/MicroLesson.js';
import User from '../models/User.js';

const router = express.Router();

// Get all micro-learning lessons
router.get('/', authMiddleware, async (req, res) => {
  try {
    const lessons = await MicroLesson.find({ isActive: true })
      .select('_id title description difficulty estimatedTime category')
      .sort({ createdAt: -1 });
    
    // Get user's completed lessons
    const user = await User.findById(req.userId);
    const completedLessonIds = user.completedMicroLessons.map(item => item.lessonId.toString());
    
    // Add completion status to each lesson
    const lessonsWithStatus = lessons.map(lesson => ({
      ...lesson.toObject(),
      completed: completedLessonIds.includes(lesson._id.toString())
    }));
    
    res.json({ lessons: lessonsWithStatus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lessons', error: error.message });
  }
});

// Get specific lesson by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lesson = await MicroLesson.findById(req.params.id);
    if (!lesson || !lesson.isActive) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json({ lesson });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lesson', error: error.message });
  }
});

// Mark lesson as completed
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const lesson = await MicroLesson.findById(req.params.id);
    if (!lesson || !lesson.isActive) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Add lesson to user's completed lessons and award XP
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $addToSet: {
          completedMicroLessons: {
            lessonId: lesson._id
          }
        },
        $inc: { 
          totalPoints: 10, // Award 10 points for completing a lesson
          xp: 15, // Award 15 XP for completing a lesson
          totalMinutes: lesson.estimatedTime || 5, // Add estimated time for the lesson
          sessionCount: 1 // Increment session count
        }
      },
      { new: true }
    );
    
    // Calculate and update level based on XP
    const currentLevel = user.level;
    const newLevel = Math.floor(user.xp / 1000) + 1;
    let leveledUp = false;
    
    if (newLevel > currentLevel) {
      // User leveled up!
      await User.findByIdAndUpdate(req.userId, {
        level: newLevel
      });
      leveledUp = true;
    }
    
    res.json({ 
      message: 'Lesson marked as completed',
      totalPoints: user.totalPoints + 10,
      level: leveledUp ? newLevel : user.level,
      leveledUp: leveledUp
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete lesson', error: error.message });
  }
});

// Submit quiz answers
router.post('/:id/quiz', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected answer indices
    const lesson = await MicroLesson.findById(req.params.id);
    
    if (!lesson || !lesson.isActive) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }
    
    // Calculate score
    let correctAnswers = 0;
    const results = lesson.quizQuestions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        options: question.options,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });
    
    const score = Math.round((correctAnswers / lesson.quizQuestions.length) * 100);
    
    // Award bonus points for quiz completion
    let bonusPoints = 0;
    if (score >= 80) {
      bonusPoints = 5; // Extra points for high score
    } else if (score >= 60) {
      bonusPoints = 3;
    } else {
      bonusPoints = 1; // Encouragement points
    }
    
    // Update user points and XP if they scored well
    let updateQuery = { 
      $inc: { 
        totalPoints: bonusPoints,
        xp: Math.floor(bonusPoints * 2) // Award double XP for quiz performance
      } 
    };
    
    // If the user scored 100%, also mark the lesson as completed
    if (score === 100) {
      updateQuery.$addToSet = {
        completedMicroLessons: {
          lessonId: lesson._id
        }
      };
      
      // Also increment session count and time for completed lesson
      updateQuery.$inc.totalMinutes = lesson.estimatedTime || 5; // Add estimated time for the lesson
      updateQuery.$inc.sessionCount = 1; // Increment session count
    } else {
      // Still increment session count for attempting the quiz, but not time unless completed
      updateQuery.$inc.sessionCount = 1;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateQuery,
      { new: true }
    );
    
    // Calculate and update level based on XP
    const currentLevel = user.level;
    const newLevel = Math.floor(user.xp / 1000) + 1;
    let leveledUp = false;
    
    if (newLevel > currentLevel) {
      // User leveled up!
      await User.findByIdAndUpdate(req.userId, {
        level: newLevel
      });
      leveledUp = true;
    }
    
    res.json({ 
      score,
      results,
      bonusPoints,
      message: `You scored ${score}% on the quiz!`,
      totalPoints: user.totalPoints + bonusPoints,
      level: leveledUp ? newLevel : user.level,
      leveledUp: leveledUp
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
});

// Get lessons by category
router.get('/category/:category', authMiddleware, async (req, res) => {
  try {
    const lessons = await MicroLesson.find({ 
      category: req.params.category, 
      isActive: true 
    })
    .select('_id title description difficulty estimatedTime')
    .sort({ createdAt: -1 });
    
    // Get user's completed lessons
    const user = await User.findById(req.userId);
    const completedLessonIds = user.completedMicroLessons.map(item => item.lessonId.toString());
    
    // Add completion status to each lesson
    const lessonsWithStatus = lessons.map(lesson => ({
      ...lesson.toObject(),
      completed: completedLessonIds.includes(lesson._id.toString())
    }));
    
    res.json({ lessons: lessonsWithStatus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lessons', error: error.message });
  }
});

// Generate a new AI-powered micro lesson (admin only)
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { topic, category, difficulty } = req.body;
    
    if (!topic || !category || !difficulty) {
      return res.status(400).json({ message: 'Topic, category, and difficulty are required' });
    }
    
    // Generate content using AI service
    const aiContent = await aiService.getMicroLearningContent(topic);
    
    // Create new lesson
    const newLesson = new MicroLesson({
      title: aiContent.title || topic,
      description: aiContent.content || `Learn about ${topic}`,
      content: aiContent.content || `Detailed content about ${topic}`,
      category,
      difficulty,
      estimatedTime: 5, // Default time
      keyPoints: aiContent.keyPoints || [],
      practiceExercise: aiContent.practice || `Practice exercise for ${topic}`
    });
    
    await newLesson.save();
    
    res.status(201).json({ message: 'Lesson created successfully', lesson: newLesson });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate lesson', error: error.message });
  }
});

export default router;