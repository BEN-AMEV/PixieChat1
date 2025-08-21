import AsyncStorage from '@react-native-async-storage/async-storage';

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'social' | 'creative' | 'explorer' | 'special';
  requirement: number;
  current: number;
  completed: boolean;
  reward?: string;
  unlockedAt?: number;
}

// Challenge types
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'location' | 'creative' | 'social';
  requirement: {
    type: 'posts' | 'reactions' | 'views' | 'locations' | 'friends';
    count: number;
    timeframe?: number; // in hours
  };
  reward: {
    points: number;
    badge?: string;
    unlock?: string;
  };
  progress: number;
  completed: boolean;
  expiresAt: number;
}

// Streak system
export interface Streak {
  type: 'daily_posts' | 'daily_stories' | 'daily_reactions' | 'daily_views';
  current: number;
  longest: number;
  lastActivity: number;
  multiplier: number;
}

// User stats
export interface UserStats {
  totalPosts: number;
  totalStories: number;
  totalReactions: number;
  totalViews: number;
  totalPoints: number;
  level: number;
  experience: number;
  achievements: Achievement[];
  challenges: Challenge[];
  streaks: Streak[];
  badges: string[];
}

// Gaming system manager
export class GamingSystem {
  private userStats!: UserStats;
  private achievements: Achievement[] = [];
  private challenges: Challenge[] = [];

  constructor() {
    this.initializeAchievements();
    this.initializeChallenges();
    this.loadUserStats();
  }

  private initializeAchievements() {
    this.achievements = [
      // Streak achievements
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day posting streak',
        icon: '🔥',
        category: 'streak',
        requirement: 7,
        current: 0,
        completed: false,
        reward: '50 points + Fire badge',
      },
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day posting streak',
        icon: '👑',
        category: 'streak',
        requirement: 30,
        current: 0,
        completed: false,
        reward: '200 points + Crown badge',
      },
      {
        id: 'streak_100',
        name: 'Century Club',
        description: 'Maintain a 100-day posting streak',
        icon: '💎',
        category: 'streak',
        requirement: 100,
        current: 0,
        completed: false,
        reward: '500 points + Diamond badge',
      },

      // Social achievements
      {
        id: 'friends_50',
        name: 'Social Butterfly',
        description: 'Connect with 50 friends',
        icon: '🦋',
        category: 'social',
        requirement: 50,
        current: 0,
        completed: false,
        reward: '100 points + Butterfly badge',
      },
      {
        id: 'reactions_1000',
        name: 'Reaction King',
        description: 'Receive 1000 reactions',
        icon: '👑',
        category: 'social',
        requirement: 1000,
        current: 0,
        completed: false,
        reward: '150 points + Crown badge',
      },

      // Creative achievements
      {
        id: 'posts_100',
        name: 'Content Creator',
        description: 'Post 100 pieces of content',
        icon: '📸',
        category: 'creative',
        requirement: 100,
        current: 0,
        completed: false,
        reward: '100 points + Camera badge',
      },
      {
        id: 'stories_50',
        name: 'Storyteller',
        description: 'Create 50 stories',
        icon: '📖',
        category: 'creative',
        requirement: 50,
        current: 0,
        completed: false,
        reward: '75 points + Book badge',
      },

      // Explorer achievements
      {
        id: 'locations_20',
        name: 'World Traveler',
        description: 'Post from 20 different locations',
        icon: '🌍',
        category: 'explorer',
        requirement: 20,
        current: 0,
        completed: false,
        reward: '200 points + Globe badge',
      },
      {
        id: 'cities_10',
        name: 'City Hopper',
        description: 'Post from 10 different cities',
        icon: '🏙️',
        category: 'explorer',
        requirement: 10,
        current: 0,
        completed: false,
        reward: '150 points + City badge',
      },

