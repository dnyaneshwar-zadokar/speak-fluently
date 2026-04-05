import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MicroLesson from './models/MicroLesson.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample microlearning lessons with quizzes
const sampleLessons = [
  {
    title: "Mastering the Schwa Sound",
    description: "Learn to pronounce the most common vowel sound in English",
    content: "The schwa sound (ə) is the most frequent sound in English, appearing in weak syllables. It's a relaxed, neutral vowel sound. Practice by saying these words: 'about', 'sofa', 'support', 'problem'. Notice how the unstressed vowels sound the same.",
    category: "Pronunciation",
    difficulty: "Beginner",
    estimatedTime: 5,
    keyPoints: [
      "The schwa is a relaxed, neutral vowel sound",
      "It appears in unstressed syllables",
      "It's the most common sound in English",
      "Practice with common words like 'about' and 'sofa'"
    ],
    practiceExercise: "Record yourself saying these words: 'banana', 'computer', 'photograph', 'chocolate'. Focus on the unstressed syllables.",
    quizQuestions: [
      {
        question: "What is the schwa sound represented as?",
        options: ["æ", "ə", "ɛ", "ɪ"],
        correctAnswer: 1,
        explanation: "The schwa sound is represented by the symbol 'ə' and is the most common vowel sound in English."
      },
      {
        question: "In which type of syllables does the schwa sound typically appear?",
        options: ["Stressed syllables", "Unstressed syllables", "Both stressed and unstressed", "Only at the end of words"],
        correctAnswer: 1,
        explanation: "The schwa sound appears primarily in unstressed syllables, helping to reduce emphasis on less important parts of words."
      },
      {
        question: "Which word contains a schwa sound?",
        options: ["cat", "about", "dog", "run"],
        correctAnswer: 1,
        explanation: "In the word 'about', the second syllable contains the schwa sound: a-ˈbəut."
      }
    ]
  },
  {
    title: "Reducing Filler Words",
    description: "Eliminate 'um', 'uh', and 'like' from your speech",
    content: "Filler words interrupt the flow of your speech and reduce credibility. Replace them with intentional pauses. Practice by recording a 1-minute talk about your day, then listen for fillers. Challenge yourself to pause instead of filling silence.",
    category: "Fluency",
    difficulty: "Beginner",
    estimatedTime: 7,
    keyPoints: [
      "Filler words reduce your credibility",
      "Replace fillers with intentional pauses",
      "Practice self-awareness through recordings",
      "Gradual improvement takes consistent effort"
    ],
    practiceExercise: "Speak for 60 seconds on 'My weekend plans' without any filler words. Record yourself and count how many you use.",
    quizQuestions: [
      {
        question: "What is the best replacement for filler words?",
        options: ["Speaking faster", "Intentional pauses", "Saying 'um' quietly", "Repeating the last word"],
        correctAnswer: 1,
        explanation: "Intentional pauses are the best replacement for filler words as they give you time to think without interrupting the flow of speech."
      },
      {
        question: "Which of these is NOT a filler word?",
        options: ["um", "like", "however", "uh"],
        correctAnswer: 2,
        explanation: "'However' is a transition word used to connect ideas, while 'um', 'uh', and 'like' are filler words."
      },
      {
        question: "Why should you reduce filler words?",
        options: ["They make you sound smarter", "They interrupt speech flow and reduce credibility", "They are grammatically incorrect", "They take too long to say"],
        correctAnswer: 1,
        explanation: "Filler words interrupt the natural flow of speech and can reduce your credibility as a speaker."
      }
    ]
  },
  {
    title: "Subject-Verb Agreement",
    description: "Master the basics of subject-verb agreement",
    content: "Subject-verb agreement ensures your verbs match your subjects in number. Singular subjects take singular verbs ('He runs'), plural subjects take plural verbs ('They run'). Watch for tricky cases with compound subjects and indefinite pronouns.",
    category: "Grammar",
    difficulty: "Beginner",
    estimatedTime: 6,
    keyPoints: [
      "Singular subjects take singular verbs",
      "Plural subjects take plural verbs",
      "Compound subjects usually take plural verbs",
      "Indefinite pronouns can be tricky - memorize them"
    ],
    practiceExercise: "Write 10 sentences with different subjects and underline the subject-verb pairs to check agreement.",
    quizQuestions: [
      {
        question: "Which sentence shows correct subject-verb agreement?",
        options: ["The group of students are studying", "The group of students is studying", "The students is studying", "The student are studying"],
        correctAnswer: 1,
        explanation: "In 'The group of students is studying,' 'group' is the singular subject, so it takes the singular verb 'is.'"
      },
      {
        question: "Which verb correctly completes this sentence: 'Either of the answers _____ correct'?",
        options: ["are", "is", "am", "were"],
        correctAnswer: 1,
        explanation: "'Either' is a singular indefinite pronoun, so it takes the singular verb 'is.'"
      },
      {
        question: "What is the subject in: 'Running and swimming are my favorite activities'?",
        options: ["running", "swimming", "activities", "running and swimming"],
        correctAnswer: 3,
        explanation: "'Running and swimming' is a compound subject made up of two gerunds joined by 'and,' making it plural."
      }
    ]
  },
  {
    title: "Power Verbs for Impact",
    description: "Replace weak verbs with stronger alternatives",
    content: "Strong verbs create vivid mental images and engage listeners. Instead of 'make a decision', use 'decide'. Rather than 'do an improvement', use 'enhance'. Build a personal list of power verbs and practice substituting them in daily conversations.",
    category: "Vocabulary",
    difficulty: "Intermediate",
    estimatedTime: 8,
    keyPoints: [
      "Power verbs create vivid mental images",
      "Replace weak verb + noun combinations",
      "Build a personal power verb list",
      "Practice substitution in daily conversations"
    ],
    practiceExercise: "Rewrite these sentences with stronger verbs: 'He made a presentation', 'She gave an apology', 'They did research'.",
    quizQuestions: [
      {
        question: "Which is the strongest verb to replace 'make a decision'?",
        options: ["decided", "chose", "determined", "concluded"],
        correctAnswer: 0,
        explanation: "'Decide' is the most direct and powerful verb to replace the weak 'make a decision.'"
      },
      {
        question: "Which sentence uses a power verb?",
        options: ["She did a suggestion", "She suggested", "She made a suggestion", "She gave a suggestion"],
        correctAnswer: 1,
        explanation: "'Suggested' is a power verb that directly expresses the action without needing extra words."
      },
      {
        question: "Why should you use power verbs?",
        options: ["They are longer words", "They create vivid images and engage listeners", "They sound more academic", "They are easier to spell"],
        correctAnswer: 1,
        explanation: "Power verbs create vivid mental images and help engage your listeners more effectively."
      }
    ]
  },
  {
    title: "Speaking with Confidence",
    description: "Techniques to project confidence in your speech",
    content: "Confidence comes from preparation, posture, and vocal variety. Stand tall, make appropriate eye contact, and vary your tone. Practice speaking about familiar topics with enthusiasm. Record yourself to identify areas for improvement.",
    category: "Confidence",
    difficulty: "Beginner",
    estimatedTime: 6,
    keyPoints: [
      "Preparation builds authentic confidence",
      "Posture affects how you feel and sound",
      "Vocal variety keeps listeners engaged",
      "Practice with familiar topics first"
    ],
    practiceExercise: "Record a 90-second introduction of yourself, focusing on posture, eye contact (to camera), and vocal energy.",
    quizQuestions: [
      {
        question: "Which factor most contributes to speaking confidence?",
        options: ["Expensive clothes", "Preparation", "Speaking very quickly", "Using big words"],
        correctAnswer: 1,
        explanation: "Preparation is the foundation of authentic confidence. When you know your material well, you naturally feel more confident."
      },
      {
        question: "How does posture affect your speech?",
        options: ["It only affects appearance", "It affects how you feel and sound", "It makes you taller", "It reduces the need for practice"],
        correctAnswer: 1,
        explanation: "Good posture affects both how you feel physically and how your voice sounds to listeners."
      },
      {
        question: "What is vocal variety?",
        options: ["Speaking in different languages", "Changing your accent", "Varying pitch, pace, and volume", "Using technical terms"],
        correctAnswer: 2,
        explanation: "Vocal variety refers to changing your pitch, pace, and volume to keep your audience engaged."
      }
    ]
  },
  {
    title: "Answering Behavioral Interview Questions",
    description: "Master the STAR technique for interview success",
    content: "Behavioral interviews assess past performance to predict future success. Use the STAR method: Situation, Task, Action, Result. Prepare 5-7 stories covering teamwork, leadership, problem-solving, and overcoming challenges. Practice telling them concisely.",
    category: "Interview",
    difficulty: "Intermediate",
    estimatedTime: 10,
    keyPoints: [
      "STAR = Situation, Task, Action, Result",
      "Prepare 5-7 versatile stories",
      "Focus on your specific actions",
      "Quantify results when possible"
    ],
    practiceExercise: "Craft a STAR story about a time you solved a difficult problem at work or school. Time yourself - aim for 90-120 seconds.",
    quizQuestions: [
      {
        question: "What does STAR stand for?",
        options: ["Situation, Task, Action, Result", "Strategy, Target, Activity, Review", "Structure, Theme, Argument, Resolution", "Summary, Topic, Analysis, Recommendation"],
        correctAnswer: 0,
        explanation: "STAR stands for Situation, Task, Action, Result - a framework for structuring behavioral interview answers."
      },
      {
        question: "In the STAR method, which part should focus on what YOU specifically did?",
        options: ["Situation", "Task", "Action", "Result"],
        correctAnswer: 2,
        explanation: "The Action part focuses on what you personally did to address the situation or task."
      },
      {
        question: "Why should you prepare multiple STAR stories?",
        options: ["To show you're a liar", "To have versatile examples for different questions", "To confuse the interviewer", "To prove you have a good memory"],
        correctAnswer: 1,
        explanation: "Preparing multiple STAR stories gives you versatile examples you can adapt to answer various behavioral interview questions."
      }
    ]
  },
  {
    title: "Structuring Your Presentation",
    description: "Create compelling presentation structures",
    content: "Great presentations follow clear structures: opening, main points, conclusion. Open with a hook, preview your points, develop each point with evidence, and close with a memorable summary. Use signposting language to guide listeners through your structure.",
    category: "Presentation",
    difficulty: "Intermediate",
    estimatedTime: 9,
    keyPoints: [
      "Opening: Hook + preview points",
      "Main body: Point + evidence + explanation",
      "Conclusion: Summary + call to action",
      "Signposting guides listeners"
    ],
    practiceExercise: "Outline a 5-minute presentation on a topic you're passionate about using the structure above.",
    quizQuestions: [
      {
        question: "What should you do in your presentation opening?",
        options: ["State your name and title", "Apologize for your nerves", "Include a hook and preview points", "Summarize your main points"],
        correctAnswer: 2,
        explanation: "Your opening should include a hook to grab attention and a preview of your main points to set expectations."
      },
      {
        question: "What is signposting in presentations?",
        options: ["Using visual aids", "Guiding listeners through your structure", "Pointing at slides", "Reading from notes"],
        correctAnswer: 1,
        explanation: "Signposting involves using verbal cues to guide your audience through your presentation structure."
      },
      {
        question: "What should your conclusion include?",
        options: ["A new idea", "Summary + call to action", "An apology", "A lengthy quote"],
        correctAnswer: 1,
        explanation: "Your conclusion should summarize key points and include a clear call to action for your audience."
      }
    ]
  },
  {
    title: "Small Talk in Professional Settings",
    description: "Navigate business networking conversations",
    content: "Professional small talk builds relationships and opens doors. Prepare current event topics, industry news, and genuine questions about others' work. Practice the 'compliment-connection-question' technique: compliment their achievement, connect to your experience, ask a follow-up question.",
    category: "Business",
    difficulty: "Intermediate",
    estimatedTime: 7,
    keyPoints: [
      "Prepare 3-5 conversation starters",
      "Ask genuine questions about others",
      "Listen more than you speak",
      "Follow up appropriately after meetings"
    ],
    practiceExercise: "Role-play a networking conversation with a friend. Practice transitioning from small talk to meaningful professional discussion.",
    quizQuestions: [
      {
        question: "What is the 'compliment-connection-question' technique?",
        options: ["Complain about work, connect over coffee, question their skills", "Compliment achievement, connect to experience, ask follow-up", "Compare yourself, contradict them, conclude quickly", "Compliment appearance, connect socially, quiz them"],
        correctAnswer: 1,
        explanation: "This technique involves complimenting someone's achievement, connecting it to your own experience, and asking a thoughtful follow-up question."
      },
      {
        question: "What should you prepare for professional small talk?",
        options: ["Personal gossip", "Current events and industry news", "Complaints about work", "Movie spoilers"],
        correctAnswer: 1,
        explanation: "Preparing current events and industry news gives you relevant, professional topics for small talk."
      },
      {
        question: "What is the key to effective small talk?",
        options: ["Talking as much as possible", "Asking questions and listening", "Showing off your knowledge", "Staying on one topic"],
        correctAnswer: 1,
        explanation: "Asking genuine questions and actively listening shows interest in others and leads to more meaningful conversations."
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Clear existing lessons
    await MicroLesson.deleteMany({});
    console.log('Cleared existing lessons');
    
    // Insert sample lessons
    const insertedLessons = await MicroLesson.insertMany(sampleLessons);
    console.log(`Inserted ${insertedLessons.length} sample lessons`);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();