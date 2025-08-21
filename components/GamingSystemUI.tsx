import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { gamingSystem } from '@/utils/gamingSystem';

const { width, height } = Dimensions.get('window');

interface GamingSystemUIProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function GamingSystemUI({ isVisible, onClose }: GamingSystemUIProps) {
  const [userStats, setUserStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'challenges' | 'leaderboard'>('stats');
  const [levelProgress, setLevelProgress] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      loadGamingData();
    }
  }, [isVisible]);

  const loadGamingData = async () => {
    try {
      const stats = gamingSystem.getUserStats();
      const completedAchievements = gamingSystem.getCompletedAchievements();
      const activeChallenges = gamingSystem.getActiveChallenges();
      const progress = gamingSystem.getLevelProgress();

      setUserStats(stats);
      setAchievements(completedAchievements);
      setChallenges(activeChallenges);
      setLevelProgress(progress);
    } catch (error) {
      console.error('Error loading gaming data:', error);
    }
  };

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Level Progress */}
      <View style={styles.levelCard}>
        <LinearGradient
          colors={['#ff6b6b', '#4ecdc4']}
          style={styles.levelGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.levelContent}>
            <Text style={styles.levelTitle}>Level {userStats?.level || 1}</Text>
            <Text style={styles.levelSubtitle}>{userStats?.totalPoints || 0} Points</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${levelProgress?.percentage || 0}%`,
                      backgroundColor: '#fff'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {levelProgress?.current || 0} / {levelProgress?.next || 100} XP
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="camera" size={24} color="#ff6b6b" />
          <Text style={styles.statNumber}>{userStats?.totalPosts || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="book" size={24} color="#4ecdc4" />
          <Text style={styles.statNumber}>{userStats?.totalStories || 0}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="heart" size={24} color="#ffd700" />
          <Text style={styles.statNumber}>{userStats?.totalReactions || 0}</Text>
          <Text style={styles.statLabel}>Reactions</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="eye" size={24} color="#45b7d1" />
          <Text style={styles.statNumber}>{userStats?.totalViews || 0}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
      </View>

      {/* Streaks */}
      <View style={styles.streaksSection}>
        <Text style={styles.sectionTitle}>Current Streaks</Text>
        {userStats?.streaks?.map((streak: any, index: number) => (
          <View key={index} style={styles.streakItem}>
            <View style={styles.streakIcon}>
              <Ionicons 
                name={getStreakIcon(streak.type)} 
                size={20} 
                color="#ff6b6b" 
              />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakName}>{getStreakName(streak.type)}</Text>
              <Text style={styles.streakCount}>{streak.current} days</Text>
            </View>
            <View style={styles.streakMultiplier}>
              <Text style={styles.multiplierText}>x{streak.multiplier}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>Badges Earned</Text>
        <View style={styles.badgesGrid}>
          {userStats?.badges?.map((badge: string, index: number) => (
            <View key={index} style={styles.badgeItem}>
              <View style={styles.badgeIcon}>
                <Ionicons name={getBadgeIcon(badge)} size={24} color="#ffd700" />
              </View>
              <Text style={styles.badgeName}>{badge}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderAchievementsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {achievements.map((achievement, index) => (
        <View key={achievement.id} style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            <Text style={styles.achievementReward}>Reward: {achievement.reward}</Text>
          </View>
          <View style={styles.achievementStatus}>
            <Ionicons name="checkmark-circle" size={24} color="#4ecdc4" />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderChallengesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {challenges.map((challenge, index) => (
        <View key={challenge.id} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeName}>{challenge.name}</Text>
            <Text style={styles.challengeType}>{challenge.type}</Text>
          </View>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          
          {/* Progress Bar */}
          <View style={styles.challengeProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(challenge.progress / challenge.requirement.count) * 100}%`,
                    backgroundColor: '#ff6b6b'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {challenge.progress} / {challenge.requirement.count}
            </Text>
          </View>
          
          <View style={styles.challengeReward}>
            <Text style={styles.rewardText}>Reward: {challenge.reward.points} points</Text>
            {challenge.reward.badge && (
              <Text style={styles.rewardText}>+ {challenge.reward.badge} badge</Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboardTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.leaderboardCard}>
        <Text style={styles.leaderboardTitle}>Top Players</Text>
        {getLeaderboardData().map((player, index) => (
          <View key={index} style={styles.leaderboardItem}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.username}</Text>
              <Text style={styles.playerLevel}>Level {player.level}</Text>
            </View>
            <View style={styles.playerScore}>
              <Text style={styles.scoreText}>{player.points} pts</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'daily_posts': return 'camera';
      case 'daily_stories': return 'book';
      case 'daily_reactions': return 'heart';
      case 'daily_views': return 'eye';
      default: return 'flame';
    }
  };

  const getStreakName = (type: string) => {
    switch (type) {
      case 'daily_posts': return 'Posting Streak';
      case 'daily_stories': return 'Story Streak';
      case 'daily_reactions': return 'Reaction Streak';
      case 'daily_views': return 'Viewing Streak';
      default: return 'Streak';
    }
  };

  const getBadgeIcon = (badge: string) => {
    if (badge.includes('Fire')) return 'flame';
    if (badge.includes('Crown')) return 'crown';
    if (badge.includes('Star')) return 'star';
    if (badge.includes('Heart')) return 'heart';
    return 'trophy';
  };

  const getLeaderboardData = () => {
    return [
      { username: 'PixelMaster', level: 15, points: 2500 },
      { username: 'StoryTeller', level: 12, points: 2100 },
      { username: 'ReactionKing', level: 10, points: 1800 },
      { username: 'ViewMaster', level: 8, points: 1500 },
      { username: 'CreativePro', level: 6, points: 1200 },
    ];
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gaming System</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadGamingData}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {[
            { key: 'stats', name: 'Stats', icon: 'stats-chart' },
            { key: 'achievements', name: 'Achievements', icon: 'trophy' },
            { key: 'challenges', name: 'Challenges', icon: 'flag' },
            { key: 'leaderboard', name: 'Leaderboard', icon: 'podium' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'achievements' && renderAchievementsTab()}
        {activeTab === 'challenges' && renderChallengesTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 10,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  tabButtonText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
  },
  levelCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: 20,
  },
  levelContent: {
    alignItems: 'center',
  },
  levelTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 15,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
  },
  streaksSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  streakInfo: {
    flex: 1,
  },
  streakName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakCount: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  streakMultiplier: {
    backgroundColor: '#ff6b6b',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  multiplierText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgesSection: {
    marginBottom: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    width: (width - 80) / 3,
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  badgeName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDescription: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  achievementReward: {
    color: '#ffd700',
    fontSize: 12,
    marginTop: 5,
  },
  achievementStatus: {
    marginLeft: 10,
  },
  challengeCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeType: {
    color: '#ff6b6b',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  challengeDescription: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 15,
  },
  challengeProgress: {
    marginBottom: 15,
  },
  challengeReward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardText: {
    color: '#ffd700',
    fontSize: 12,
  },
  leaderboardCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  leaderboardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerLevel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  playerScore: {
    marginLeft: 15,
  },
  scoreText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 