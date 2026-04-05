# Speak Better - Backend API

Backend server for the Speak Better AI Practice Platform with OpenAI integration.

## Features

- **AI-Powered Speech Analysis** - Uses OpenAI GPT-4 to analyze speech and provide detailed feedback
- **User Authentication** - JWT-based authentication with bcrypt password hashing
- **Practice Sessions** - Store and track user practice sessions with detailed metrics
- **Progress Tracking** - Monitor user improvement over time
- **Leaderboard** - Competitive rankings based on points
- **Achievements System** - Gamification with unlockable achievements
- **Micro-Learning** - AI-generated bite-sized learning content
- **Real-time Chat** - Socket.IO for peer-to-peer communication

## Tech Stack

- Node.js + Express
- MongoDB with Mongoose
- OpenAI API (GPT-4)
- Socket.IO
- JWT Authentication
- bcryptjs

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/speak-better
JWT_SECRET=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
```

**Important:** Replace `your-openai-api-key-here` with your actual OpenAI API key from https://platform.openai.com/api-keys

### 3. Install and Start MongoDB

**Option 1: MongoDB Community Edition (Recommended)**
- Download from https://www.mongodb.com/try/download/community
- Install and run MongoDB locally

**Option 2: MongoDB Atlas (Cloud)**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Update MONGODB_URI with your Atlas connection string

### 4. Start the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on http://localhost:5000

### 5. Initialize Achievements (Optional)

Send a POST request to initialize default achievements:
```bash
curl -X POST http://localhost:5000/api/achievements/init
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### AI Practice
- `GET /api/ai/practice` - Get user practice sessions
- `POST /api/ai/practice` - Create new practice session with AI feedback
- `GET /api/ai/topic` - Generate practice topic suggestion
- `GET /api/ai/analytics` - Get practice analytics

### Progress
- `GET /api/progress` - Get user progress and metrics

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard

### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements/init` - Initialize default achievements

### Micro-Learning
- `GET /api/micro-learning` - Get random learning content
- `GET /api/micro-learning/:topic` - Get specific topic content

## OpenAI Integration

The AI service uses GPT-4 to provide:
- Speech analysis and scoring (0-100)
- Clarity, pace, vocabulary, and confidence metrics
- Filler word detection
- Personalized feedback and suggestions
- Practice topic generation
- Micro-learning content creation

The AI service includes fallback responses if OpenAI API fails, ensuring the app continues to function.

## Socket.IO Events

- `connection` - User connects
- `join-room` - Join chat room
- `send-message` - Send message to room
- `receive-message` - Receive message from room
- `disconnect` - User disconnects

## Project Structure

```
backend/
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── PracticeSession.js
│   └── Achievement.js
├── routes/           # API routes
│   ├── auth.js
│   ├── ai.js
│   ├── progress.js
│   ├── leaderboard.js
│   ├── achievements.js
│   └── microLearning.js
├── services/         # Business logic
│   └── aiService.js
├── middleware/       # Custom middleware
│   └── auth.js
├── server.js         # Main server file
├── .env             # Environment variables
└── package.json
```

## Development Tips

1. **Testing AI Features**: The AI service has fallback responses, so it works even without a valid OpenAI API key for testing
2. **MongoDB**: Use MongoDB Compass for easy database visualization
3. **API Testing**: Use Postman or Thunder Client to test endpoints
4. **Logs**: Check console for connection status and errors

## Troubleshooting

**MongoDB Connection Failed:**
- Ensure MongoDB is running: `mongod --version`
- Check MONGODB_URI in .env file

**OpenAI API Errors:**
- Verify API key is correct
- Check API usage limits at https://platform.openai.com/usage
- Fallback responses will activate if API fails

**Port Already in Use:**
- Change PORT in .env file
- Update proxy in frontend vite.config.js

## Next Steps

1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Set up MongoDB (local or Atlas)
3. Update the .env file with your credentials
4. Start the backend server
5. Start the frontend (npm run dev in frontend directory)
6. Create an account and start practicing!

## License

MIT
