import cron from 'node-cron';
import { leaderboardCache } from '../routes/leaderboard.js';

// This script sets up a job to periodically clear the leaderboard cache
// to ensure data stays reasonably fresh

// Schedule to clear cache every hour
cron.schedule('0 * * * *', () => {
  console.log('Running hourly leaderboard cache cleanup');
  
  // Clear the leaderboard cache
  leaderboardCache.clear();
  
  console.log('Leaderboard cache cleared');
});

console.log('Leaderboard cache cleanup job scheduled to run every hour');