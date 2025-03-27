import React from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Shield, Trophy, Star, ChevronRight } from 'lucide-react-native';
import customTheme from '../theme';

const { width } = Dimensions.get('window');

interface Props {
  completedTasks: number;
  badges: Array<{
    name: string;
    unlockedAt: string;
  }>;
}

const LEVELS = [
  {
    name: 'BRONZE',
    color: '#CD7F32',
    icon: '🥉',
    tasksRequired: 10,
    pointsPerTask: 10,
    perks: ['Basic Profile Badge', 'Task Notifications']
  },
  {
    name: 'SILVER',
    color: '#C0C0C0',
    icon: '🥈',
    tasksRequired: 25,
    pointsPerTask: 15,
    perks: ['Priority Support', 'Custom Profile Banner']
  },
  {
    name: 'GOLD',
    color: '#FFD700',
    icon: '🥇',
    tasksRequired: 50,
    pointsPerTask: 20,
    perks: ['Featured in Search', 'Special Task Badge']
  },
  {
    name: 'PLATINUM',
    color: '#E5E4E2',
    icon: '🏆',
    tasksRequired: 100,
    pointsPerTask: 25,
    perks: ['Verified Status', 'Early Access Features']
  },
  {
    name: 'DIAMOND',
    color: '#B9F2FF',
    icon: '💎',
    tasksRequired: 200,
    pointsPerTask: 30,
    perks: ['Elite Badge', 'Commission Free']
  }
];

export default function AchievementProgress({ 
  completedTasks,
  badges 
}: Props) {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const badgeScaleAnim = badges.map(() => new Animated.Value(0));
  const [expanded, setExpanded] = React.useState(false);

  // Calculate current level and points
  const calculateLevelAndPoints = () => {
    let levelIndex = 0;
    let points = 0;
    let remainingTasks = completedTasks;

    // Calculate points and determine current level
    for (let i = 0; i < LEVELS.length; i++) {
      const level = LEVELS[i];
      if (remainingTasks <= 0) break;

      if (i === LEVELS.length - 1 || remainingTasks < LEVELS[i + 1].tasksRequired) {
        // Add points for remaining tasks at current level rate
        points += remainingTasks * level.pointsPerTask;
        levelIndex = i;
        break;
      } else {
        // Add points for all tasks in this level range
        const tasksInLevel = LEVELS[i + 1].tasksRequired - level.tasksRequired;
        points += tasksInLevel * level.pointsPerTask;
        remainingTasks -= tasksInLevel;
        levelIndex = i + 1;
      }
    }

    return {
      currentLevel: LEVELS[levelIndex],
      nextLevel: LEVELS[levelIndex + 1],
      points,
      levelIndex
    };
  };

  const { currentLevel, nextLevel, points, levelIndex } = calculateLevelAndPoints();
  const progressPercentage = nextLevel 
    ? Math.min(((completedTasks - currentLevel.tasksRequired) / 
               (nextLevel.tasksRequired - currentLevel.tasksRequired)) * 100, 100)
    : 100;

  // Animate progress when completedTasks changes
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [completedTasks, progressPercentage]);

  React.useEffect(() => {
    // Main entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Staggered badge animations
      Animated.stagger(
        100,
        badgeScaleAnim.map(anim => 
          Animated.spring(anim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          })
        )
      ).start();
    });
  }, []);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }] 
        }
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          {/* Header with level info */}
          <TouchableOpacity onPress={toggleExpand} style={styles.header}>
            <View style={styles.levelIconContainer}>
              <Text style={[styles.levelIcon, { fontSize: 32 }]}>
                {currentLevel.icon}
              </Text>
            </View>
            <View style={styles.titleContainer}>
              <Text variant="titleLarge" style={styles.title}>
                {currentLevel.name} LEVEL
              </Text>
              <Animated.View style={styles.pointsContainer}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.points}>{points} pts</Text>
              </Animated.View>
            </View>
            <ChevronRight 
              size={24} 
              color={customTheme.colors.onSurface} 
              style={[styles.chevron, expanded && styles.chevronRotated]}
            />
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { 
                    width: animatedWidth,
                    backgroundColor: currentLevel.color
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedTasks} / {nextLevel?.tasksRequired || '∞'} Tasks
            </Text>
          </View>

          {/* Badges section */}
          {badges.length > 0 && (
            <View style={styles.badgesSection}>
              <Text style={styles.sectionTitle}>Your Badges</Text>
              <View style={styles.badgesGrid}>
                {badges.map((badge, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.badgeItem,
                      { 
                        transform: [{ scale: badgeScaleAnim[index] }],
                        borderColor: currentLevel.color
                      }
                    ]}
                  >
                    <Trophy size={24} color={currentLevel.color} />
                    <Text style={styles.badgeName} numberOfLines={1}>
                      {badge.name}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* Expanded perks section */}
          {expanded && (
            <Animated.View 
              style={[
                styles.perksSection,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.sectionTitle}>Next Level Perks</Text>
              {nextLevel ? (
                nextLevel.perks.map((perk, index) => (
                  <View key={index} style={styles.perkItem}>
                    <Star size={16} color={nextLevel.color} />
                    <Text style={styles.perkText}>{perk}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.maxLevelText}>You've reached the highest level!</Text>
              )}
            </Animated.View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelIcon: {
    textAlign: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: customTheme.colors.onSurface,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  points: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 8,
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: customTheme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  badgesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: customTheme.colors.onSurface,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: (width - 80) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: customTheme.colors.surface,
    borderWidth: 1,
  },
  badgeName: {
    marginTop: 8,
    fontSize: 12,
    color: customTheme.colors.onSurface,
    fontWeight: '500',
    textAlign: 'center',
  },
  perksSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  perkText: {
    marginLeft: 8,
    color: customTheme.colors.onSurface,
  },
  maxLevelText: {
    color: customTheme.colors.onSurface,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});