      // Special achievements
      {
        id: 'first_post',
        name: 'First Steps',
        description: 'Make your first post',
        icon: '👶',
        category: 'special',
        requirement: 1,
        current: 0,
        completed: false,
        reward: '10 points + Baby badge',
      },
      {
        id: 'viral_post',
        name: 'Viral Sensation',
        description: 'Get 1000+ views on a single post',
        icon: '🚀',
        category: 'special',
        requirement: 1000,
        current: 0,
        completed: false,
        reward: '300 points + Rocket badge',
      },
    ];
  }

  private initializeChallenges() {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const weekInMs = 7 * dayInMs;

    this.challenges = [
      // Daily challenges
      {
        id: 'daily_post',
        name: 'Daily Dose',
        description: 'Post something today',
        type: 'daily',
        requirement: { type: 'posts', count: 1, timeframe: 24 },
        reward: { points: 10 },
        progress: 0,
        completed: false,
        expiresAt: now + dayInMs,
      },
      {
        id: 'daily_story',
        name: 'Story Time',
        description: 'Create a story today',
        type: 'daily',
        requirement: { type: 'posts', count: 1, timeframe: 24 },
        reward: { points: 15 },
        progress: 0,
        completed: false,
        expiresAt: now + dayInMs,
      },
      {
        id: 'daily_reactions',
        name: 'Reaction Master',
        description: 'React to 10 posts today',
        type: 'daily',
        requirement: { type: 'reactions', count: 10, timeframe: 24 },
        reward: { points: 20 },
        progress: 0,
        completed: false,
        expiresAt: now + dayInMs,
      },

      // Weekly challenges
      {
        id: 'weekly_posts',
        name: 'Weekly Warrior',
        description: 'Post 7 times this week',
        type: 'weekly',
        requirement: { type: 'posts', count: 7, timeframe: 168 },
        reward: { points: 50, badge: 'Weekly Warrior' },
        progress: 0,
        completed: false,
        expiresAt: now + weekInMs,
      },
      {
        id: 'weekly_views',
        name: 'View Collector',
        description: 'Get 500 views this week',
        type: 'weekly',
        requirement: { type: 'views', count: 500, timeframe: 168 },
        reward: { points: 75, badge: 'View Collector' },
        progress: 0,
        completed: false,
        expiresAt: now + weekInMs,
      },

      // Location challenges
      {
        id: 'location_explorer',
        name: 'Location Explorer',
        description: 'Post from 3 different locations today',
        type: 'location',
        requirement: { type: 'locations', count: 3, timeframe: 24 },
        reward: { points: 30, badge: 'Explorer' },
        progress: 0,
        completed: false,
        expiresAt: now + dayInMs,
      },

      // Creative challenges
      {
        id: 'creative_story',
        name: 'Creative Storyteller',
        description: 'Create a story with 5+ media items',
        type: 'creative',
        requirement: { type: 'posts', count: 1, timeframe: 24 },
        reward: { points: 25, badge: 'Creative' },
        progress: 0,
        completed: false,
        expiresAt: now + dayInMs,
      },

      // Social challenges
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Interact with 20 different friends today',
        type: 'social',
        requirement: { type: 'friends', count: 20, timeframe: 24 },
        reward: { points: 40, badge: 'Social' },
        progress: 0,
        completed: false,
        expiresAt: now + dayInMs,
      },
    ];
  }

  private async loadUserStats() {
    try {
      const stats = await AsyncStorage.getItem('userGamingStats');
      if (stats) {
        this.userStats = JSON.parse(stats);
      } else {
        this.userStats = {
          totalPosts: 0,
          totalStories: 0,
          totalReactions: 0,
          totalViews: 0,
          totalPoints: 0,
          level: 1,
          experience: 0,
          achievements: [...this.achievements],
          challenges: [...this.challenges],
          streaks: [
            { type: 'daily_posts', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
            { type: 'daily_stories', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
            { type: 'daily_reactions', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
            { type: 'daily_views', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
          ],
          badges: [],
        };
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      this.userStats = {
        totalPosts: 0,
        totalStories: 0,
        totalReactions: 0,
        totalViews: 0,
        totalPoints: 0,
        level: 1,
        experience: 0,
        achievements: [...this.achievements],
        challenges: [...this.challenges],
        streaks: [
          { type: 'daily_posts', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
          { type: 'daily_stories', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
          { type: 'daily_reactions', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
          { type: 'daily_views', current: 0, longest: 0, lastActivity: 0, multiplier: 1 },
        ],
        badges: [],
      };
    }
  }

  private async saveUserStats() {
    try {
      await AsyncStorage.setItem('userGamingStats', JSON.stringify(this.userStats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  // Record user activity
  public async recordActivity(activityType: 'post' | 'story' | 'reaction' | 'view', data?: any) {
    const now = Date.now();
    
    switch (activityType) {
      case 'post':
        this.userStats.totalPosts++;
        this.updateStreak('daily_posts', now);
        this.updateChallenges('posts', 1);
        this.addExperience(10);
        break;
      case 'story':
        this.userStats.totalStories++;
        this.updateStreak('daily_stories', now);
        this.updateChallenges('posts', 1);
        this.addExperience(15);
        break;
      case 'reaction':
        this.userStats.totalReactions++;
        this.updateStreak('daily_reactions', now);
        this.updateChallenges('reactions', 1);
        this.addExperience(5);
        break;
      case 'view':
        this.userStats.totalViews++;
        this.updateStreak('daily_views', now);
        this.updateChallenges('views', 1);
        this.addExperience(1);
        break;
    }

    this.checkAchievements();
    await this.saveUserStats();
  }

  private updateStreak(streakType: string, timestamp: number) {
    const streak = this.userStats.streaks.find(s => s.type === streakType);
    if (!streak) return;

    const dayInMs = 24 * 60 * 60 * 1000;
    const timeDiff = timestamp - streak.lastActivity;

    if (timeDiff <= dayInMs) {
      // Continue streak
      streak.current++;
      streak.multiplier = Math.min(5, 1 + Math.floor(streak.current / 7));
    } else if (timeDiff <= 2 * dayInMs) {
      // Continue streak (within grace period)
      streak.current++;
      streak.multiplier = Math.min(5, 1 + Math.floor(streak.current / 7));
    } else {
      // Reset streak
      streak.current = 1;
      streak.multiplier = 1;
    }

    streak.lastActivity = timestamp;
    if (streak.current > streak.longest) {
      streak.longest = streak.current;
    }
  }

  private updateChallenges(requirementType: string, count: number) {
    this.userStats.challenges.forEach(challenge => {
      if (challenge.requirement.type === requirementType && !challenge.completed) {
        challenge.progress += count;
        if (challenge.progress >= challenge.requirement.count) {
          challenge.completed = true;
          this.addPoints(challenge.reward.points);
          if (challenge.reward.badge) {
            this.addBadge(challenge.reward.badge);
          }
        }
      }
    });
  }

  private checkAchievements() {
    this.userStats.achievements.forEach(achievement => {
      if (achievement.completed) return;

      switch (achievement.id) {
        case 'streak_7':
          achievement.current = this.userStats.streaks.find(s => s.type === 'daily_posts')?.current || 0;
          break;
        case 'streak_30':
          achievement.current = this.userStats.streaks.find(s => s.type === 'daily_posts')?.current || 0;
          break;
        case 'streak_100':
          achievement.current = this.userStats.streaks.find(s => s.type === 'daily_posts')?.current || 0;
          break;
        case 'posts_100':
          achievement.current = this.userStats.totalPosts;
          break;
        case 'stories_50':
          achievement.current = this.userStats.totalStories;
          break;
        case 'reactions_1000':
          achievement.current = this.userStats.totalReactions;
          break;
        case 'first_post':
          achievement.current = this.userStats.totalPosts;
          break;
      }

      if (achievement.current >= achievement.requirement && !achievement.completed) {
        achievement.completed = true;
        achievement.unlockedAt = Date.now();
        const rewardPoints = achievement.reward?.split(' ')[0];
        this.addPoints(rewardPoints ? parseInt(rewardPoints) : 50);
        if (achievement.reward?.includes('badge')) {
          const badgeName = achievement.reward.split('+ ')[1];
          if (badgeName) {
            this.addBadge(badgeName);
          }
        }
      }
    });
  }

  private addExperience(amount: number) {
    this.userStats.experience += amount;
    const experienceNeeded = this.userStats.level * 100;
    
    if (this.userStats.experience >= experienceNeeded) {
      this.userStats.level++;
      this.userStats.experience -= experienceNeeded;
      this.addPoints(25); // Level up bonus
    }
  }

  private addPoints(amount: number) {
    this.userStats.totalPoints += amount;
  }

  private addBadge(badgeName: string) {
    if (!this.userStats.badges.includes(badgeName)) {
      this.userStats.badges.push(badgeName);
    }
  }

  // Get user stats
  public getUserStats(): UserStats {
    return { ...this.userStats };
  }

  // Get active challenges
  public getActiveChallenges(): Challenge[] {
    const now = Date.now();
    return this.userStats.challenges.filter(challenge => 
      !challenge.completed && challenge.expiresAt > now
    );
  }

  // Get completed achievements
  public getCompletedAchievements(): Achievement[] {
    return this.userStats.achievements.filter(achievement => achievement.completed);
  }

  // Get current streaks
  public getCurrentStreaks(): Streak[] {
    return this.userStats.streaks;
  }

  // Get level progress
  public getLevelProgress(): { current: number; next: number; percentage: number } {
    const experienceNeeded = this.userStats.level * 100;
    const percentage = (this.userStats.experience / experienceNeeded) * 100;
    
    return {
      current: this.userStats.experience,
      next: experienceNeeded,
      percentage: Math.min(100, percentage),
    };
  }

  // Create location-based challenge
  public createLocationChallenge(location: string, radius: number): Challenge {
    return {
      id: `location_${Date.now()}`,
      name: `Explore ${location}`,
      description: `Post from within ${radius}m of ${location}`,
      type: 'location',
      requirement: { type: 'locations', count: 1, timeframe: 24 },
      reward: { points: 30, badge: 'Explorer' },
      progress: 0,
      completed: false,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000),
    };
  }

  // Get leaderboard data (mock)
  public getLeaderboardData(): Array<{ username: string; points: number; level: number }> {
    return [
      { username: 'User1', points: 1250, level: 12 },
      { username: 'User2', points: 980, level: 10 },
      { username: 'User3', points: 850, level: 9 },
      { username: 'User4', points: 720, level: 8 },
      { username: 'User5', points: 650, level: 7 },
    ];
  }
}

// Global gaming system instance
export const gamingSystem = new GamingSystem(); 