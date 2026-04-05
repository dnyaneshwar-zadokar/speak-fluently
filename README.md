# Speak Better - Separated Frontend and Backend

This project has been restructured to separate the frontend and backend into distinct folders for better organization and deployment flexibility.

## Project Structure

```
Final_project/
├── frontend/           # React frontend application
├── backend/            # Node.js backend API
└── README.md          # This file
```

## Frontend (React + Vite)

Location: `./frontend/`

### Setup
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Build
```bash
npm run build
```

### Environment Variables
The frontend connects to the backend via environment variables:
- Development: `http://localhost:5002`
- Production: Configurable via `VITE_API_BASE_URL`

## Backend (Node.js + Express)

Location: `./backend/`

### Setup
```bash
cd backend
npm install
```

### Development
```bash
npm run dev
# Runs on http://localhost:5002
```

### Production
```bash
npm start
```

### Environment Variables
Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5002
```

## Running Both Applications

### Option 1: Separate Terminals
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Option 2: Using npm-run-all (if installed)
```bash
# Install globally if not already installed
npm install -g npm-run-all

# Run both concurrently
npm-run-all --parallel "backend:dev" "frontend:dev"
```

## Deployment

### Frontend
- Can be deployed to Vercel, Netlify, or any static hosting service
- Make sure to set `VITE_API_BASE_URL` to your backend URL

### Backend  
- Can be deployed to Render, Heroku, or any Node.js hosting service
- Make sure MongoDB connection is configured
- Set appropriate environment variables

## Migration Notes

This structure was migrated from the previous setup where the backend was located inside the frontend folder (`frontend/backend`). All API calls in the frontend now use the configured `VITE_API_BASE_URL` environment variable to connect to the separate backend service.