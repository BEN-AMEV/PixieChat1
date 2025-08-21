import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Content types
export interface ContentItem {
  id: string;
  type: 'photo' | 'video' | 'story';
  uri: string;
  caption?: string;
  timestamp: number;
  scheduledTime?: number;
  engagement?: {
    views: number;
    reactions: number;
    shares: number;
  };
}

// Optimal posting times based on user activity patterns
export interface OptimalTime {
  hour: number;
  minute: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  confidence: number;
  description: string;
}

// Smart scheduling manager
export class SmartScheduler {
  private userActivityPatterns: any = {};
  private optimalTimes: OptimalTime[] = [];
  private scheduledContent: ContentItem[] = [];

  constructor() {
    this.initializeOptimalTimes();
    this.loadUserPatterns();
    this.loadScheduledContent();
  }

  private initializeOptimalTimes() {
    // Default optimal times based on general social media patterns
    this.optimalTimes = [
      { hour: 9, minute: 0, dayOfWeek: 1, confidence: 0.9, description: 'Monday morning motivation' },
      { hour: 12, minute: 30, dayOfWeek: 1, confidence: 0.8, description: 'Lunch break engagement' },
      { hour: 18, minute: 0, dayOfWeek: 1, confidence: 0.85, description: 'After work relaxation' },
      { hour: 20, minute: 0, dayOfWeek: 1, confidence: 0.9, description: 'Evening social time' },
      
      { hour: 8, minute: 30, dayOfWeek: 2, confidence: 0.8, description: 'Tuesday start' },
      { hour: 17, minute: 30, dayOfWeek: 2, confidence: 0.85, description: 'Pre-dinner engagement' },
      
      { hour: 10, minute: 0, dayOfWeek: 3, confidence: 0.8, description: 'Midweek boost' },
      { hour: 19, minute: 30, dayOfWeek: 3, confidence: 0.9, description: 'Wednesday night vibes' },
      
      { hour: 9, minute: 30, dayOfWeek: 4, confidence: 0.8, description: 'Thursday motivation' },
      { hour: 18, minute: 30, dayOfWeek: 4, confidence: 0.85, description: 'Almost weekend' },
      
      { hour: 8, minute: 0, dayOfWeek: 5, confidence: 0.9, description: 'Friday excitement' },
      { hour: 16, minute: 0, dayOfWeek: 5, confidence: 0.95, description: 'Weekend anticipation' },
      { hour: 21, minute: 0, dayOfWeek: 5, confidence: 0.9, description: 'Friday night fun' },
      
      { hour: 11, minute: 0, dayOfWeek: 6, confidence: 0.85, description: 'Saturday morning' },
      { hour: 15, minute: 0, dayOfWeek: 6, confidence: 0.8, description: 'Weekend activities' },
      { hour: 20, minute: 30, dayOfWeek: 6, confidence: 0.9, description: 'Saturday night' },
      
      { hour: 10, minute: 30, dayOfWeek: 0, confidence: 0.7, description: 'Sunday relaxation' },
      { hour: 14, minute: 0, dayOfWeek: 0, confidence: 0.75, description: 'Sunday afternoon' },
      { hour: 19, minute: 0, dayOfWeek: 0, confidence: 0.8, description: 'Sunday evening prep' },
    ];
  }

  private async loadUserPatterns() {
    try {
      const patterns = await AsyncStorage.getItem('userActivityPatterns');
      if (patterns) {
        this.userActivityPatterns = JSON.parse(patterns);
      }
    } catch (error) {
      console.error('Error loading user patterns:', error);
    }
  }

