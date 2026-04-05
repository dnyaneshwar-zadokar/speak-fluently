import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import { levels, getLevelById, isLevelUnlocked, getNextLevel, getUserCurrentLevel, getCompletedLevelsCount, getProgressPercentage } from '../data/levels.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

const router = express.Router();

// Helper function to check if user answer matches expected answer
const checkAnswer = (userAnswer, expectedAnswer) => {
  // Simple answer checking - can be enhanced with fuzzy matching
  const userAnswerClean = userAnswer.trim().toLowerCase();
  const expectedAnswerClean = expectedAnswer.trim().toLowerCase();
  
  // For free response questions (marked with special identifiers)
  if (expectedAnswer === 'free_response' || expectedAnswer === 'conversation' || 
      expectedAnswer === 'story' || expectedAnswer === 'roleplay' ||
      expectedAnswer === 'complex_sentences' || expectedAnswer === 'confident_speech' ||
      expectedAnswer === 'professional_communication' || expectedAnswer === 'interview_response' ||
      expectedAnswer === 'code_switching' || expectedAnswer === 'extended_speech' ||
      expectedAnswer === 'random_topic_speech') {
    // For free responses, require minimum length and non-empty response
    return userAnswerClean.length > 3 && userAnswerClean !== '' && userAnswerClean !== ' ';
  }
  
  // For specific expected answers, check exact match
  return userAnswerClean === expectedAnswerClean;
};

// Get all levels with user progress
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Enrich levels with user progress data
    const levelsWithProgress = levels.map(level => {
      const isCompleted = user.completedLevels?.some(completed => completed.levelId === level.id);
      const isUnlocked = isLevelUnlocked(user, level.id);
      const userProgress = user.completedLevels?.find(completed => completed.levelId === level.id);
      
      return {
        ...level,
        completed: isCompleted,
        unlocked: isUnlocked,
        userScore: userProgress?.score || 0,
        completedAt: userProgress?.completedAt || null,
        appreciationMessage: userProgress?.appreciationMessage || null,
        badgeEarned: userProgress?.badgeEarned || null
      };
    });

    res.json({
      levels: levelsWithProgress,
      currentLevel: getUserCurrentLevel(user),
      completedLevels: getCompletedLevelsCount(user),
      totalLevels: levels.length,
      progressPercentage: getProgressPercentage(user),
      xp: user.xp || 0,
      level: user.level || 1
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ message: 'Failed to fetch levels', error: error.message });
  }
});

// Get specific level details
router.get('/:levelId', authMiddleware, async (req, res) => {
  try {
    const { levelId } = req.params;
    const level = getLevelById(parseInt(levelId));
    
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isUnlocked = isLevelUnlocked(user, parseInt(levelId));
    const isCompleted = user.completedLevels?.some(completed => completed.levelId === parseInt(levelId));
    const userProgress = user.completedLevels?.find(completed => completed.levelId === parseInt(levelId));

    res.json({
      ...level,
      completed: isCompleted,
      unlocked: isUnlocked,
      userScore: userProgress?.score || 0,
      completedAt: userProgress?.completedAt || null
    });
  } catch (error) {
    console.error('Error fetching level details:', error);
    res.status(500).json({ message: 'Failed to fetch level details', error: error.message });
  }
});

// Start a level (initialize progress)
router.post('/:levelId/start', authMiddleware, async (req, res) => {
  try {
    const { levelId } = req.params;
    const level = getLevelById(parseInt(levelId));
    
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if level is unlocked
    if (!isLevelUnlocked(user, parseInt(levelId))) {
      return res.status(403).json({ message: 'Level is locked. Complete previous level first.' });
    }

    // Check if already completed
    const isCompleted = user.completedLevels?.some(completed => completed.levelId === parseInt(levelId));
    if (isCompleted) {
      return res.status(400).json({ message: 'Level already completed' });
    }

    // Update user's current level
    user.currentLevel = parseInt(levelId);
    user.levelProgress = 0;
    await user.save();

    res.json({
      message: `Started Level ${levelId}: ${level.title}`,
      level: {
        id: level.id,
        title: level.title,
        description: level.description,
        questions: level.questions,
        estimatedTime: level.estimatedTime
      },
      currentLevel: user.currentLevel,
      levelProgress: user.levelProgress
    });
  } catch (error) {
    console.error('Error starting level:', error);
    res.status(500).json({ message: 'Failed to start level', error: error.message });
  }
});

