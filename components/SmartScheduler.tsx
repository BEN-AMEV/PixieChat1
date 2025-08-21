import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { smartScheduler, formatScheduledTime } from '../utils/smartScheduling';

const { width, height } = Dimensions.get('window');

interface SmartSchedulerProps {
  isVisible: boolean;
  onClose: () => void;
  onSchedule?: (scheduledTime: Date) => void;
}

export default function SmartScheduler({ isVisible, onClose, onSchedule }: SmartSchedulerProps) {
  const [optimalTime, setOptimalTime] = useState<any>(null);
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);
  const [engagementPrediction, setEngagementPrediction] = useState<any>(null);
  const [postingTime, setPostingTime] = useState<any>(null);
  const [scheduledContent, setScheduledContent] = useState<any[]>([]);

  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  const loadData = () => {
    const nextOptimal = smartScheduler.getNextOptimalTime();
    setOptimalTime(nextOptimal);
    
    const suggestions = smartScheduler.getContentSuggestions();
    setContentSuggestions(suggestions);
    
    const prediction = smartScheduler.getEngagementPrediction('story');
    setEngagementPrediction(prediction);
    
    const timeCheck = smartScheduler.isGoodTimeToPost();
    setPostingTime(timeCheck);
    
    const scheduled = smartScheduler.getScheduledContent();
    setScheduledContent(scheduled);
  };

  const scheduleForOptimalTime = () => {
    if (optimalTime) {
      const scheduledTime = new Date();
      const daysUntilTarget = (optimalTime.dayOfWeek - scheduledTime.getDay() + 7) % 7;
      
      scheduledTime.setDate(scheduledTime.getDate() + daysUntilTarget);
      scheduledTime.setHours(optimalTime.hour, optimalTime.minute, 0, 0);
      
      onSchedule?.(scheduledTime);
      Alert.alert(
        'Content Scheduled!',
        `Your content will be posted at ${scheduledTime.toLocaleString()}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  const scheduleForNow = () => {
    const now = new Date();
    onSchedule?.(now);
    Alert.alert(
      'Content Posted!',
      'Your content has been posted immediately.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const renderOptimalTimeCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="time" size={24} color="#4ecdc4" />
        <Text style={styles.cardTitle}>Next Optimal Time</Text>
      </View>
      {optimalTime ? (
        <View style={styles.optimalTimeContent}>
          <Text style={styles.optimalTimeText}>
            {getDayName(optimalTime.dayOfWeek)} at {formatTime(optimalTime.hour, optimalTime.minute)}
          </Text>
          <Text style={styles.optimalTimeDescription}>{optimalTime.description}</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill, 
                { width: `${optimalTime.confidence * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.confidenceText}>
            {Math.round(optimalTime.confidence * 100)}% confidence
          </Text>
        </View>
      ) : (
        <Text style={styles.noDataText}>No optimal time available</Text>
      )}
    </View>
  );

  const renderEngagementPrediction = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="trending-up" size={24} color="#ff6b6b" />
        <Text style={styles.cardTitle}>Engagement Prediction</Text>
      </View>
      {engagementPrediction ? (
        <View style={styles.predictionContent}>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Predicted Views:</Text>
            <Text style={styles.predictionValue}>{engagementPrediction.predictedViews}</Text>
          </View>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Predicted Reactions:</Text>
            <Text style={styles.predictionValue}>{engagementPrediction.predictedReactions}</Text>
          </View>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Confidence:</Text>
            <Text style={styles.predictionValue}>
              {Math.round(engagementPrediction.confidence * 100)}%
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No prediction available</Text>
      )}
    </View>
  );

  const renderPostingTimeCheck = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons 
          name={postingTime?.isGood ? "checkmark-circle" : "alert-circle"} 
          size={24} 
          color={postingTime?.isGood ? "#4ecdc4" : "#ffa726"} 
        />
        <Text style={styles.cardTitle}>Current Time Check</Text>
      </View>
      {postingTime ? (
        <View style={styles.timeCheckContent}>
          <Text style={[
            styles.timeCheckStatus,
            { color: postingTime.isGood ? '#4ecdc4' : '#ffa726' }
          ]}>
            {postingTime.isGood ? 'Good time to post!' : 'Consider waiting'}
          </Text>
          <Text style={styles.timeCheckReason}>{postingTime.reason}</Text>
          <View style={styles.scoreBar}>
            <View 
              style={[
                styles.scoreFill, 
                { 
                  width: `${postingTime.score * 100}%`,
                  backgroundColor: postingTime.isGood ? '#4ecdc4' : '#ffa726'
                }
              ]} 
            />
          </View>
          <Text style={styles.scoreText}>
            Score: {Math.round(postingTime.score * 100)}%
          </Text>
        </View>
      ) : (
        <Text style={styles.noDataText}>No time check available</Text>
      )}
    </View>
  );

  const renderContentSuggestions = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="bulb" size={24} color="#ffd93d" />
        <Text style={styles.cardTitle}>Content Suggestions</Text>
      </View>
      <ScrollView style={styles.suggestionsContainer}>
        {contentSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionItem}
            onPress={() => Alert.alert('Suggestion', suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
            <Ionicons name="copy-outline" size={16} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderScheduledContent = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="calendar" size={24} color="#9c88ff" />
        <Text style={styles.cardTitle}>Scheduled Content</Text>
      </View>
      {scheduledContent.length > 0 ? (
        <ScrollView style={styles.scheduledContainer}>
          {scheduledContent.map((content, index) => (
            <View key={index} style={styles.scheduledItem}>
              <Text style={styles.scheduledTime}>
                {formatScheduledTime(content.scheduledTime)}
              </Text>
              <Text style={styles.scheduledType}>{content.type}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noDataText}>No scheduled content</Text>
      )}
    </View>
  );

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Smart Scheduler</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderOptimalTimeCard()}
            {renderEngagementPrediction()}
            {renderPostingTimeCheck()}
            {renderContentSuggestions()}
            {renderScheduledContent()}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.scheduleButton} onPress={scheduleForOptimalTime}>
              <Ionicons name="time" size={20} color="white" />
              <Text style={styles.scheduleButtonText}>Schedule for Optimal Time</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postNowButton} onPress={scheduleForNow}>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.postNowButtonText}>Post Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.95,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    flex: 1,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  optimalTimeContent: {
    alignItems: 'center',
  },
  optimalTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 5,
  },
  optimalTimeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 5,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
  },
  predictionContent: {
    gap: 8,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 14,
    color: '#666',
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  timeCheckContent: {
    alignItems: 'center',
  },
  timeCheckStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timeCheckReason: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 5,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
  },
  suggestionsContainer: {
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 5,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  scheduledContainer: {
    maxHeight: 100,
  },
  scheduledItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 5,
  },
  scheduledTime: {
    fontSize: 14,
    color: '#333',
  },
  scheduledType: {
    fontSize: 12,
    color: '#666',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: '#4ecdc4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  postNowButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postNowButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
}); 