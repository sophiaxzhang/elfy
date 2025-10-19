import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Task } from '../types/taskTypes';

interface ChildProgressBarProps {
  tasks: Task[];
  goalGems: number; // Goal gems set by parent
  earnedGems?: number; // Optional override for earned gems count
}

const ChildProgressBar: React.FC<ChildProgressBarProps> = ({ 
  tasks, 
  goalGems, 
  earnedGems 
}) => {
  const [progress, setProgress] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;
  const animatedProgressScale = useRef(new Animated.Value(1)).current;

  // Calculate earned gems from completed tasks
  const calculatedEarnedGems = tasks
    .filter(task => task.status === 'completed')
    .reduce((total, task) => total + task.gems, 0);
  
  const totalEarnedGems = earnedGems ?? calculatedEarnedGems;
  const progressPercentage = Math.min((totalEarnedGems / goalGems) * 100, 100);

  useEffect(() => {
    setProgress(progressPercentage);
    
    // Animate progress bar width (JS driver only)
    Animated.timing(animatedWidth, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Add a little bounce effect when progress updates (native driver)
    Animated.sequence([
      Animated.timing(animatedProgressScale, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedProgressScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle rotation animation for the candy cane (native driver)
    Animated.loop(
      Animated.timing(animatedRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [progressPercentage]);

  const getProgressColor = () => {
    if (progressPercentage >= 100) return '#10B981'; // Green for completed
    if (progressPercentage >= 75) return '#F59E0B'; // Orange for almost done
    if (progressPercentage >= 50) return '#EF4444'; // Red for halfway
    return '#8B5CF6'; // Purple for starting
  };

  const getMotivationalMessage = () => {
    if (progressPercentage >= 100) return '🎉 Goal Achieved! Amazing work!';
    if (progressPercentage >= 75) return '🔥 Almost there! Keep going!';
    if (progressPercentage >= 50) return '💪 Halfway there! You\'re doing great!';
    if (progressPercentage >= 25) return '🌟 Great start! Keep it up!';
    return '🚀 Ready to begin your journey?';
  };

  const getRewardMessage = () => {
    if (progressPercentage >= 100) return 'You\'ve earned your reward!';
    const remainingGems = goalGems - totalEarnedGems;
    return remainingGems === 1 ? '1 more gem to go!' : `${remainingGems} more gems to go!`;
  };

  const spin = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎄 My Progress 🎄</Text>
        <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
      </View>

      <View style={styles.progressContainer}>
        {/* Candy Cane Background */}
        <View style={styles.candyCaneBackground}>
          <View style={styles.candyCaneStripe} />
          <View style={[styles.candyCaneStripe, styles.whiteStripe]} />
          <View style={styles.candyCaneStripe} />
          <View style={[styles.candyCaneStripe, styles.whiteStripe]} />
          <View style={styles.candyCaneStripe} />
        </View>

        {/* Progress Fill */}
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getProgressColor(),
            },
          ]}
        >
          {/* Candy Cane Pattern Overlay */}
          <View style={styles.candyCaneOverlay}>
            <View style={styles.candyCaneStripe} />
            <View style={[styles.candyCaneStripe, styles.whiteStripe]} />
            <View style={styles.candyCaneStripe} />
            <View style={[styles.candyCaneStripe, styles.whiteStripe]} />
            <View style={styles.candyCaneStripe} />
          </View>

          {/* Sparkle Animation */}
          <Animated.View
            style={[
              styles.sparkle,
              {
                transform: [
                  { rotate: spin },
                  { scale: animatedProgressScale },
                ],
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
        </Animated.View>

        {/* Progress Text */}
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            {totalEarnedGems} / {goalGems} gems earned
          </Text>
          <Text style={styles.percentageText}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
      </View>

      {/* Reward Section */}
      <View style={styles.rewardContainer}>
        <Text style={styles.rewardText}>{getRewardMessage()}</Text>
        {progressPercentage >= 100 && (
          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationText}>🎊 🎉 🎊</Text>
            <Text style={styles.celebrationMessage}>Congratulations!</Text>
          </View>
        )}
      </View>

      {/* Progress Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalEarnedGems}</Text>
          <Text style={styles.statLabel}>Gems Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{goalGems - totalEarnedGems}</Text>
          <Text style={styles.statLabel}>Gems Needed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{goalGems}</Text>
          <Text style={styles.statLabel}>Goal Gems</Text>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const progressBarWidth = width - 40;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  candyCaneBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  candyCaneStripe: {
    height: 4,
    backgroundColor: '#EF4444',
  },
  whiteStripe: {
    backgroundColor: '#FFFFFF',
  },
  candyCaneOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 20,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  sparkle: {
    position: 'absolute',
    right: 8,
    top: 2,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleText: {
    fontSize: 12,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  rewardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationContainer: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  celebrationText: {
    fontSize: 20,
    marginBottom: 4,
  },
  celebrationMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
});

export default ChildProgressBar;
