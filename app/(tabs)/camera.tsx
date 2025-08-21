import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import ContactSelector from '@/components/ContactSelector';
import { addMediaToChat, saveSharedMedia } from '@/utils/sharedMediaUtils';
import { analyzeContent, generateCaption, smartFilters } from '@/utils/aiFilters';
import StoryReactions from '@/components/StoryReactions';
import ARStickers from '@/components/ARStickers';
import VoiceControl from '@/components/VoiceControl';
import SmartScheduler from '@/components/SmartScheduler';
import { gamingSystem } from '@/utils/gamingSystem';
import { CameraTestSuite } from '@/utils/cameraTestUtils';
import GamingSystemUI from '@/components/GamingSystemUI';

const { width, height } = Dimensions.get('window');

interface MediaCapture {
  uri: string;
  type: 'photo' | 'video';
}

// Camera filters with enhanced visual effects
const filters = [
  { name: 'Normal', value: null, style: {} },
  { 
    name: 'Vivid', 
    value: 'vivid', 
    style: { 
      backgroundColor: 'rgba(255, 100, 0, 0.25)',
      opacity: 0.8
    } 
  },
  { 
    name: 'Dramatic', 
    value: 'dramatic', 
    style: { 
      backgroundColor: 'rgba(255, 0, 100, 0.3)',
      opacity: 0.85
    } 
  },
  { 
    name: 'Mono', 
    value: 'mono', 
    style: { 
      backgroundColor: 'rgba(128, 128, 128, 0.6)',
      opacity: 0.7
    } 
  },
  { 
    name: 'Silvertone', 
    value: 'silvertone', 
    style: { 
      backgroundColor: 'rgba(100, 150, 255, 0.35)',
      opacity: 0.75
    } 
  },
  { 
    name: 'Noir', 
    value: 'noir', 
    style: { 
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      opacity: 0.8
    } 
  },
];

