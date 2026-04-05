# Deployment Guide

This guide will help you deploy both the frontend and backend of your Speak Better application.

## Backend Deployment

### 1. Choose a Hosting Platform
Recommended options:
- **Render** (Free tier available): https://render.com/
- **Railway** (Free tier available): https://railway.app/
- **Heroku** (Free tier available): https://heroku.com/
- **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform

### 2. Prepare Your Backend for Deployment

1. Ensure your [.env](file:///C:/Users/tejas/OneDrive/Desktop/Final_project/frontend/backend/.env) file has the correct environment variables:
   ```
   PORT=5002
   MONGODB_URI=your-mongodb-uri-here
   JWT_SECRET=your-secret-key-change-in-production
   GROQ_API_KEY=groq_api_key_placeholder
   ```

2. Update the JWT_SECRET to a strong, random secret for production.

### 3. Deploy to Your Chosen Platform

For most platforms, you'll need to:
1. Connect your GitHub repository
2. Set the build command to `npm install`
3. Set the start command to `npm start`
4. Configure environment variables in the platform's dashboard

### 4. Environment Variables for Production
Set these in your hosting platform's environment variable settings:
```
MONGODB_URI=your-mongodb-uri-here
JWT_SECRET=your-production-secret-key-here
GROQ_API_KEY=groq_api_key_placeholder
NODE_ENV=production
```

## Frontend Deployment

### 1. Update Environment Variables

Before deploying, update the [.env.production](file:///C:/Users/tejas/OneDrive/Desktop/Final_project/frontend/.env.production) file with your deployed backend URL:
```
VITE_API_BASE_URL=https://your-deployed-backend-url.com
```

### 2. Build the Application

Run the build command:
```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

### 3. Choose a Hosting Platform
Recommended options:
- **Vercel** (Best for Vite apps): https://vercel.com/
- **Netlify**: https://netlify.com/
- **GitHub Pages**: https://pages.github.com/

### 4. Deploy to Your Chosen Platform

For Vercel/Netlify:
1. Connect your GitHub repository
2. Set the build command to `npm run build`
3. Set the output directory to `dist`
4. Set environment variables in the platform's dashboard

## Deployment Steps Summary

1. Deploy backend first and note the URL
2. Update [.env.production](file:///C:/Users/tejas/OneDrive/Desktop/Final_project/frontend/.env.production) with the backend URL
3. Build the frontend with `npm run build`
4. Deploy the frontend
5. Test the application

## Post-Deployment Checklist

- [ ] Verify backend API is accessible
- [ ] Check that frontend can connect to backend
- [ ] Test user registration and login
- [ ] Test peer chat functionality
- [ ] Test AI practice features
- [ ] Verify MongoDB connection
- [ ] Check that WebSockets are working for real-time chat

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend CORS configuration includes your frontend domain
2. **WebSocket Connection Issues**: Ensure your hosting platform supports WebSockets
3. **Environment Variables Not Set**: Double-check all environment variables are correctly configured
4. **MongoDB Connection**: Verify your MongoDB Atlas cluster allows connections from your backend host

### Useful Commands

To test your build locally before deploying:
```bash
npm run build
npm run preview
```

This will serve your production build locally for testing.