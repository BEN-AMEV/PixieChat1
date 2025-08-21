import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

interface StoryReactionsProps {
  storyId: string;
  onReactionAdd?: (reaction: string) => void;
  isVisible: boolean;
}

const reactionEmojis = [
  '❤️', '🔥', '😍', '😂', '😮', '😢', '😡', '🤔', '👏', '🙌',
  '💯', '✨', '🎉', '🚀', '💪', '🤯', '🥺', '😎', '🤩', '💖'
];

export default function StoryReactions({ storyId, onReactionAdd, isVisible }: StoryReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionIdCounter = useRef(0);

  const addReaction = (emoji: string, x: number, y: number) => {
    const newReaction: Reaction = {
      id: `reaction_${reactionIdCounter.current++}`,
      emoji,
      x: x - 25, // Center the emoji
      y: y - 25,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotation: new Animated.Value(0),
    };

    setReactions(prev => [...prev, newReaction]);

    // Animate the reaction appearing
    Animated.parallel([
      Animated.spring(newReaction.scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(newReaction.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(newReaction.rotation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Remove reaction after 3 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(newReaction.scale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(newReaction.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setReactions(prev => prev.filter(r => r.id !== newReaction.id));
      });
    }, 3000);

    onReactionAdd?.(emoji);
  };

  const handleStoryPress = (event: any) => {
    if (showReactionPicker) {
      const { locationX, locationY } = event.nativeEvent;
      const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
      addReaction(randomEmoji, locationX, locationY);
      setShowReactionPicker(false);
    }
  };

  const toggleReactionPicker = () => {
    setShowReactionPicker(!showReactionPicker);
  };

  const renderReactionPicker = () => {
    if (!showReactionPicker) return null;

    return (
      <View style={styles.reactionPicker}>
        <Text style={styles.pickerTitle}>Tap story to add reaction</Text>
        <View style={styles.emojiGrid}>
          {reactionEmojis.slice(0, 10).map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiButton}
              onPress={() => {
                const randomX = Math.random() * (width - 50) + 25;
                const randomY = Math.random() * (height * 0.6) + height * 0.2;
                addReaction(emoji, randomX, randomY);
                setShowReactionPicker(false);
              }}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFloatingReactions = () => {
    return reactions.map((reaction) => (
      <Animated.View
        key={reaction.id}
        style={[
          styles.floatingReaction,
          {
            left: reaction.x,
            top: reaction.y,
            transform: [
              { scale: reaction.scale },
              {
                rotate: reaction.rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            opacity: reaction.opacity,
          },
        ]}
      >
        <Text style={styles.floatingEmoji}>{reaction.emoji}</Text>
      </Animated.View>
    ));
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.storyArea}
        onPress={handleStoryPress}
        activeOpacity={1}
      >
        {renderFloatingReactions()}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reactionButton}
        onPress={toggleReactionPicker}
      >
        <Ionicons name="heart" size={24} color="#ff4757" />
      </TouchableOpacity>

      {renderReactionPicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  storyArea: {
    flex: 1,
  },
  reactionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingReaction: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  floatingEmoji: {
    fontSize: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  reactionPicker: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 200,
  },
  emojiButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  emojiText: {
    fontSize: 20,
  },
}); 