export default function SnapchatCamera() {
  const { isDarkMode } = useTheme();
  const cameraRef = useRef<CameraView>(null);
  
  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

  // Camera state
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // UI state
  const [capturedMedia, setCapturedMedia] = useState<MediaCapture | null>(null);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  // New feature states
  const [showStoryReactions, setShowStoryReactions] = useState(false);
  const [showARStickers, setShowARStickers] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(false);
  const [showSmartScheduler, setShowSmartScheduler] = useState(false);
  const [showGamingSystem, setShowGamingSystem] = useState(false);
  const [aiFilterSuggestions, setAiFilterSuggestions] = useState<any[]>([]);
  const [autoCaption, setAutoCaption] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const recordingScale = useRef(new Animated.Value(1)).current;

  // Timer for recording
  const recordingTimer = useRef<any>(null);
  const pressTimer = useRef<any>(null);

  // Theme
  const theme = {
    background: isDarkMode ? '#000000' : '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.4)',
    text: isDarkMode ? '#ffffff' : '#000000',
    accent: '#ff4500',
    buttonBg: 'rgba(255, 255, 255, 0.3)',
    border: isDarkMode ? '#333333' : '#cccccc',
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  // Request permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request camera permission
        if (!cameraPermission?.granted) {
          console.log('Requesting camera permission...');
          await requestCameraPermission();
        }
        
        // Request media library permission
        if (!mediaLibraryPermission?.granted) {
          console.log('Requesting media library permission...');
          await requestMediaLibraryPermission();
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestPermissions();
  }, [cameraPermission, mediaLibraryPermission]);

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) { // Max 60 seconds like Snapchat
            handleStopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      
      // Animate recording button
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingScale, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingTime(0);
      recordingScale.setValue(1);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  // Check permissions
  if (!cameraPermission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.permissionText, { color: theme.text }]}>Loading camera...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Ionicons name="camera-outline" size={64} color={theme.text} />
        <Text style={[styles.permissionText, { color: theme.text }]}>
          Camera access needed to take photos and videos
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: theme.accent }]}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pan responder for zoom
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      const newZoom = Math.max(0, Math.min(1, zoom + gestureState.dy * 0.01));
      setZoom(newZoom);
    },
  });

  // Handle double tap to flip camera
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      toggleCameraFacing();
    }
    setLastTap(now);
  };

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    
    // Animate flip
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Toggle flash
  const toggleFlash = () => {
    const modes: FlashMode[] = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flash);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlash(modes[nextIndex]);
  };

  // Take photo
  const takePhoto = async () => {
    if (!cameraRef.current || isLoading || isRecording) {
      console.log('Cannot take photo:', { 
        hasCamera: !!cameraRef.current, 
        isLoading, 
        isRecording 
      });
      return;
    }

    try {
      console.log('Starting photo capture...');
      setIsLoading(true);
      
      // Request media library permissions if not granted
      if (!mediaLibraryPermission?.granted) {
        const permission = await requestMediaLibraryPermission();
        if (!permission.granted) {
          Alert.alert(
            'Storage Permission', 
            'Storage access is required to save photos to your device. Photos will still be captured but not saved to gallery.',
            [{ text: 'OK' }]
          );
        }
      }
      
      // Fail-safe timeout to reset loading state after 10 seconds
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        Alert.alert('Timeout', 'Photo capture took too long. Please try again.');
      }, 10000);
      
      // Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Clear the timeout since photo was captured successfully
      clearTimeout(timeoutId);

      if (photo?.uri) {
        console.log('Photo captured successfully:', photo.uri);
        
        // Save to media library if permission granted
        if (mediaLibraryPermission?.granted) {
          try {
            await MediaLibrary.saveToLibraryAsync(photo.uri);
            console.log('Photo saved to gallery successfully');
            Alert.alert('Success', 'Photo saved to gallery!');
          } catch (saveError) {
            console.error('Error saving photo to gallery:', saveError);
            Alert.alert('Warning', 'Photo captured but failed to save to gallery.');
          }
        } else {
          Alert.alert('Info', 'Photo captured successfully! Enable storage permission to save to gallery.');
        }

        // Set captured media first
        setCapturedMedia({ uri: photo.uri, type: 'photo' });
        
        // AI analysis and gaming integration
        setIsAnalyzing(true);
        try {
          const suggestions = await analyzeContent(photo.uri);
          setAiFilterSuggestions(suggestions);
          
          if (suggestions.length > 0) {
            const caption = generateCaption(suggestions[0], 'photo');
            setAutoCaption(caption);
          }
          
          // Record activity for gaming system
          await gamingSystem.recordActivity('post');
        } catch (error) {
          console.error('Error in AI analysis:', error);
        } finally {
          setIsAnalyzing(false);
        }
        
        // Small delay to ensure state is updated before showing selector
        setTimeout(() => {
          setShowContactSelector(true);
          setIsLoading(false); // Set loading to false after contact selector is shown
        }, 100);
      } else {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to capture photo. Please try again.');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to take photo: ${errorMessage}`);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!cameraRef.current || isRecording) {
      console.log('Cannot start recording:', { 
        hasCamera: !!cameraRef.current, 
        isRecording 
      });
      return;
    }

    console.log('Starting video recording...');

    // Check microphone permission
    if (!microphonePermission?.granted) {
      const permission = await requestMicrophonePermission();
      if (!permission.granted) {
        Alert.alert('Microphone Permission', 'Microphone access is required for video recording.');
        return;
      }
    }

    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      if (video?.uri) {
        console.log('Video recorded successfully:', video.uri);
        
        // Save to media library if permission granted
        if (mediaLibraryPermission?.granted) {
          try {
            await MediaLibrary.saveToLibraryAsync(video.uri);
            console.log('Video saved to gallery successfully');
            Alert.alert('Success', 'Video saved to gallery!');
          } catch (saveError) {
            console.error('Error saving video to gallery:', saveError);
            Alert.alert('Warning', 'Video recorded but failed to save to gallery.');
          }
        } else {
          Alert.alert('Info', 'Video recorded successfully! Enable storage permission to save to gallery.');
        }

        setCapturedMedia({ uri: video.uri, type: 'video' });
        setShowContactSelector(true);
      } else {
        Alert.alert('Error', 'Failed to record video. Please try again.');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    if (!isRecording || !cameraRef.current) return;
    
    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // Handle capture button press events
  const handleCapturePress = () => {
    if (isRecording) return;
    
    pressTimer.current = setTimeout(() => {
      // Long press - start video recording
      startRecording();
    }, 200);
  };

  const handleCaptureRelease = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (isRecording) {
      // Stop recording
      handleStopRecording();
    } else {
      // Short press - take photo
      takePhoto();
    }
  };

  // Open gallery
  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedMedia({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
        });
        setShowContactSelector(true);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  // Handle sharing with contacts
  const handleShare = async (contacts: any[], message?: string) => {
    try {
      setIsLoading(true);
      
      if (!capturedMedia) return;
      
      // Create shared media object
      const sharedMedia = {
        id: `shared_${Date.now()}`,
        uri: capturedMedia.uri,
        type: capturedMedia.type === 'photo' ? 'image' : 'video' as 'image' | 'video',
        message: message || '',
        timestamp: Date.now(),
        fromUserId: 'current_user', // Replace with actual user ID
        toContactIds: contacts.map(c => c.id),
      };
      
      // Save to local storage
      await saveSharedMedia(sharedMedia);
      
      // Add to individual chat conversations
      for (const contact of contacts) {
        await addMediaToChat(contact.id, sharedMedia);
      }
      
      Alert.alert(
        'Shared!',
        `${capturedMedia.type} shared with ${contacts.length} contact${contacts.length > 1 ? 's' : ''}`,
        [
          {
            text: 'View Chat',
            onPress: () => {
              if (contacts.length === 1) {
                router.push({
                  pathname: '/ChatDetail',
                  params: { 
                    name: contacts[0].name, 
                    chatId: contacts[0].id 
                  }
                });
              }
            }
          },
          { text: 'OK' }
        ]
      );
      
      setCapturedMedia(null);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share media.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Camera View */}
      <Animated.View 
        style={[
          styles.cameraContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cameraTouch}
          activeOpacity={1}
          onPress={handleDoubleTap}
        >
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
            zoom={zoom}
          />
          
          {/* Filter Overlay */}
          {filters[selectedFilter].value && (
            <View 
              style={[
                StyleSheet.absoluteFillObject,
                filters[selectedFilter].style,
                { pointerEvents: 'none' }
              ]} 
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Flash Overlay */}
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim,
          },
        ]}
        pointerEvents="none"
      />

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.topRightControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}
          >
            <Ionicons
              name={
                flash === 'off' ? 'flash-off' :
                flash === 'on' ? 'flash' : 'flash-outline'
              }
              size={24}
              color="white"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="color-filter" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowARStickers(!showARStickers)}
          >
            <Ionicons name="happy" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowVoiceControl(true)}
          >
            <Ionicons name="mic" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowSmartScheduler(true)}
          >
            <Ionicons name="time" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => CameraTestSuite.runFullTest()}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowGamingSystem(true)}
          >
            <Ionicons name="trophy" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Current Filter Indicator */}
      {selectedFilter > 0 && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            {filters[selectedFilter].name}
          </Text>
        </View>
      )}

      {/* Filters Row */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollView}
          >
            {filters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterButton,
                  selectedFilter === index && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(index)}
              >
                {/* Filter preview circle */}
                <View style={[
                  styles.filterPreview,
                  filter.value && filter.style,
                  selectedFilter === index && styles.filterPreviewActive
                ]} />
                <Text style={[
                  styles.filterText,
                  selectedFilter === index && styles.filterTextActive
                ]}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recording Timer */}
      {isRecording && (
        <View style={styles.recordingTimer}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>{formatTime(recordingTime)}</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Gallery Button */}
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={openGallery}
        >
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>

        {/* Capture Button */}
        <View style={styles.captureButtonContainer}>
          <Animated.View style={{ transform: [{ scale: recordingScale }] }}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                isRecording && styles.captureButtonRecording,
              ]}
              onPressIn={handleCapturePress}
              onPressOut={handleCaptureRelease}
              activeOpacity={0.8}
            >
              <View style={[
                styles.captureButtonInner,
                isRecording && styles.captureButtonInnerRecording,
              ]} />
            </TouchableOpacity>
          </Animated.View>
          
          {/* Capture Instructions */}
          <Text style={styles.captureInstructions}>
            Tap for photo • Hold for video
          </Text>
        </View>

        {/* Camera Flip Button */}
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Zoom Indicator */}
      {zoom > 0 && (
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{(1 + zoom * 9).toFixed(1)}x</Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}

      {/* Contact Selector */}
      {capturedMedia && (
        <ContactSelector
          visible={showContactSelector}
          onClose={() => {
            setShowContactSelector(false);
            setCapturedMedia(null);
            setIsLoading(false); // Ensure loading is false when closed
          }}
          onSend={handleShare}
          mediaUri={capturedMedia.uri}
          mediaType={capturedMedia.type === 'photo' ? 'image' : 'video'}
        />
      )}

      {/* Emergency Reset Button - shown if stuck in loading */}
      {isLoading && (
        <TouchableOpacity
          style={styles.emergencyReset}
          onPress={() => {
            setIsLoading(false);
            setShowContactSelector(false);
            setCapturedMedia(null);
          }}
        >
          <Ionicons name="close-circle" size={32} color="white" />
          <Text style={styles.emergencyResetText}>Cancel</Text>
        </TouchableOpacity>
      )}

      {/* AI Filter Suggestions */}
      {aiFilterSuggestions.length > 0 && (
        <View style={styles.aiSuggestionsContainer}>
          <Text style={styles.aiSuggestionsTitle}>AI Suggestions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {aiFilterSuggestions.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={styles.aiSuggestionButton}
                onPress={() => {
                  const filterIndex = filters.findIndex(f => f.name === filter.name);
                  if (filterIndex !== -1) {
                    setSelectedFilter(filterIndex);
                  }
                }}
              >
                <Text style={styles.aiSuggestionText}>{filter.name}</Text>
                <Text style={styles.aiConfidenceText}>
                  {Math.round(filter.confidence * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Auto Caption */}
      {autoCaption && (
        <View style={styles.autoCaptionContainer}>
          <Text style={styles.autoCaptionText}>{autoCaption}</Text>
        </View>
      )}

      {/* Story Reactions */}
      <StoryReactions
        storyId="camera_story"
        onReactionAdd={(reaction) => {
          console.log('Reaction added:', reaction);
          gamingSystem.recordActivity('reaction');
        }}
        isVisible={showStoryReactions}
      />

      {/* AR Stickers */}
      <ARStickers
        onStickerAdd={(sticker) => {
          console.log('Sticker added:', sticker);
          gamingSystem.recordActivity('post');
        }}
        onStickerRemove={(stickerId) => console.log('Sticker removed:', stickerId)}
        onStickerUpdate={(stickerId, updates) => console.log('Sticker updated:', stickerId, updates)}
        isVisible={showARStickers}
        onClose={() => setShowARStickers(false)}
      />

      {/* Voice Control */}
      <VoiceControl
        isVisible={showVoiceControl}
        onClose={() => setShowVoiceControl(false)}
      />

      {/* Smart Scheduler */}
      <SmartScheduler
        isVisible={showSmartScheduler}
        onClose={() => setShowSmartScheduler(false)}
        onSchedule={(scheduledTime) => {
          console.log('Content scheduled for:', scheduledTime);
          setShowSmartScheduler(false);
        }}
      />

      {/* AI Analysis Loading */}
              {isAnalyzing && (
          <View style={styles.aiAnalysisOverlay}>
            <View style={styles.aiAnalysisContainer}>
              <Text style={styles.aiAnalysisText}>AI Analyzing...</Text>
            </View>
          </View>
        )}

        {/* Gaming System UI */}
        <GamingSystemUI
          isVisible={showGamingSystem}
          onClose={() => setShowGamingSystem(false)}
        />
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  cameraTouch: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    zIndex: 5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 15,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 100 : 80,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  filtersScrollView: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#ff4500',
  },
  filterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    fontWeight: 'bold',
  },
  filterPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  filterPreviewActive: {
    borderColor: '#ff4500',
    borderWidth: 2,
  },
  filterIndicator: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 140 : 120,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  filterIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordingTimer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 80 : 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 5,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'android' ? 30 : 40,
    paddingHorizontal: 30,
    zIndex: 5,
  },
  captureButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  captureButtonRecording: {
    borderColor: '#ff0000',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  captureButtonInnerRecording: {
    borderRadius: 8,
    backgroundColor: '#ff0000',
  },
  captureInstructions: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  galleryButton: {
    position: 'absolute',
    left: 30,
    bottom: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    position: 'absolute',
    right: 30,
    bottom: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 5,
  },
  zoomText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyReset: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  emergencyResetText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  aiSuggestionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 15,
    zIndex: 10,
  },
  aiSuggestionsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aiSuggestionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
  },
  aiSuggestionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  aiConfidenceText: {
    color: '#4ecdc4',
    fontSize: 10,
    marginTop: 2,
  },
  autoCaptionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 15,
    zIndex: 10,
  },
  autoCaptionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  aiAnalysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  aiAnalysisContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  aiAnalysisText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