// Submit level completion
router.post('/:levelId/complete', authMiddleware, async (req, res) => {
  try {
    const { levelId } = req.params;
    const { answers, timeTaken, score } = req.body;
    
    const level = getLevelById(parseInt(levelId));
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify user can complete this level
    if (!isLevelUnlocked(user, parseInt(levelId))) {
      return res.status(403).json({ message: 'Level is locked' });
    }

    // Check if already completed
    const isAlreadyCompleted = user.completedLevels?.some(completed => completed.levelId === parseInt(levelId));
    if (isAlreadyCompleted) {
      return res.status(400).json({ message: 'Level already completed' });
    }

    // Validate answers (basic validation)
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    // Validate answer count matches question count
    if (answers.length !== level.questions.length) {
      return res.status(400).json({ 
        message: `Expected ${level.questions.length} answers, but received ${answers.length}` 
      });
    }

    // Detailed answer validation and mistake tracking
    const validationResults = [];
    let correctAnswers = 0;
    
    for (let i = 0; i < level.questions.length; i++) {
      const question = level.questions[i];
      const userAnswer = answers[i]?.answer || '';
      const expectedAnswer = question.expected;
      
      // Check if answer is correct
      const isCorrect = checkAnswer(userAnswer, expectedAnswer);
      
      validationResults.push({
        questionIndex: i,
        question: question.prompt,
        userAnswer: userAnswer,
        expectedAnswer: expectedAnswer,
        isCorrect: isCorrect,
        feedback: isCorrect ? '✅ Correct!' : `❌ Incorrect. Expected: "${expectedAnswer}"`
      });
      
      if (isCorrect) {
        correctAnswers++;
      }
    }

    // Calculate precise score
    const calculatedScore = Math.round((correctAnswers / level.questions.length) * 100);
    
    // Require 100% accuracy for level completion
    const minimumScore = 100; // Changed from 70/90 to require perfect score
    
    if (calculatedScore < minimumScore) {
      // Level not completed - provide detailed feedback
      return res.status(200).json({
        message: `Level not completed. You scored ${calculatedScore}%. Minimum required: ${minimumScore}%.`,
        levelCompleted: false,
        score: calculatedScore,
        minimumScore: minimumScore,
        validationResults: validationResults,
        mistakes: validationResults.filter(result => !result.isCorrect),
        encouragement: "💪 Don't give up! Review the correct answers and try again."
      });
    }

    // Level completed successfully - only proceed if 100% score
    // Determine appreciation message for perfect performance
    const appreciationMessage = level.appreciation[0] || "🎉 Perfect! You mastered this level!";
    
    // Add completed level to user
    user.completedLevels = user.completedLevels || [];
    user.completedLevels.push({
      levelId: parseInt(levelId),
      completedAt: new Date(),
      score: calculatedScore,
      appreciationMessage: appreciationMessage,
      badgeEarned: level.badge
    });

    // Update current level to next level if exists
    const nextLevel = getNextLevel(parseInt(levelId));
    if (nextLevel) {
      user.currentLevel = nextLevel.id;
    } else {
      // User completed all levels
      user.currentLevel = parseInt(levelId);
    }

    // Reset level progress
    user.levelProgress = 0;

    // Award XP
    user.xp = (user.xp || 0) + level.xpReward;
    
    // Update level based on XP (1000 XP per level)
    const newLevel = Math.floor(user.xp / 1000) + 1;
    if (newLevel > (user.level || 1)) {
      user.level = newLevel;
    }
    
    // Update user statistics for time tracking and streaks
    const sessionDuration = level.questions.length * 30; // Estimate 30 seconds per question
    
    // Update total minutes
    user.totalMinutes = (user.totalMinutes || 0) + Math.floor(sessionDuration / 60);
    
    // Update session count
    user.sessionCount = (user.sessionCount || 0) + 1;
    
    // Update last active date for streak tracking
    user.lastActiveDate = new Date();
    
    // Update streak logic
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      const today = new Date();
      lastActive.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        // Consecutive day or same day
        user.streak = (user.streak || 0) + (diffDays === 1 ? 1 : 0);
      } else {
        // Break in streak
        user.streak = 1; // Reset to 1 (today)
      }
    } else {
      // First time user is active
      user.streak = 1;
    }
    
    // Update max streak
    if (user.streak > (user.maxStreak || 0)) {
      user.maxStreak = user.streak;
    }

    await user.save();

    // Check for achievements
    const unlockedAchievements = await checkAndUnlockAchievements(req.userId, 'level_completed', {
      levelId: parseInt(levelId),
      score: calculatedScore
    });

    // Prepare response
    const response = {
      message: `Level ${levelId} completed successfully!`,
      levelId: parseInt(levelId),
      title: level.title,
      score: calculatedScore,
      xpEarned: level.xpReward,
      appreciationMessage: appreciationMessage,
      badgeEarned: level.badge,
      nextLevelAvailable: !!nextLevel,
      unlockedAchievements: unlockedAchievements,
      userStats: {
        xp: user.xp,
        level: user.level,
        completedLevels: user.completedLevels.length,
        progressPercentage: getProgressPercentage(user),
        totalPoints: user.totalPoints
      }
    };

    // Add next level info if available
    if (nextLevel) {
      response.nextLevel = {
        id: nextLevel.id,
        title: nextLevel.title,
        description: nextLevel.description,
        unlockCondition: nextLevel.unlockCondition
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error completing level:', error);
    res.status(500).json({ message: 'Failed to complete level', error: error.message });
  }
});

