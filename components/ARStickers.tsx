import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  Modal,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface ARSticker {
  id: string;
  name: string;
  icon: string;
  category: 'emoji' | 'effects' | 'frames' | 'text' | 'shapes' | 'filters';
  uri?: string;
  emoji?: string;
  color?: string;
  size?: number;
  gradient?: readonly [string, string, ...string[]];
  animation?: 'bounce' | 'pulse' | 'rotate' | 'shake' | 'none';
}

interface StickerInstance {
  id: string;
  sticker: ARSticker;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  animation?: Animated.Value;
}

interface ARStickersProps {
  onStickerAdd?: (sticker: StickerInstance) => void;
  onStickerRemove?: (stickerId: string) => void;
  onStickerUpdate?: (stickerId: string, updates: Partial<StickerInstance>) => void;
  isVisible: boolean;
  onClose?: () => void;
}

// Industry-standard AR stickers with premium effects
const arStickers: ARSticker[] = [
  // Premium Emojis with animations
  { id: 'heart', name: 'Heart', icon: 'heart', category: 'emoji', emoji: '❤️', animation: 'pulse' },
  { id: 'fire', name: 'Fire', icon: 'flame', category: 'emoji', emoji: '🔥', animation: 'shake' },
  { id: 'star', name: 'Star', icon: 'star', category: 'emoji', emoji: '⭐', animation: 'rotate' },
  { id: 'crown', name: 'Crown', icon: 'crown', category: 'emoji', emoji: '👑', animation: 'bounce' },
  { id: 'sparkles', name: 'Sparkles', icon: 'sparkles', category: 'emoji', emoji: '✨', animation: 'pulse' },
  { id: 'rocket', name: 'Rocket', icon: 'rocket', category: 'emoji', emoji: '🚀', animation: 'shake' },
  { id: 'party', name: 'Party', icon: 'wine', category: 'emoji', emoji: '🎉', animation: 'bounce' },
  { id: 'cool', name: 'Cool', icon: 'happy', category: 'emoji', emoji: '😎', animation: 'none' },
  { id: 'rainbow', name: 'Rainbow', icon: 'rainbow', category: 'emoji', emoji: '🌈', animation: 'pulse' },
  { id: 'unicorn', name: 'Unicorn', icon: 'sparkles', category: 'emoji', emoji: '🦄', animation: 'bounce' },
  
  // Premium Effects with gradients
  { id: 'glow', name: 'Glow Effect', icon: 'sunny', category: 'effects', color: '#ffd700', gradient: ['#ffd700', '#ffed4e'], animation: 'pulse' },
  { id: 'neon', name: 'Neon', icon: 'flash', category: 'effects', color: '#ff00ff', gradient: ['#ff00ff', '#00ffff'], animation: 'pulse' },
  { id: 'vintage', name: 'Vintage', icon: 'camera', category: 'effects', color: '#8b4513', gradient: ['#8b4513', '#d2691e'], animation: 'none' },
  { id: 'rainbow-effect', name: 'Rainbow', icon: 'rainbow', category: 'effects', gradient: ['#ff6b6b', '#4ecdc4', '#45b7d1'], animation: 'rotate' },
  { id: 'golden', name: 'Golden', icon: 'star', category: 'effects', gradient: ['#ffd700', '#ffed4e', '#ffd700'], animation: 'pulse' },
  { id: 'silver', name: 'Silver', icon: 'diamond', category: 'effects', gradient: ['#c0c0c0', '#e5e5e5', '#c0c0c0'], animation: 'none' },
  
  // Premium Frames
  { id: 'polaroid', name: 'Polaroid', icon: 'square', category: 'frames', color: '#ffffff' },
  { id: 'circle', name: 'Circle', icon: 'ellipse', category: 'frames', color: '#000000' },
  { id: 'diamond', name: 'Diamond', icon: 'diamond', category: 'frames', color: '#ff6b6b' },
  { id: 'hexagon', name: 'Hexagon', icon: 'hexagon', category: 'frames', color: '#4ecdc4' },
  { id: 'golden-frame', name: 'Golden Frame', icon: 'star', category: 'frames', gradient: ['#ffd700', '#ffed4e'] },
  
  // Premium Text styles
  { id: 'bold', name: 'Bold Text', icon: 'text', category: 'text', color: '#000000' },
  { id: 'cursive', name: 'Cursive', icon: 'text', category: 'text', color: '#ff6b6b' },
  { id: 'neon-text', name: 'Neon Text', icon: 'text', category: 'text', color: '#00ffff' },
  { id: 'gradient-text', name: 'Gradient Text', icon: 'text', category: 'text', gradient: ['#ff6b6b', '#4ecdc4'] },
  
  // Premium Shapes
  { id: 'circle-shape', name: 'Circle', icon: 'ellipse', category: 'shapes', color: '#ff6b6b' },
  { id: 'square-shape', name: 'Square', icon: 'square', category: 'shapes', color: '#4ecdc4' },
  { id: 'triangle', name: 'Triangle', icon: 'triangle', category: 'shapes', color: '#45b7d1' },
  { id: 'heart-shape', name: 'Heart Shape', icon: 'heart', category: 'shapes', color: '#ff6b6b' },
  { id: 'star-shape', name: 'Star Shape', icon: 'star', category: 'shapes', color: '#ffd700' },
  
  // Premium Filters
  { id: 'sepia', name: 'Sepia', icon: 'camera', category: 'filters', color: '#8b4513' },
  { id: 'black-white', name: 'B&W', icon: 'contrast', category: 'filters', color: '#000000' },
  { id: 'vintage-filter', name: 'Vintage', icon: 'camera', category: 'filters', color: '#8b4513' },
  { id: 'warm', name: 'Warm', icon: 'sunny', category: 'filters', color: '#ff6b6b' },
  { id: 'cool', name: 'Cool', icon: 'snow', category: 'filters', color: '#45b7d1' },
];

