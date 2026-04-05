// Remove dotenv import since it should be loaded by the server
// import dotenv from 'dotenv';
// dotenv.config();

class AIService {
  constructor() {
    this.groq = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    if (process.env.GROQ_API_KEY) {
      const Groq = (await import('groq-sdk')).default;
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      console.log('✅ Groq API initialized successfully');
    } else {
      console.log('⚠️ Groq API not initialized - missing API key');
    }
    this.initialized = true;
  }

  // Updated method for comprehensive feedback
  async getComprehensiveFeedback(text) {
    await this.initialize();
    
    // If Groq is not initialized, return fallback response
    if (!this.groq) {
      console.warn('AI service not available - returning fallback response for comprehensive feedback');
      return {
        pronunciation: ["System unavailable - please try again later"],
        fluency: ["System unavailable - please try again later"],
        tone: ["System unavailable - please try again later"],
        grammar: ["System unavailable - please try again later"],
        vocabulary: ["System unavailable - please try again later"],
        fillers: ["System unavailable - please try again later"],
        accent: ["System unavailable - please try again later"],
        clarity: ["System unavailable - please try again later"],
        score: 50,
        suggestions: ["Please try again when the system is available"]
      };
    }

    try {
      const prompt = `
You are an expert English pronunciation and speaking coach. Analyze the following spoken text and provide comprehensive feedback.

Spoken Text: "${text}"

Provide detailed feedback in this exact JSON format:
{
  "pronunciation": ["specific pronunciation feedback 1", "specific pronunciation feedback 2"],
  "fluency": ["fluency and speed feedback 1", "fluency and speed feedback 2"],
  "tone": ["tone and confidence feedback 1", "tone and confidence feedback 2"],
  "grammar": ["grammar correction 1", "grammar correction 2"],
  "vocabulary": ["vocabulary improvement suggestion 1", "vocabulary improvement suggestion 2"],
  "fillers": ["filler word reduction tip 1", "filler word reduction tip 2"],
  "accent": ["accent improvement tip 1", "accent improvement tip 2"],
  "clarity": ["clarity and articulation feedback 1", "clarity and articulation feedback 2"],
  "score": number (0-100 overall score),
  "suggestions": ["personalized practice suggestion 1", "personalized practice suggestion 2"]
}

Important Scoring Guidelines:
1. Score should be generous but realistic
2. Well-constructed sentences with minor issues should score 80-95
3. Sentences with good grammar, vocabulary, and fluency should score 90+
4. Only sentences with major issues should score below 70
5. Perfect sentences should score 95-100

Examples:
1. For "I enjoy learning new languages because it helps me connect with people from different cultures." (excellent):
{
  "pronunciation": ["Clear pronunciation of all words", "Good enunciation of complex words like 'languages' and 'cultures'"],
  "fluency": ["Excellent rhythm and pace", "Smooth transitions between ideas"],
  "tone": ["Confident delivery", "Good vocal variety"],
  "grammar": ["Perfect sentence structure", "Correct use of complex sentence construction"],
  "vocabulary": ["Sophisticated word choice with 'connect' and 'different cultures'", "Varied vocabulary usage"],
  "fillers": ["No filler words detected", "Clean, uninterrupted speech"],
  "accent": ["Clear and neutral accent", "No regional interference issues"],
  "clarity": ["Excellent articulation", "Every word is clearly audible"],
  "score": 96,
  "suggestions": ["To maintain this high level, continue practicing with complex sentence structures", "Consider working on specific sounds if needed"]
}

2. For "I goes to school everyday" (needs improvement):
{
  "pronunciation": ["Generally clear pronunciation", "Work on consonant clusters in 'school'"],
  "fluency": ["Good basic pace", "Some hesitation between words"],
  "tone": ["Adequate confidence", "Could benefit from more vocal variety"],
  "grammar": ["Subject-verb disagreement: 'goes' should be 'go' with 'I'", "Consider 'every day' (two words) instead of 'everyday'"],
  "vocabulary": ["Basic vocabulary appropriate for context", "Could use more descriptive terms"],
  "fillers": ["No significant filler word usage detected", "Maintain this good habit"],
  "accent": ["Clear and understandable", "Minor regional influence"],
  "clarity": ["Good articulation", "Most words clearly pronounced"],
  "score": 72,
  "suggestions": ["Practice subject-verb agreement rules", "Work on reducing hesitation by reading aloud daily"]
}

Important Guidelines:
1. For each category, provide 1-2 specific, actionable feedback points
2. If a category has no issues, still provide positive feedback
3. Score should reflect overall speaking quality (0-100)
4. Suggestions should be personalized based on the weaknesses identified
5. Be concise but specific
`;

      console.log('Sending comprehensive feedback request to Groq API');
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 1200
      });
      