  private async loadScheduledContent() {
    try {
      const content = await AsyncStorage.getItem('scheduledContent');
      if (content) {
        this.scheduledContent = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading scheduled content:', error);
    }
  }

  private async saveUserPatterns() {
    try {
      await AsyncStorage.setItem('userActivityPatterns', JSON.stringify(this.userActivityPatterns));
    } catch (error) {
      console.error('Error saving user patterns:', error);
    }
  }

  private async saveScheduledContent() {
    try {
      await AsyncStorage.setItem('scheduledContent', JSON.stringify(this.scheduledContent));
    } catch (error) {
      console.error('Error saving scheduled content:', error);
    }
  }

  // Analyze user activity and update optimal times
  public async analyzeUserActivity(content: ContentItem) {
    const date = new Date(content.timestamp);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    
    // Update activity patterns
    if (!this.userActivityPatterns[dayOfWeek]) {
      this.userActivityPatterns[dayOfWeek] = {};
    }
    if (!this.userActivityPatterns[dayOfWeek][hour]) {
      this.userActivityPatterns[dayOfWeek][hour] = { count: 0, totalEngagement: 0 };
    }
    
    this.userActivityPatterns[dayOfWeek][hour].count++;
    if (content.engagement) {
      this.userActivityPatterns[dayOfWeek][hour].totalEngagement += 
        content.engagement.views + content.engagement.reactions * 2 + content.engagement.shares * 3;
    }
    
    await this.saveUserPatterns();
    this.updateOptimalTimes();
  }

  private updateOptimalTimes() {
    // Update optimal times based on user activity patterns
    this.optimalTimes = this.optimalTimes.map(time => {
      const userData = this.userActivityPatterns[time.dayOfWeek]?.[time.hour];
      if (userData && userData.count > 0) {
        const avgEngagement = userData.totalEngagement / userData.count;
        const adjustedConfidence = Math.min(0.95, time.confidence + (avgEngagement / 100));
        return { ...time, confidence: adjustedConfidence };
      }
      return time;
    });
  }

  // Get next optimal posting time
  public getNextOptimalTime(contentType: 'photo' | 'video' | 'story' = 'story'): OptimalTime | null {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    
    // Filter times that are in the future
    const futureTimes = this.optimalTimes.filter(time => {
      if (time.dayOfWeek > currentDay) return true;
      if (time.dayOfWeek === currentDay && time.hour > currentHour) return true;
      return false;
    });
    
    if (futureTimes.length === 0) {
      // If no future times today, get the best time for tomorrow
      const tomorrowTimes = this.optimalTimes.filter(time => time.dayOfWeek === (currentDay + 1) % 7);
      return tomorrowTimes.sort((a, b) => b.confidence - a.confidence)[0] || null;
    }
    
    // Return the best future time
    return futureTimes.sort((a, b) => b.confidence - a.confidence)[0] || null;
  }

  // Schedule content for optimal time
  public async scheduleContent(content: ContentItem, customTime?: Date): Promise<Date> {
    const scheduledTime = customTime || this.getScheduledTime();
    
    const scheduledContent: ContentItem = {
      ...content,
      scheduledTime: scheduledTime.getTime(),
    };
    
    this.scheduledContent.push(scheduledContent);
    await this.saveScheduledContent();
    
    return scheduledTime;
  }

  private getScheduledTime(): Date {
    const optimalTime = this.getNextOptimalTime();
    if (!optimalTime) {
      // Fallback: schedule for 2 hours from now
      const fallback = new Date();
      fallback.setHours(fallback.getHours() + 2);
      return fallback;
    }
    
    const scheduledDate = new Date();
    const daysUntilTarget = (optimalTime.dayOfWeek - scheduledDate.getDay() + 7) % 7;
    
    scheduledDate.setDate(scheduledDate.getDate() + daysUntilTarget);
    scheduledDate.setHours(optimalTime.hour, optimalTime.minute, 0, 0);
    
    return scheduledDate;
  }

  // Get scheduled content
  public getScheduledContent(): ContentItem[] {
    return [...this.scheduledContent];
  }

  // Get content suggestions based on time and context
  public getContentSuggestions(): string[] {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    const suggestions = {
      morning: [
        'Morning coffee vibes ☕',
        'New day, new opportunities ✨',
        'Breakfast goals 🍳',
        'Morning workout motivation 💪',
        'Sunrise appreciation 🌅'
      ],
      afternoon: [
        'Lunch break adventures 🍕',
        'Productive afternoon 💼',
        'Midday pick-me-up ☀️',
        'Work from anywhere vibes 💻',
        'Afternoon coffee run ☕'
      ],
      evening: [
        'Golden hour magic ✨',
        'Dinner time! 🍽️',
        'Evening relaxation 😌',
        'Sunset vibes 🌆',
        'Night out preparation 🎉'
      ],
      night: [
        'Night mode activated 🌙',
        'Late night thoughts 💭',
        'Cozy evening vibes 🛋️',
        'Night owl activities 🦉',
        'Dreamy night sky ✨'
      ],
      weekend: [
        'Weekend vibes 🎉',
        'Freedom feels ✨',
        'Weekend adventures 🚀',
        'Relaxation mode 😌',
        'Weekend goals 🎯'
      ]
    };
    
    let timeCategory = 'afternoon';
    if (hour < 12) timeCategory = 'morning';
    else if (hour < 17) timeCategory = 'afternoon';
    else if (hour < 21) timeCategory = 'evening';
    else timeCategory = 'night';
    
    const dayCategory = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
    
    return suggestions[timeCategory as keyof typeof suggestions] || suggestions.afternoon;
  }

  // Get engagement predictions
  public getEngagementPrediction(contentType: 'photo' | 'video' | 'story'): {
    predictedViews: number;
    predictedReactions: number;
    confidence: number;
  } {
    const baseViews = contentType === 'video' ? 150 : 100;
    const baseReactions = contentType === 'video' ? 25 : 15;
    
    // Adjust based on time
    const hour = new Date().getHours();
    let timeMultiplier = 1;
    if (hour >= 18 && hour <= 22) timeMultiplier = 1.3; // Evening peak
    else if (hour >= 12 && hour <= 14) timeMultiplier = 1.2; // Lunch peak
    else if (hour >= 8 && hour <= 10) timeMultiplier = 1.1; // Morning peak
    
    return {
      predictedViews: Math.round(baseViews * timeMultiplier),
      predictedReactions: Math.round(baseReactions * timeMultiplier),
      confidence: 0.7 + (timeMultiplier - 1) * 0.2
    };
  }

  // Check if it's a good time to post
  public isGoodTimeToPost(): { isGood: boolean; reason: string; score: number } {
    const optimalTime = this.getNextOptimalTime();
    const now = new Date();
    const hour = now.getHours();
    
    // Check if current time is close to optimal
    if (optimalTime && Math.abs(hour - optimalTime.hour) <= 1) {
      return {
        isGood: true,
        reason: `Great time to post! ${optimalTime.description}`,
        score: optimalTime.confidence
      };
    }
    
    // Check general good times
    const goodHours = [9, 12, 18, 20];
    const isGoodHour = goodHours.includes(hour);
    
    return {
      isGood: isGoodHour,
      reason: isGoodHour ? 'Good posting time' : 'Consider waiting for better time',
      score: isGoodHour ? 0.6 : 0.3
    };
  }
}

// Global scheduler instance
export const smartScheduler = new SmartScheduler();

// Helper function to format time
export const formatScheduledTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = timestamp - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return 'soon';
  }
}; 