export default function ARStickers({ onStickerAdd, onStickerRemove, onStickerUpdate, isVisible, onClose }: ARStickersProps) {
  const [selectedCategory, setSelectedCategory] = useState<'emoji' | 'effects' | 'frames' | 'text' | 'shapes' | 'filters'>('emoji');
  const [activeStickers, setActiveStickers] = useState<StickerInstance[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<StickerInstance | null>(null);
  const [showStickerEditor, setShowStickerEditor] = useState(false);
  const stickerIdCounter = useRef(0);
  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});

  const categories = [
    { key: 'emoji', name: 'Emojis', icon: 'happy' },
    { key: 'effects', name: 'Effects', icon: 'sparkles' },
    { key: 'frames', name: 'Frames', icon: 'square' },
    { key: 'text', name: 'Text', icon: 'text' },
    { key: 'shapes', name: 'Shapes', icon: 'shapes' },
    { key: 'filters', name: 'Filters', icon: 'camera' },
  ];

  // Create pan responder for sticker manipulation
  const createPanResponder = useCallback((stickerId: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelectedSticker(activeStickers.find(s => s.id === stickerId) || null);
      },
      onPanResponderMove: (evt, gestureState) => {
        const sticker = activeStickers.find(s => s.id === stickerId);
        if (sticker) {
          const newX = sticker.x + gestureState.dx;
          const newY = sticker.y + gestureState.dy;
          
          updateSticker(stickerId, { x: newX, y: newY });
        }
      },
      onPanResponderRelease: () => {
        setSelectedSticker(null);
      },
    });
  }, [activeStickers]);

  const addSticker = (sticker: ARSticker) => {
    const newStickerInstance: StickerInstance = {
      id: `sticker_${stickerIdCounter.current++}`,
      sticker,
      x: width / 2 - 25,
      y: height / 2 - 25,
      scale: 1,
      rotation: 0,
      opacity: 1,
      zIndex: activeStickers.length + 1,
    };

    // Create animation for the sticker if it has one
    if (sticker.animation && sticker.animation !== 'none') {
      const animation = new Animated.Value(1);
      animationRefs.current[newStickerInstance.id] = animation;
      newStickerInstance.animation = animation;
      
      // Start the animation
      startStickerAnimation(newStickerInstance.id, sticker.animation);
    }

    setActiveStickers(prev => [...prev, newStickerInstance]);
    onStickerAdd?.(newStickerInstance);
  };

  const removeSticker = (stickerId: string) => {
    setActiveStickers(prev => prev.filter(s => s.id !== stickerId));
    onStickerRemove?.(stickerId);
    
    // Stop animation
    if (animationRefs.current[stickerId]) {
      animationRefs.current[stickerId].stopAnimation();
      delete animationRefs.current[stickerId];
    }
  };

  const updateSticker = (stickerId: string, updates: Partial<StickerInstance>) => {
    setActiveStickers(prev => 
      prev.map(s => s.id === stickerId ? { ...s, ...updates } : s)
    );
    onStickerUpdate?.(stickerId, updates);
  };

  const startStickerAnimation = (stickerId: string, animationType: string) => {
    const animation = animationRefs.current[stickerId];
    if (!animation) return;

    const createAnimation = () => {
      switch (animationType) {
        case 'pulse':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(animation, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
              Animated.timing(animation, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
          );
        case 'bounce':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(animation, { toValue: 1.3, duration: 800, useNativeDriver: true }),
              Animated.timing(animation, { toValue: 0.8, duration: 800, useNativeDriver: true }),
            ])
          );
        case 'rotate':
          return Animated.loop(
            Animated.timing(animation, { toValue: 360, duration: 3000, useNativeDriver: true })
          );
        case 'shake':
          return Animated.loop(
            Animated.sequence([
              Animated.timing(animation, { toValue: 1.1, duration: 100, useNativeDriver: true }),
              Animated.timing(animation, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            ])
          );
        default:
          return null;
      }
    };

    const anim = createAnimation();
    if (anim) {
      anim.start();
    }
  };

  const renderSticker = (stickerInstance: StickerInstance) => {
    const { sticker } = stickerInstance;
    const panResponder = createPanResponder(stickerInstance.id);
    const isSelected = selectedSticker?.id === stickerInstance.id;

    const stickerStyle = {
      transform: [
        { scale: stickerInstance.animation ? stickerInstance.scale : 1 },
        { rotate: `${stickerInstance.rotation}deg` },
      ],
      opacity: stickerInstance.opacity,
      zIndex: stickerInstance.zIndex,
    };

    const renderStickerContent = () => {
      if (sticker.emoji) {
        return (
          <Text style={[styles.emojiText, { fontSize: sticker.size || 40 }]}>
            {sticker.emoji}
          </Text>
        );
      }

      if (sticker.gradient) {
        return (
          <LinearGradient
            colors={sticker.gradient}
            style={[styles.gradientSticker, { width: sticker.size || 50, height: sticker.size || 50 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        );
      }

      return (
        <View 
          style={[
            styles.colorSticker, 
            { 
              backgroundColor: sticker.color || '#ff6b6b',
              width: sticker.size || 50, 
              height: sticker.size || 50 
            }
          ]} 
        />
      );
    };

    return (
      <Animated.View
        key={stickerInstance.id}
        style={[styles.stickerContainer, stickerStyle]}
        {...panResponder.panHandlers}
      >
        {renderStickerContent()}
        
        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <View style={styles.selectionBorder} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeSticker(stickerInstance.id)}
            >
              <Ionicons name="close-circle" size={20} color="#ff0000" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryTab,
            selectedCategory === category.key && styles.categoryTabActive
          ]}
          onPress={() => setSelectedCategory(category.key as any)}
        >
          <Ionicons 
            name={category.icon as any} 
            size={20} 
            color={selectedCategory === category.key ? '#fff' : '#666'} 
          />
          <Text style={[
            styles.categoryTabText,
            selectedCategory === category.key && styles.categoryTabTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStickerGrid = () => {
    const filteredStickers = arStickers.filter(sticker => sticker.category === selectedCategory);
    
    return (
      <ScrollView 
        style={styles.stickerGrid}
        contentContainerStyle={styles.stickerGridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stickerGridInner}>
          {filteredStickers.map((sticker) => (
            <TouchableOpacity
              key={sticker.id}
              style={styles.stickerItem}
              onPress={() => addSticker(sticker)}
            >
              {sticker.emoji ? (
                <Text style={styles.stickerItemEmoji}>{sticker.emoji}</Text>
              ) : sticker.gradient ? (
                <LinearGradient
                  colors={sticker.gradient}
                  style={styles.stickerItemGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={sticker.icon as any} size={24} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={[styles.stickerItemColor, { backgroundColor: sticker.color || '#ff6b6b' }]}>
                  <Ionicons name={sticker.icon as any} size={24} color="#fff" />
                </View>
              )}
              <Text style={styles.stickerItemText}>{sticker.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AR Stickers & Effects</Text>
          <TouchableOpacity 
            onPress={() => setShowStickerEditor(!showStickerEditor)} 
            style={styles.editButton}
          >
            <Ionicons name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        {renderCategoryTabs()}

        {/* Sticker Grid */}
        {renderStickerGrid()}

        {/* Active Stickers Overlay */}
        <View style={styles.activeStickersContainer} pointerEvents="box-none">
          {activeStickers.map(renderSticker)}
        </View>

        {/* Sticker Editor Modal */}
        {showStickerEditor && selectedSticker && (
          <View style={styles.editorOverlay}>
            <BlurView intensity={20} style={styles.editorBlur}>
              <View style={styles.editorContent}>
                <Text style={styles.editorTitle}>Edit Sticker</Text>
                
                {/* Scale Slider */}
                <View style={styles.editorSection}>
                  <Text style={styles.editorLabel}>Scale</Text>
                  <View style={styles.sliderContainer}>
                    <TouchableOpacity 
                      onPress={() => updateSticker(selectedSticker.id, { scale: Math.max(0.5, selectedSticker.scale - 0.1) })}
                      style={styles.sliderButton}
                    >
                      <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.sliderValue}>{selectedSticker.scale.toFixed(1)}</Text>
                    <TouchableOpacity 
                      onPress={() => updateSticker(selectedSticker.id, { scale: Math.min(3, selectedSticker.scale + 0.1) })}
                      style={styles.sliderButton}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rotation Slider */}
                <View style={styles.editorSection}>
                  <Text style={styles.editorLabel}>Rotation</Text>
                  <View style={styles.sliderContainer}>
                    <TouchableOpacity 
                      onPress={() => updateSticker(selectedSticker.id, { rotation: selectedSticker.rotation - 15 })}
                      style={styles.sliderButton}
                    >
                      <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.sliderValue}>{selectedSticker.rotation}°</Text>
                    <TouchableOpacity 
                      onPress={() => updateSticker(selectedSticker.id, { rotation: selectedSticker.rotation + 15 })}
                      style={styles.sliderButton}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Opacity Slider */}
                <View style={styles.editorSection}>
                  <Text style={styles.editorLabel}>Opacity</Text>
                  <View style={styles.sliderContainer}>
                    <TouchableOpacity 
                      onPress={() => updateSticker(selectedSticker.id, { opacity: Math.max(0.1, selectedSticker.opacity - 0.1) })}
                      style={styles.sliderButton}
                    >
                      <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.sliderValue}>{selectedSticker.opacity.toFixed(1)}</Text>
                    <TouchableOpacity 
                      onPress={() => updateSticker(selectedSticker.id, { opacity: Math.min(1, selectedSticker.opacity + 0.1) })}
                      style={styles.sliderButton}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => setShowStickerEditor(false)}
                  style={styles.editorDoneButton}
                >
                  <Text style={styles.editorDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
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
  editButton: {
    padding: 10,
  },
  categoryTabs: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryTabActive: {
    backgroundColor: '#ff6b6b',
  },
  categoryTabText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  stickerGrid: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  stickerGridContent: {
    padding: 20,
  },
  stickerGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerItem: {
    width: (width - 60) / 3,
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  stickerItemEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  stickerItemGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stickerItemColor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stickerItemText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  activeStickersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  stickerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 40,
  },
  gradientSticker: {
    borderRadius: 25,
  },
  colorSticker: {
    borderRadius: 25,
  },
  selectionIndicator: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  },
  selectionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    borderRadius: 25,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  editorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorBlur: {
    width: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  editorContent: {
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  editorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  editorSection: {
    marginBottom: 20,
  },
  editorLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  editorDoneButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editorDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 