// Get user level progress
router.get('/progress/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      currentLevel: getUserCurrentLevel(user),
      completedLevels: getCompletedLevelsCount(user),
      totalLevels: levels.length,
      progressPercentage: getProgressPercentage(user),
      levelProgress: user.levelProgress || 0,
      xp: user.xp || 0,
      level: user.level || 1,
      completedLevelsDetails: user.completedLevels || []
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ message: 'Failed to fetch user progress', error: error.message });
  }
});

// Reset level progress (for testing/admin)
router.post('/:levelId/reset', authMiddleware, async (req, res) => {
  try {
    const { levelId } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove level from completed levels
    user.completedLevels = user.completedLevels?.filter(completed => completed.levelId !== parseInt(levelId)) || [];
    
    // If this was the current level, reset to previous completed level + 1
    if (user.currentLevel === parseInt(levelId)) {
      const highestCompleted = user.completedLevels.reduce((max, completed) => 
        completed.levelId > max ? completed.levelId : max, 0
      );
      user.currentLevel = highestCompleted + 1;
    }

    await user.save();

    res.json({
      message: `Level ${levelId} progress reset successfully`,
      currentLevel: user.currentLevel,
      completedLevels: user.completedLevels.length
    });
  } catch (error) {
    console.error('Error resetting level:', error);
    res.status(500).json({ message: 'Failed to reset level', error: error.message });
  }
});

// Get level statistics
router.get('/stats/:levelId', authMiddleware, async (req, res) => {
  try {
    const { levelId } = req.params;
    const level = getLevelById(parseInt(levelId));
    
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Get statistics for this level across all users
    const users = await User.find({ 
      'completedLevels.levelId': parseInt(levelId) 
    }).select('completedLevels.levelId completedLevels.score completedLevels.completedAt');

    const levelCompletions = users.flatMap(user => 
      user.completedLevels.filter(completed => completed.levelId === parseInt(levelId))
    );

    const stats = {
      levelId: parseInt(levelId),
      title: level.title,
      totalCompletions: levelCompletions.length,
      averageScore: levelCompletions.length > 0 
        ? Math.round(levelCompletions.reduce((sum, completion) => sum + completion.score, 0) / levelCompletions.length)
        : 0,
      highestScore: levelCompletions.length > 0
        ? Math.max(...levelCompletions.map(completion => completion.score))
        : 0,
      recentCompletions: levelCompletions
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 10)
        .map(completion => ({
          score: completion.score,
          completedAt: completion.completedAt
        }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching level stats:', error);
    res.status(500).json({ message: 'Failed to fetch level stats', error: error.message });
  }
});

export default router;