// AI Communication Mentor - 25 Level System Data Structure

export const levels = [
  // Levels 1-10: Beginner - Learn words & phrases (Text)
  {
    id: 1,
    title: "Level 1: Greetings",
    description: "Learn essential greeting words like Hi, Hello, Good morning",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Teaching",
    learning: ["Hi", "Hello", "Good morning"],
    questions: [
      { prompt: "Type: Hi", expected: "Hi", type: "typing" },
      { prompt: "Type: Hello", expected: "Hello", type: "typing" },
      { prompt: "Type: Good morning", expected: "Good morning", type: "typing" }
    ],
    appreciation: [
      "🎉 Great job! You completed Level 1!",
      "👏 Keep it up! You are learning greetings."
    ],
    badge: "Beginner Badge (Level 1)",
    xpReward: 20,
    unlockCondition: "None (starter level)",
    estimatedTime: 5
  },
  {
    id: 2,
    title: "Level 2: Time-Based Greetings",
    description: "Learn greetings appropriate for different times of day",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Teaching",
    learning: ["Morning", "Afternoon", "Evening"],
    questions: [
      { prompt: "Type: Morning", expected: "Morning", type: "typing" },
      { prompt: "Type: Afternoon", expected: "Afternoon", type: "typing" },
      { prompt: "Type: Evening", expected: "Evening", type: "typing" }
    ],
    appreciation: [
      "🎉 Awesome! Level 2 completed!",
      "👏 You now know basic time words."
    ],
    badge: "Beginner Badge (Level 2)",
    xpReward: 25,
    unlockCondition: "Complete Level 1",
    estimatedTime: 5
  },
  {
    id: 3,
    title: "Level 3: Polite Words",
    description: "Learn essential polite expressions",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Teaching",
    learning: ["Please", "Sorry", "Thank you"],
    questions: [
      { prompt: "Type: Please", expected: "Please", type: "typing" },
      { prompt: "Type: Sorry", expected: "Sorry", type: "typing" },
      { prompt: "Type: Thank you", expected: "Thank you", type: "typing" }
    ],
    appreciation: [
      "🎉 Well done! Level 3 completed!",
      "👏 Polite words are important. Keep practicing."
    ],
    badge: "Beginner Badge (Level 3)",
    xpReward: 25,
    unlockCondition: "Complete Level 2",
    estimatedTime: 5
  },
  {
    id: 4,
    title: "Level 4: Feelings Vocabulary",
    description: "Express basic emotions and feelings",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Teaching",
    learning: ["Happy", "Sad", "Fine"],
    questions: [
      { prompt: "How are you? → Type: I am happy", expected: "I am happy", type: "typing" },
      { prompt: "How are you? → Type: I am sad", expected: "I am sad", type: "typing" },
      { prompt: "How are you? → Type: I am fine", expected: "I am fine", type: "typing" }
    ],
    appreciation: [
      "🎉 Great! You completed Level 4!",
      "👏 Feelings vocabulary mastered."
    ],
    badge: "Beginner Badge (Level 4)",
    xpReward: 30,
    unlockCondition: "Complete Level 3",
    estimatedTime: 7
  },
  {
    id: 5,
    title: "Level 5: Basic Responses",
    description: "Learn simple yes/no responses and acknowledgments",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Teaching",
    learning: ["Yes", "No", "Okay"],
    questions: [
      { prompt: "Do you like ice cream? → Type: Yes", expected: "Yes", type: "typing" },
      { prompt: "Do you want water? → Type: No", expected: "No", type: "typing" },
      { prompt: "Is this okay? → Type: Okay", expected: "Okay", type: "typing" }
    ],
    appreciation: [
      "🎉 Fantastic! Level 5 done!",
      "👏 You can answer simple questions now."
    ],
    badge: "Beginner Badge (Level 5)",
    xpReward: 30,
    unlockCondition: "Complete Level 4",
    estimatedTime: 7
  },
  {
    id: 6,
    title: "Level 6: Sentence Building",
    description: "Combine words into simple phrases",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Guided Practice",
    learning: ["Good morning, I am fine", "Good evening, I am happy"],
    questions: [
      { prompt: "Say: Good morning, I am fine", expected: "Good morning, I am fine", type: "typing" },
      { prompt: "Say: Good evening, I am happy", expected: "Good evening, I am happy", type: "typing" }
    ],
    appreciation: [
      "🎉 Awesome! Level 6 completed!",
      "👏 Keep combining words into phrases."
    ],
    badge: "Sentence Builder Badge (Level 6)",
    xpReward: 35,
    unlockCondition: "Complete Level 5",
    estimatedTime: 10
  },
  {
    id: 7,
    title: "Level 7: Daily Activities",
    description: "Express basic daily routines",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Guided Practice",
    learning: ["I eat breakfast", "I go to school"],
    questions: [
      { prompt: "Type: I eat breakfast at 8 AM", expected: "I eat breakfast at 8 AM", type: "typing" },
      { prompt: "Type: I go to school now", expected: "I go to school now", type: "typing" }
    ],
    appreciation: [
      "🎉 Great work! Level 7 completed!",
      "👏 You can now make small sentences."
    ],
    badge: "Sentence Builder Badge (Level 7)",
    xpReward: 35,
    unlockCondition: "Complete Level 6",
    estimatedTime: 10
  },
  {
    id: 8,
    title: "Level 8: Word Association",
    description: "Practice word connections and mini sentences",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Quizzes / Practice",
    learning: ["I drink water", "I read book"],
    questions: [
      { prompt: "Match: Morning → Time of day", expected: "Time of day", type: "typing" },
      { prompt: "Type: I drink water", expected: "I drink water", type: "typing" },
      { prompt: "Type: I read book", expected: "I read book", type: "typing" }
    ],
    appreciation: [
      "🎉 Excellent! Level 8 done!",
      "👏 Practice makes perfect."
    ],
    badge: "Sentence Builder Badge (Level 8)",
    xpReward: 40,
    unlockCondition: "Complete Level 7",
    estimatedTime: 12
  },
  {
    id: 9,
    title: "Level 9: Expanding Vocabulary",
    description: "Build more complex sentences with preferences",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Guided Practice",
    learning: ["I eat breakfast", "I go to school", "I like apples"],
    questions: [
      { prompt: "Type: I eat breakfast", expected: "I eat breakfast", type: "typing" },
      { prompt: "Type: I go to school", expected: "I go to school", type: "typing" },
      { prompt: "Type: I like apples", expected: "I like apples", type: "typing" }
    ],
    appreciation: [
      "🎉 Well done! Level 9 completed!",
      "👏 Your vocabulary is improving."
    ],
    badge: "Sentence Builder Badge (Level 9)",
    xpReward: 40,
    unlockCondition: "Complete Level 8",
    estimatedTime: 12
  },
  {
    id: 10,
    title: "Level 10: Review & Mastery",
    description: "Recall all words and phrases learned so far",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Review",
    learning: ["Review all previous words and phrases"],
    questions: [
      { prompt: "Type: I am happy", expected: "I am happy", type: "typing" },
      { prompt: "Type: Good evening", expected: "Good evening", type: "typing" },
      { prompt: "Type: I eat breakfast", expected: "I eat breakfast", type: "typing" }
    ],
    appreciation: [
      "🎉 Fantastic! Level 10 done!",
      "🏆 You earned the Sentence Builder Master Badge!"
    ],
    badge: "Sentence Builder Master Badge (Level 10)",
    xpReward: 50,
    unlockCondition: "Complete Level 9",
    estimatedTime: 15
  },

  // Levels 11-15: Advanced Sentence Formation (Text Only)
  {
    id: 11,
    title: "Level 11: Sentence Formation",
    description: "Form short sentences using learned words",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Practice",
    learning: ["Form short sentences using learned words"],
    questions: [
      { prompt: "Type: I am happy", expected: "I am happy", type: "typing" },
      { prompt: "Type: I like apples", expected: "I like apples", type: "typing" }
    ],
    appreciation: [
      "🎉 Level 11 complete! Keep forming sentences."
    ],
    badge: "Sentence Builder Badge",
    xpReward: 45,
    unlockCondition: "Complete Level 10",
    estimatedTime: 15
  },
  {
    id: 12,
    title: "Level 12: Simple Q&A",
    description: "Practice answering questions in simple English",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Practice",
    learning: ["Answer simple questions naturally"],
    questions: [
      { prompt: "Type your answer: How are you?", expected: "I am fine", type: "typing" },
      { prompt: "Type your answer: What is your name?", expected: "free_response", type: "typing" }
    ],
    appreciation: [
      "🎉 Well done! Level 12 done!"
    ],
    badge: "Conversation Starter Badge",
    xpReward: 45,
    unlockCondition: "Complete Level 11",
    estimatedTime: 15
  },
  {
    id: 13,
    title: "Level 13: Mini-Situations",
    description: "Practice in simple everyday situations",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Guided Practice",
    learning: ["Respond appropriately to situations"],
    questions: [
      { prompt: "Type: It is morning, greet your friend", expected: "Good morning", type: "typing" },
      { prompt: "Type: Someone helps you, what do you say?", expected: "Thank you", type: "typing" }
    ],
    appreciation: [
      "🎉 Level 13 complete!"
    ],
    badge: "Conversation Starter Badge",
    xpReward: 50,
    unlockCondition: "Complete Level 12",
    estimatedTime: 18
  },
  {
    id: 14,
    title: "Level 14: Sentence Expansion",
    description: "Make sentences more detailed and specific",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Guided Practice",
    learning: ["Add details to basic sentences"],
    questions: [
      { prompt: "Type: Expand - I eat breakfast", expected: "I eat breakfast at 8 AM", type: "typing" },
      { prompt: "Type: Expand - I go to school", expected: "I go to school every day", type: "typing" }
    ],
    appreciation: [
      "🎉 Excellent! Level 14 done!"
    ],
    badge: "Conversation Builder Badge",
    xpReward: 50,
    unlockCondition: "Complete Level 13",
    estimatedTime: 18
  },
  {
    id: 15,
    title: "Level 15: Daily Life Conversation",
    description: "Form sentences freely about daily activities",
    interaction: "Text / Voice",
    withWhom: "AI",
    aiRole: "Practice",
    learning: ["Express daily activities naturally"],
    questions: [
      { prompt: "Talk about your morning routine", expected: "free_response", type: "voice" },
      { prompt: "Describe what you did today", expected: "free_response", type: "voice" }
    ],
    appreciation: [
      "🎉 Level 15 complete! You are improving a lot!"
    ],
    badge: "Conversation Builder Badge",
    xpReward: 55,
    unlockCondition: "Complete Level 14",
    estimatedTime: 20
  },

  // Levels 16-20: Advanced Fluency (Text Only)
  {
    id: 16,
    title: "Level 16: Short Conversations",
    description: "Engage in brief back-and-forth conversations",
    interaction: "Text",
    withWhom: "AI",
    aiRole: "Correction / Fluency",
    learning: ["Maintain conversation flow"],
    questions: [
      { prompt: "Type a conversation about weather (3-4 exchanges)", expected: "conversation", type: "typing" }
    ],
    appreciation: [
      "🎉 Excellent! You are speaking fluently now."
    ],
    badge: "Fluency Badge",
    xpReward: 60,
    unlockCondition: "Complete Level 15",
    estimatedTime: 20
  },
  {
    id: 17,
    title: "Level 17: Mini Storytelling",
    description: "Tell short stories about personal experiences",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Correction / Fluency",
    learning: ["Narrate simple personal experiences"],
    questions: [
      { prompt: "Tell me about your last weekend", expected: "story", type: "voice" }
    ],
    appreciation: [
      "🎉 Great storytelling! Keep it up."
    ],
    badge: "Fluency Badge",
    xpReward: 60,
    unlockCondition: "Complete Level 16",
    estimatedTime: 22
  },
  {
    id: 18,
    title: "Level 18: Situation-Based Role-Play",
    description: "Practice specific scenarios and roles",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Correction / Fluency",
    learning: ["Adapt language to different situations"],
    questions: [
      { prompt: "Role-play: Ordering food at a restaurant", expected: "roleplay", type: "voice" }
    ],
    appreciation: [
      "🎉 Perfect role-play! You're getting professional."
    ],
    badge: "Fluency Badge",
    xpReward: 65,
    unlockCondition: "Complete Level 17",
    estimatedTime: 22
  },
  {
    id: 19,
    title: "Level 19: Grammar & Sentence Expansion",
    description: "Improve grammar and create complex sentences",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Correction / Fluency",
    learning: ["Use proper grammar and complex structures"],
    questions: [
      { prompt: "Describe your hobbies using complex sentences", expected: "complex_sentences", type: "voice" }
    ],
    appreciation: [
      "🎉 Grammar master! Your English is impressive."
    ],
    badge: "Fluency Badge",
    xpReward: 65,
    unlockCondition: "Complete Level 18",
    estimatedTime: 25
  },
  {
    id: 20,
    title: "Level 20: Confidence Practice",
    description: "Speak confidently on various topics",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Correction / Fluency",
    learning: ["Speak with confidence and clarity"],
    questions: [
      { prompt: "Speak confidently about your favorite book/movie", expected: "confident_speech", type: "voice" }
    ],
    appreciation: [
      "🎉 Excellent! You earned the Fluency Master Badge!"
    ],
    badge: "Fluency Master Badge (Level 20)",
    xpReward: 70,
    unlockCondition: "Complete Level 19",
    estimatedTime: 25
  },

  // Levels 21-25: Advanced / Professional & Free Speech (Voice)
  {
    id: 21,
    title: "Level 21: Professional Communication",
    description: "Practice formal workplace communication",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Role-play / Free Speech / Feedback",
    learning: ["Professional etiquette and formal language"],
    questions: [
      { prompt: "Role-play: Meeting with your manager", expected: "professional_communication", type: "voice" }
    ],
    appreciation: [
      "🎉 Professional communicator! You sound like an expert."
    ],
    badge: "Professional Communicator Badge",
    xpReward: 75,
    unlockCondition: "Complete Level 20",
    estimatedTime: 25
  },
  {
    id: 22,
    title: "Level 22: Interview Practice",
    description: "Prepare for job interviews and professional settings",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Role-play / Free Speech / Feedback",
    learning: ["Interview skills and professional responses"],
    questions: [
      { prompt: "Practice answering: Tell me about yourself", expected: "interview_response", type: "voice" }
    ],
    appreciation: [
      "🎉 Interview ready! You'll impress any employer."
    ],
    badge: "Professional Communicator Badge",
    xpReward: 75,
    unlockCondition: "Complete Level 21",
    estimatedTime: 28
  },
  {
    id: 23,
    title: "Level 23: Formal & Informal Balance",
    description: "Switch between formal and casual communication",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Role-play / Free Speech / Feedback",
    learning: ["Code-switching in different contexts"],
    questions: [
      { prompt: "First speak formally, then casually about the same topic", expected: "code_switching", type: "voice" }
    ],
    appreciation: [
      "🎉 Perfect balance! You master all communication styles."
    ],
    badge: "Advanced Communicator Badge",
    xpReward: 80,
    unlockCondition: "Complete Level 22",
    estimatedTime: 28
  },
  {
    id: 24,
    title: "Level 24: Extended Speech",
    description: "Deliver longer presentations and speeches",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Role-play / Free Speech / Feedback",
    learning: ["Structure and deliver extended presentations"],
    questions: [
      { prompt: "Give a 2-minute presentation about your goals", expected: "extended_speech", type: "voice" }
    ],
    appreciation: [
      "🎉 Outstanding presentation skills! You're a natural speaker."
    ],
    badge: "Advanced Communicator Badge",
    xpReward: 80,
    unlockCondition: "Complete Level 23",
    estimatedTime: 30
  },
  {
    id: 25,
    title: "Level 25: Advanced Mastery",
    description: "Master random topic speech and complex communication",
    interaction: "Voice",
    withWhom: "AI",
    aiRole: "Role-play / Free Speech / Feedback",
    learning: ["Speak fluently on any random topic"],
    questions: [
      { prompt: "1-minute speech on a random topic provided by AI", expected: "random_topic_speech", type: "voice" }
    ],
    appreciation: [
      "🏆 Congratulations! You finished Level 25 and are now an Advanced Communicator!",
      "🌟 You've mastered English communication from basic words to professional fluency!",
      "💫 Your journey from beginner to expert is truly inspiring!"
    ],
    badge: "Advanced Communicator Badge (Level 25)",
    xpReward: 100,
    unlockCondition: "Complete Level 24",
    estimatedTime: 30
  }
];

// Helper functions
export const getLevelById = (id) => levels.find(level => level.id === id);

export const getNextLevel = (currentLevelId) => {
  return levels.find(level => level.id === currentLevelId + 1);
};

export const isLevelUnlocked = (user, levelId) => {
  // Level 1 is always unlocked
  if (levelId === 1) return true;
  
  // Check if previous level is completed
  const previousLevelId = levelId - 1;
  return user.completedLevels?.some(completed => completed.levelId === previousLevelId);
};

export const getUserCurrentLevel = (user) => {
  return user.currentLevel || 1;
};

export const getTotalLevels = () => levels.length;

export const getCompletedLevelsCount = (user) => {
  return user.completedLevels?.length || 0;
};

export const getProgressPercentage = (user) => {
  const total = getTotalLevels();
  const completed = getCompletedLevelsCount(user);
  return Math.round((completed / total) * 100);
};

export default levels;