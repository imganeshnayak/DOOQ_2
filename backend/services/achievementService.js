import Achievement from '../models/achievement.js';
import { sendPushNotification } from './notificationService.js';

const LEVELS = {
  BRONZE: { tasks: 10, points: 100 },
  SILVER: { tasks: 25, points: 250 },
  GOLD: { tasks: 50, points: 500 },
  PLATINUM: { tasks: 100, points: 1000 },
  DIAMOND: { tasks: 200, points: 2000 }
};

const BADGES = {
  FIRST_TASK: { name: 'First Steps', points: 10 },
  QUICK_RESPONSE: { name: 'Lightning Fast', points: 20 },
  PERFECT_RATING: { name: 'Five Stars', points: 30 },
  TASK_STREAK: { name: 'On Fire', points: 50 }
};

export const updateAchievements = async (userId, action) => {
  try {
    let achievement = await Achievement.findOne({ userId });
    
    if (!achievement) {
      achievement = new Achievement({ userId });
    }

    switch (action.type) {
      case 'COMPLETE_TASK':
        achievement.completedTasks += 1;
        achievement.points += 10;
        
        // Check for level up
        for (const [level, requirements] of Object.entries(LEVELS)) {
          if (achievement.completedTasks >= requirements.tasks && 
              achievement.level !== level) {
            achievement.level = level;
            
            // Notify user of level up
            await sendPushNotification(
              userId,
              'Level Up!',
              `Congratulations! You've reached ${level} level!`
            );
          }
        }
        break;

      case 'PERFECT_RATING':
        const badge = {
          name: BADGES.PERFECT_RATING.name,
          description: 'Received a 5-star rating',
          unlockedAt: new Date()
        };
        
        if (!achievement.badges.find(b => b.name === badge.name)) {
          achievement.badges.push(badge);
          achievement.points += BADGES.PERFECT_RATING.points;
        }
        break;
    }

    await achievement.save();
    return achievement;
  } catch (error) {
    console.error('Error updating achievements:', error);
  }
};