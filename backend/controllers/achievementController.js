import Achievement from '../models/achievement.js';

export const getAchievements = async (req, res) => {
  try {
    const achievement = await Achievement.findOne({ userId: req.user.userId });
    
    if (!achievement) {
      return res.json({
        level: 'BRONZE',
        points: 0,
        completedTasks: 0,
        badges: [],
        nextLevel: {
          name: 'SILVER',
          tasksNeeded: 10,
          progress: 0
        }
      });
    }

    // Calculate progress to next level
    const levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    const currentLevelIndex = levels.indexOf(achievement.level);
    const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;

    const response = {
      level: achievement.level,
      points: achievement.points,
      completedTasks: achievement.completedTasks,
      badges: achievement.badges,
      nextLevel: nextLevel ? {
        name: nextLevel,
        tasksNeeded: LEVELS[nextLevel].tasks,
        progress: (achievement.completedTasks / LEVELS[nextLevel].tasks) * 100
      } : null
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
};