      const responseText = completion.choices[0].message.content;
      console.log('Received response from Groq API for comprehensive feedback');
      
      // Extract JSON from response (handle markdown code blocks if present)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      
      return JSON.parse(jsonText);

    } catch (error) {
      console.error('Comprehensive Feedback Error:', error);
      
      // Fallback response if AI fails
      return {
        pronunciation: ["Unable to analyze pronunciation at the moment"],
        fluency: ["Unable to analyze fluency at the moment"],
        tone: ["Unable to analyze tone at the moment"],
        grammar: ["Unable to analyze grammar at the moment"],
        vocabulary: ["Unable to analyze vocabulary at the moment"],
        fillers: ["Unable to analyze fillers at the moment"],
        accent: ["Unable to analyze accent at the moment"],
        clarity: ["Unable to analyze clarity at the moment"],
        score: 50,
        suggestions: ["Please try again later"]
      };
    }
  }

  async analyzeSpeech(transcript, duration) {
    await this.initialize();
    
    // If Groq is not initialized, return fallback response
    if (!this.groq) {
      console.warn('AI service not available - returning fallback response');
      return {
        score: 75,
        clarity: 70,
        pace: 75,
        vocabulary: 80,
        confidence: 70,
        fillerWords: 5,
        feedback: "Great practice session! Keep working on clarity and reducing filler words. Your vocabulary is good, and you're showing confidence in your delivery.",
        suggestions: [
          "Practice slowing down on key points",
          "Reduce filler words like 'um' and 'uh'",
          "Pause more intentionally between ideas"
        ]
      };
    }

    try {
      const prompt = `
You are an expert speech coach analyzing a practice session. 
Analyze the following transcript and provide detailed feedback.

Transcript: "${transcript}"
Duration: ${duration} seconds

Provide a comprehensive analysis including:
1. Overall score (0-100)
2. Clarity assessment
3. Pace and rhythm feedback
4. Vocabulary usage
5. Confidence level
6. Filler words count
7. Specific improvement suggestions

Format your response as JSON with these fields:
{
  "score": number,
  "clarity": number (0-100),
  "pace": number (0-100),
  "vocabulary": number (0-100),
  "confidence": number (0-100),
  "fillerWords": number,
  "feedback": "detailed feedback text",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
`;

      console.log('Sending speech analysis request to Groq API');
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      
      const text = completion.choices[0].message.content;
      console.log('Received response from Groq API for speech analysis');
      
      // Extract JSON from response (handle markdown code blocks if present)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      
      return JSON.parse(jsonText);

    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Fallback response if AI fails
      return {
        score: 75,
        clarity: 70,
        pace: 75,
        vocabulary: 80,
        confidence: 70,
        fillerWords: 5,
        feedback: "Great practice session! Keep working on clarity and reducing filler words. Your vocabulary is good, and you're showing confidence in your delivery.",
        suggestions: [
          "Practice slowing down on key points",
          "Reduce filler words like 'um' and 'uh'",
          "Pause more intentionally between ideas"
        ]
      };
    }
  }

  async generatePracticeTopic() {
    await this.initialize();
    
    // If Groq is not initialized, return fallback response
    if (!this.groq) {
      console.warn('AI service not available - returning fallback response');
      return {
        topic: "Tell your success story",
        description: "Share a moment when you overcame a challenge and achieved something meaningful",
        tips: ["Start with context", "Build tension", "End with the lesson learned"]
      };
    }

    try {
      const prompt = 'You are a creative speech coach. Generate an interesting speaking practice topic or scenario. Format your response as JSON with these fields: {"topic": "title", "description": "brief description", "tips": ["tip1", "tip2"]}';
      
      console.log('Sending topic generation request to Groq API');
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      });
      
      const text = completion.choices[0].message.content;
      console.log('Received response from Groq API for topic generation');
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Topic Generation Error:', error);
      return {
        topic: "Tell your success story",
        description: "Share a moment when you overcame a challenge and achieved something meaningful",
        tips: ["Start with context", "Build tension", "End with the lesson learned"]
      };
    }
  }

  async getMicroLearningContent(topic) {
    await this.initialize();
    
    // If Groq is not initialized, return fallback response
    if (!this.groq) {
      console.warn('AI service not available - returning fallback response');
      return {
        title: topic,
        content: "Learn effective communication techniques",
        keyPoints: ["Clarity", "Confidence", "Connection"],
        practice: "Practice speaking clearly for 2 minutes"
      };
    }

    try {
      const prompt = `You are an expert communication teacher creating bite-sized learning content. Create a comprehensive micro-learning lesson about: ${topic}. 

Format your response as JSON with these fields: 
{
  "title": "lesson title", 
  "content": "detailed lesson content with explanations and examples", 
  "keyPoints": ["point1", "point2", "point3", "point4"], 
  "practice": "specific practice exercise with clear instructions"
}

Requirements:
1. Title should be engaging and specific
2. Content should be informative but concise (200-300 words)
3. Include practical examples where relevant
4. Key points should be actionable takeaways
5. Practice exercise should be specific and doable in 5-10 minutes
6. Make it suitable for the topic: ${topic}`;

      console.log('Sending micro-learning request to Groq API');
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      
      const text = completion.choices[0].message.content;
      console.log('Received response from Groq API for micro-learning');
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Micro-learning Error:', error);
      return {
        title: topic,
        content: "Learn effective communication techniques",
        keyPoints: ["Clarity", "Confidence", "Connection"],
        practice: "Practice speaking clearly for 2 minutes"
      };
    }
  }

  async getChatResponse(message, history = []) {
    await this.initialize();
    
    // If Groq is not initialized, return fallback response
    if (!this.groq) {
      console.warn('AI service not available - returning fallback response');
      return this.getRuleBasedResponse(message);
    }

    try {
      // Build messages array for OpenAI chat
      const messages = [
        {
          role: "system",
          content: "You are an expert communication coach and speaking assistant. Help users improve their speaking skills, answer questions about communication, and provide friendly, encouraging guidance. Keep responses concise and practical."
        }
      ];
      
      // Add conversation history
      if (history.length > 0) {
        console.log('Adding conversation history to chat request');
        history.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }
      
      // Add current message
      messages.push({ role: "user", content: message });
      
      console.log('Sending chat request to Groq API with message:', message);
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
      });
      
      const reply = completion.choices[0].message.content;
      console.log('Received response from Groq API for chat:', reply);
      
      return reply.trim();
    } catch (error) {
      console.error('Chat Response Error:', error);
      // Fallback to rule-based responses
      return this.getRuleBasedResponse(message);
    }
  }

  getRuleBasedResponse(message) {
    console.log('Using rule-based response for message:', message);
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
      return "Hello! I'm your AI communication coach. I'm here to help you improve your speaking skills. What would you like to work on today?";
    }
    
    // Public speaking
    if (lowerMessage.match(/\b(public speaking|presentation|speech)\b/)) {
      return "Great question about public speaking! Here are 3 key tips:\n\n1. **Practice thoroughly** - Know your material inside out\n2. **Start strong** - Hook your audience in the first 30 seconds\n3. **Use the power of pause** - Silence can be more powerful than words\n\nWould you like specific advice on any of these areas?";
    }
    
    // Confidence
    if (lowerMessage.match(/\b(confidence|confident|nervous|anxiety)\b/)) {
      return "Building speaking confidence takes practice! Here's what works:\n\n✓ Start with small, low-pressure situations\n✓ Record yourself and review (you're better than you think!)\n✓ Practice power poses before speaking\n✓ Remember: your audience wants you to succeed\n\nWhat specific situation makes you nervous?";
    }
    
    // Filler words
    if (lowerMessage.match(/\b(filler words|um|uh|like|you know)\b/)) {
      return "Reducing filler words is totally achievable! Try these techniques:\n\n1. **Pause instead** - When you feel 'um' coming, just pause\n2. **Slow down** - Filler words increase when we rush\n3. **Record & count** - Awareness is the first step\n4. **Practice deliberately** - Focus on one conversation at a time\n\nIt takes about 3 weeks of conscious practice to see improvement!";
    }
    
    // Interview
    if (lowerMessage.match(/\b(interview|job|career)\b/)) {
      return "Job interview success tips:\n\n📌 Research the company thoroughly\n📌 Prepare STAR stories (Situation, Task, Action, Result)\n📌 Practice your 2-minute 'tell me about yourself'\n📌 Prepare 3-5 good questions to ask them\n📌 Speak at 150-160 words per minute (not too fast!)\n\nWhat type of role are you interviewing for?";
    }
    
    // Voice/tone
    if (lowerMessage.match(/\b(voice|tone|speaking voice|sound)\b/)) {
      return "Your voice is a powerful tool! Here's how to improve it:\n\n🎤 Breathe from your diaphragm, not your chest\n🎤 Vary your pitch to maintain interest\n🎤 Record yourself - identify what you like\n🎤 Hydrate well before speaking\n🎤 Warm up with vocal exercises\n\nWould you like specific exercises to practice?";
    }
    
    // Tips/advice
    if (lowerMessage.match(/\b(tip|tips|advice|help|improve)\b/)) {
      return "Here are my top communication tips:\n\n1. **Practice active listening** - It makes you a better speaker\n2. **Know your audience** - Adapt your message to them\n3. **Use stories** - They're 22x more memorable than facts\n4. **Body language matters** - 55% of communication is nonverbal\n5. **Get feedback** - Record yourself or ask trusted friends\n\nWhat specific area would you like to focus on?";
    }
    
    // Body language
    if (lowerMessage.match(/\b(body language|gesture|posture|eye contact)\b/)) {
      return "Body language speaks volumes! Key points:\n\n👁️ **Eye contact**: 3-5 seconds per person in a group\n🤝 **Open posture**: No crossed arms, face the audience\n✋ **Gestures**: Use them naturally to emphasize points\n📏 **Space**: Don't hide behind podiums if possible\n😊 **Smile**: It makes you and others feel better\n\nWhat aspect would you like to work on?";
    }
    
    // Story telling
    if (lowerMessage.match(/\b(story|storytelling|narrative)\b/)) {
      return "Storytelling is a superpower! Use this structure:\n\n📖 **Hook**: Start with intrigue or emotion\n📖 **Context**: Set the scene briefly\n📖 **Conflict**: What was the challenge?\n📖 **Climax**: The turning point\n📖 **Resolution**: How it ended\n📖 **Lesson**: What did you/they learn?\n\nStories should be 60-90 seconds for maximum impact!";
    }
    
    // Thank you
    if (lowerMessage.match(/\b(thank|thanks|appreciate)\b/)) {
      return "You're welcome! I'm here to help you become a more confident communicator. Feel free to ask me anything about speaking, presentations, or communication skills. What else can I help you with?";
    }
    
    // Default response with helpful prompts
    return "I'm your communication coach! I can help you with:\n\n• Public speaking & presentations\n• Building confidence\n• Reducing filler words\n• Interview preparation\n• Voice & tone improvement\n• Body language\n• Storytelling techniques\n\nWhat would you like to work on? Ask me anything!";
  }
}

export default new AIService();