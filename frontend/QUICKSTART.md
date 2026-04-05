# Quick Start Guide - Speak Better Platform

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or MongoDB Atlas account)
3. **OpenAI API Key** (from https://platform.openai.com/api-keys)

## Setup Steps

### Step 1: Configure Environment Variables

Edit `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/speak-better
JWT_SECRET=your-secret-key-here-make-it-complex
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### Step 2: Start MongoDB

**Windows:**
```bash
# If installed via MSI
net start MongoDB

# Or start mongod manually
mongod --dbpath C:\data\db
```

**Mac/Linux:**
```bash
sudo service mongod start
# or
brew services start mongodb-community
```

### Step 3: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
```

### Step 4: Start Frontend (New Terminal)

```bash
cd ../
npm run dev
```

Frontend will start on http://localhost:3000

### Step 5: Test the Application

1. Open http://localhost:3000
2. Click "Get Started" 
3. Sign up with username, email, and password
4. Go to "AI Practice"
5. Type some text in the practice area
6. Click "Get AI Feedback"
7. Watch the AI analyze your speech!

## Features to Test

### AI Practice Session
- Type or paste text to practice
- Get AI-powered feedback on:
  - Clarity (0-100)
  - Pace (0-100)
  - Vocabulary (0-100)
  - Confidence (0-100)
  - Filler words count
  - Overall score
  - Personalized suggestions

### Dashboard
- View your stats and progress
- See recent practice sessions
- Track improvement over time

### Progress Tracking
- Weekly progress charts
- Skill metrics visualization
- Session history

### Leaderboard
- Global rankings
- Your current rank
- Compete with other users

### Achievements
- Unlock achievements
- Earn points
- Track milestones

### Micro-Learning
- AI-generated learning content
- Bite-sized lessons
- Practice exercises

## Troubleshooting

### Backend won't start

**Error: "MongoDB connection failed"**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
net start MongoDB  # Windows
sudo service mongod start  # Linux
brew services start mongodb-community  # Mac
```

**Error: "Port 5000 already in use"**
```bash
# Change port in backend/.env
PORT=5001

# Update frontend/vite.config.js proxy target
target: 'http://localhost:5001'
```

### OpenAI API Issues

**Error: "Invalid API key"**
- Get a new key from https://platform.openai.com/api-keys
- Make sure there are no spaces in the .env file
- Format: `OPENAI_API_KEY=sk-...`

**Error: "Rate limit exceeded"**
- The app has fallback responses
- Check your usage at https://platform.openai.com/usage
- Consider upgrading your OpenAI plan

### Frontend Issues

**Error: "Network Error" or "401 Unauthorized"**
- Make sure backend is running (check terminal)
- Verify proxy in vite.config.js matches backend port
- Check browser console for detailed errors
- Clear localStorage and try logging in again

**Can't see AI feedback**
- Check backend terminal for errors
- Look in browser Network tab (F12)
- Verify token is being sent in Authorization header

## Testing the AI Integration

### Sample Practice Texts

Try these to test the AI analysis:

**Good example:**
```
Today I want to share an exciting opportunity with our team. We've developed 
a new product that solves a critical problem in the market. This innovation 
will help our customers save time and increase efficiency. I'm confident that 
with your support, we can successfully launch this product next quarter.
```

**Example with issues:**
```
Um, so like, I think we should, you know, maybe try to do something about 
the, um, problem we're having. Like, it's kind of important and, uh, we 
need to fix it soon, I guess.
```

The AI will detect:
- Filler words (um, uh, like, you know)
- Lack of clarity
- Low confidence indicators
- Provide specific improvement suggestions

## Development Tips

1. **Check Backend Logs**: Always keep backend terminal visible to see AI API calls and errors
2. **Browser DevTools**: Use Network tab to inspect API requests/responses
3. **MongoDB Compass**: Install to visualize your database
4. **Postman**: Test API endpoints directly

## Production Deployment

When ready to deploy:

1. Set strong JWT_SECRET
2. Use MongoDB Atlas for database
3. Set up environment variables on hosting platform
4. Configure CORS for your domain
5. Enable HTTPS
6. Set up rate limiting
7. Monitor OpenAI API usage

## Support

If you encounter issues:
1. Check backend terminal logs
2. Check browser console (F12)
3. Verify .env configuration
4. Ensure MongoDB is running
5. Test API endpoints with Postman

Happy practicing! 🎯
