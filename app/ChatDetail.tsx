import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  Appearance, 
  FlatList, 
  Image, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  SafeAreaView, 
  Platform,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContactSelector from '@/components/ContactSelector';

const { width } = Dimensions.get('window');

// Define avatar images with a default fallback
const avatarImages: { [key: string]: any } = {
  '1': require('../assets/avatars/1.jpg'),
  '2': require('../assets/avatars/2.jpg'),
  '3': require('../assets/avatars/3.jpg'),
  '4': require('../assets/avatars/4.jpg'),
  '5': require('../assets/avatars/5.jpg'),
  '6': require('../assets/avatars/6.jpg'),
  '7': require('../assets/avatars/7.jpg'),
  '8': require('../assets/avatars/8.jpg'),
  '9': require('../assets/avatars/9.jpg'),
  '10': require('../assets/avatars/10.jpg'),
};

const defaultAvatar = require('../assets/avatars/default.png');

interface Message {
  id: string;
  text: string;
  sent: boolean;
  file?: any;
  duration?: number;
  voice?: boolean;
  audioUri?: string;
  mediaUri?: string;
  mediaType?: 'image' | 'video';
  timestamp?: number;
  fileType?: 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'archive' | 'unknown';
  fileSize?: number;
}

  // Helper to generate random waveform data
const generateWaveform = (bars = 32, amplitude = 10, width = 80, height = 24) =>
  Array.from({ length: bars }, (_, i) => {
    const x = (i / (bars - 1)) * width;
    const y = height / 2 + (Math.random() - 0.5) * amplitude;
    return `${x},${y}`;
  }).join(' ');

// File type detection utility
const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'archive' | 'unknown' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('sheet') || mimeType.includes('presentation')) return 'document';
  return 'unknown';
};

// Get file icon based on type
const getFileIcon = (fileType: string): any => {
  switch (fileType) {
    case 'image': return 'image';
    case 'video': return 'videocam';
    case 'audio': return 'musical-notes';
    case 'pdf': return 'document-text';
    case 'document': return 'document';
    case 'archive': return 'archive';
    default: return 'document-attach';
  }
};

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export default function ChatDetail() {
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams();
  const name = params.name as string;
  const chatId = params.chatId as string;
  
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{uri: string, type: 'image' | 'video' | 'document', name?: string} | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Message selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showSelectionActions, setShowSelectionActions] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  // Sample messages with media support
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey! How are you doing?', sent: false },
    { id: '2', text: 'I\'m good, thanks! How about you?', sent: true },
    { id: '3', text: 'Just finished a great workout 💪', sent: false },
  ]);

  // Load shared media messages from camera
  useEffect(() => {
    loadSharedMediaMessages();
  }, [chatId]);

  // Refresh messages when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSharedMediaMessages();
    }, [chatId])
  );

  const loadSharedMediaMessages = async () => {
    try {
      const chatMessagesData = await AsyncStorage.getItem(`chatMessages_${chatId}`);
      if (chatMessagesData) {
        const chatMessages = JSON.parse(chatMessagesData);
        
        // Convert shared media to message format
        const mediaMessages = chatMessages
          .filter((msg: any) => msg.mediaUri)
          .map((msg: any) => ({
            id: msg.id,
            text: msg.text || `Shared ${msg.mediaType}`,
            sent: true,
            mediaUri: msg.mediaUri,
            mediaType: msg.mediaType,
            timestamp: msg.timestamp,
          }));

        if (mediaMessages.length > 0) {
          setMessages(prev => {
            // Remove any existing media messages to avoid duplicates
            const nonMediaMessages = prev.filter(msg => !msg.mediaUri);
            
            // Add all media messages and sort by timestamp
            const allMessages = [...nonMediaMessages, ...mediaMessages];
            return allMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          });
        }
      }
    } catch (error) {
      console.error('Error loading shared media messages:', error);
    }
  };

  // Theme that responds to context
  const theme = isDarkMode ? {
    background: '#1c1c1e',
    headerBackground: '#2c2c2e',
    border: '#3a3a3c',
    text: '#ffffff',
    icon: '#a0a0a0',
    placeholder: '#888888',
    tab: '#a0a0a0',
    activeTab: '#ff4500',
    searchBackground: '#3a3a3c',
  } : {
    background: '#f5f5f5',
    headerBackground: '#ffffff',
    border: '#ddd',
    text: '#333',
    icon: '#888',
    placeholder: '#888',
    tab: '#888',
    activeTab: '#ff4500',
    searchBackground: '#f9f9f9',
  };

  // Create styles based on theme
  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    },
    container: { flex: 1 },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: Platform.OS === 'android' ? 12 : 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1, 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minHeight: Platform.OS === 'android' ? 56 : 50,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    chatList: { flex: 1, paddingHorizontal: 10 },
    messageBubble: {
      maxWidth: '80%',
      marginVertical: 3,
      padding: 12,
      borderRadius: 18,
    },
    messageText: { fontSize: 16, lineHeight: 20 },
    voiceBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      maxWidth: '70%',
      marginVertical: 3,
    },
    voicePlayBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderTopWidth: 1,
    },
    textInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 15,
      fontSize: 16,
      marginHorizontal: 10,
    },
    recordButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 5,
    },
    sendButton: {
      backgroundColor: '#ff4500',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 5,
    },
    messageContainer: {
      marginHorizontal: 16,
      marginVertical: 2,
    },
    sentMessageContainer: {
      alignSelf: 'flex-end',
    },
    receivedMessageContainer: {
      alignSelf: 'flex-start',
    },
    fileBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      minWidth: 200,
      // Add subtle shadow to indicate interactivity
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    fileImagePreview: {
      width: 120,
      height: 80,
      borderRadius: 8,
      marginTop: 8,
    },
    // Media bubble styles for camera-shared content
    mediaBubble: {
      borderRadius: 12,
      overflow: 'hidden',
      minWidth: 200,
      maxWidth: width * 0.7,
      // Add subtle shadow to indicate interactivity
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    mediaImage: {
      width: width * 0.6,
      height: width * 0.4,
      borderRadius: 8,
    },
    videoContainer: {
      position: 'relative',
    },
    videoPlayOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    // Modal styles for full-screen media viewing
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalHeader: {
      position: 'absolute',
      top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      zIndex: 1,
    },
    modalTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 15,
      flex: 1,
    },
    fullScreenImage: {
      width: width,
      height: width,
      resizeMode: 'contain',
    },
    fullScreenVideo: {
      width: width,
      height: width * 0.7,
      backgroundColor: '#000',
    },
    documentPreview: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      padding: 20,
      margin: 20,
      alignItems: 'center',
      maxWidth: width * 0.8,
    },
    documentIcon: {
      marginBottom: 15,
    },
    documentName: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    documentSize: {
      fontSize: 14,
      color: '#666',
      marginBottom: 20,
    },
    openDocumentButton: {
      backgroundColor: '#ff4500',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    openDocumentText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    // Media view indicator
    mediaViewIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
      padding: 4,
      minWidth: 24,
      alignItems: 'center',
    },
    // Enhanced file bubble styles
    imageBubble: {
      borderRadius: 12,
      overflow: 'hidden',
      maxWidth: width * 0.7,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    videoBubble: {
      borderRadius: 12,
      overflow: 'hidden',
      maxWidth: width * 0.7,
      backgroundColor: '#000',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    audioBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 20,
      minWidth: 200,
      maxWidth: width * 0.7,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    documentBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      minWidth: 200,
      maxWidth: width * 0.8,
      borderWidth: 1,
      borderColor: 'rgba(255,69,0,0.2)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    pdfBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      minWidth: 200,
      maxWidth: width * 0.8,
      backgroundColor: '#dc2626',
      shadowColor: '#dc2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    archiveBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      minWidth: 200,
      maxWidth: width * 0.8,
      backgroundColor: '#7c3aed',
      shadowColor: '#7c3aed',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    fileInfo: {
      flex: 1,
      marginLeft: 12,
    },
    fileName: {
      fontWeight: 'bold',
      fontSize: 15,
      marginBottom: 4,
    },
    fileSize: {
      fontSize: 12,
      opacity: 0.8,
    },
    // Attach menu styles
    attachMenuOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    attachMenu: {
      backgroundColor: theme.headerBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
      paddingHorizontal: 20,
    },
    attachMenuTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    attachOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    attachOption: {
      alignItems: 'center',
      padding: 15,
      borderRadius: 12,
      minWidth: 80,
      margin: 5,
    },
    attachOptionText: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  // VoiceBubble component with playback (now inside component to access theme)
  const VoiceBubble = ({
    sent,
    duration = 12,
    isPlaying,
    onPlayPause,
  }: {
    sent: boolean;
    duration?: number;
    isPlaying?: boolean;
    onPlayPause?: () => void;
  }) => (
    <View style={[styles.voiceBubble, { backgroundColor: sent ? 'rgba(255,69,0,0.18)' : 'rgba(0,0,0,0.06)' }]}>
      <TouchableOpacity onPress={onPlayPause} style={styles.voicePlayBtn} accessibilityLabel={isPlaying ? "Pause voice note" : "Play voice note"} accessibilityRole="button">
        <Ionicons name={isPlaying ? "pause" : "play"} size={22} color={sent ? "#ff4500" : theme.activeTab} />
      </TouchableOpacity>
      <Svg width={80} height={24} style={{ marginHorizontal: 8 }}>
        <Polyline
          points={generateWaveform()}
          fill="none"
          stroke={sent ? "#ff4500" : theme.activeTab}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ marginLeft: 10, color: sent ? "#ff4500" : theme.activeTab, fontWeight: 'bold', fontSize: 14 }}>
        {duration}" 
      </Text>
      <Ionicons name="mic" size={18} color={sent ? "#ff4500" : theme.activeTab} style={{ marginLeft: 8 }} />
    </View>
  );

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileType = getFileType(file.mimeType || '');
        setAttachedFile({
          ...file,
          fileType,
          fileSize: file.size,
        });
        setShowAttachMenu(false);
      }
    } catch (error) {
      console.log('Document pick error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileType = asset.type === 'video' ? 'video' : 'image';
        setAttachedFile({
          uri: asset.uri,
          name: `camera_${Date.now()}.${fileType === 'video' ? 'mp4' : 'jpg'}`,
          mimeType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
          size: asset.fileSize,
          fileType,
          fileSize: asset.fileSize,
        });
        setShowAttachMenu(false);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo/video');
    }
  };

  const pickGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileType = asset.type === 'video' ? 'video' : 'image';
        setAttachedFile({
          uri: asset.uri,
          name: `gallery_${Date.now()}.${fileType === 'video' ? 'mp4' : 'jpg'}`,
          mimeType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
          size: asset.fileSize,
          fileType,
          fileSize: asset.fileSize,
        });
        setShowAttachMenu(false);
      }
    } catch (error) {
      console.log('Gallery error:', error);
      Alert.alert('Error', 'Failed to pick from gallery');
    }
  };

  // Enhanced attach menu
  const renderAttachMenu = () => (
    <Modal
      visible={showAttachMenu}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAttachMenu(false)}
    >
      <TouchableOpacity
        style={styles.attachMenuOverlay}
        activeOpacity={1}
        onPress={() => setShowAttachMenu(false)}
      >
        <View style={styles.attachMenu}>
          <Text style={styles.attachMenuTitle}>Share Content</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachOptions}
          >
            <TouchableOpacity
              style={[styles.attachOption, { backgroundColor: '#34d399' }]}
              onPress={pickCamera}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={[styles.attachOptionText, { color: '#fff' }]}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.attachOption, { backgroundColor: '#3b82f6' }]}
              onPress={pickGallery}
            >
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={[styles.attachOptionText, { color: '#fff' }]}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.attachOption, { backgroundColor: '#f59e0b' }]}
              onPress={pickDocument}
            >
              <Ionicons name="document" size={24} color="#fff" />
              <Text style={[styles.attachOptionText, { color: '#fff' }]}>Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.attachOption, { backgroundColor: '#ef4444' }]}
              onPress={() => {
                // Navigate to camera app
                setShowAttachMenu(false);
                router.push('/camera');
              }}
            >
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={[styles.attachOptionText, { color: '#fff' }]}>PixieChat{'\n'}Camera</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const sendMessage = () => {
    if (message.trim() || attachedFile) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message || (attachedFile ? attachedFile.name || 'File attachment' : ''),
        sent: true,
        file: attachedFile || undefined,
        timestamp: Date.now(),
      };

      setMessages([...messages, newMessage]);
      setMessage('');
      setAttachedFile(null);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: 96, //expects a numeric value and not a string value like high
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.log('Failed to start recording', err);
    }
  };

  // Stop and save recording
  const sendVoiceNote = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: '',
          sent: true,
          voice: true,
          audioUri: uri ?? undefined,
          duration: Math.floor((await recording.getStatusAsync()).durationMillis / 1000),
        },
      ]);
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.log('Failed to send voice note', err);
    }
  };

  const cancelRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
    } catch {}
    setRecording(null);
    setIsRecording(false);
  };

  // Playback logic
  const handlePlayPause = async (id: string, audioUri?: string) => {
    if (isPlayingId === id) {
      setIsPlayingId(null);
      return;
    }
    setIsPlayingId(id);
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync({ uri: audioUri! });
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate(status => {
        if ('isLoaded' in status && status.isLoaded && status.didJustFinish) {
          setIsPlayingId(null);
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      setIsPlayingId(null);
      console.log('Playback error:', error);
    }
  };

  // Handle media bubble click
  const handleMediaClick = (mediaUri: string, mediaType: 'image' | 'video', filename?: string) => {
    setSelectedMedia({
      uri: mediaUri,
      type: mediaType,
      name: filename
    });
    setShowMediaModal(true);
  };

  // Handle document click
  const handleDocumentClick = (file: any) => {
    setSelectedMedia({
      uri: file.uri,
      type: 'document',
      name: file.name
    });
    setShowMediaModal(true);
  };

  // Close media modal
  const closeMediaModal = () => {
    setShowMediaModal(false);
    setSelectedMedia(null);
  };

  // Render full screen media modal
  const renderMediaModal = () => (
    <Modal
      visible={showMediaModal}
      transparent={true}
      animationType="fade"
      onRequestClose={closeMediaModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeMediaModal} accessibilityLabel="Close" accessibilityRole="button">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {selectedMedia?.name || (selectedMedia?.type === 'image' ? 'Image' : selectedMedia?.type === 'video' ? 'Video' : 'Document')}
          </Text>
        </View>
        
        {selectedMedia?.type === 'image' && (
          <ScrollView 
            contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            <Image
              source={{ uri: selectedMedia.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </ScrollView>
        )}
        
        {selectedMedia?.type === 'video' && (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.fullScreenVideo}>
              <Image
                source={{ uri: selectedMedia.uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
              <View style={[styles.videoPlayOverlay, { borderRadius: 0 }]}>
                <TouchableOpacity
                  onPress={() => {
                    // You can integrate with expo-av Video component or external video player
                    Alert.alert('Video Player', 'Video playback functionality can be implemented with expo-av Video component');
                  }}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 40, padding: 15 }}
                >
                  <Ionicons name="play" size={40} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {selectedMedia?.type === 'document' && (
          <View style={styles.documentPreview}>
            <View style={styles.documentIcon}>
              <Ionicons name="document-text" size={64} color="#ff4500" />
            </View>
            <Text style={styles.documentName}>{selectedMedia.name}</Text>
            <Text style={styles.documentSize}>Document</Text>
            <TouchableOpacity 
              style={styles.openDocumentButton}
              onPress={() => {
                // You can implement document opening with expo-file-system or expo-sharing
                Alert.alert('Open Document', 'Document opening functionality can be implemented with expo-sharing');
              }}
            >
              <Text style={styles.openDocumentText}>Open Document</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );

  // Message selection functions
  const toggleMessageSelection = (messageId: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedMessages(new Set([messageId]));
      setShowSelectionActions(true);
    } else {
      const newSelected = new Set(selectedMessages);
      if (newSelected.has(messageId)) {
        newSelected.delete(messageId);
      } else {
        newSelected.add(messageId);
      }
      setSelectedMessages(newSelected);
      
      if (newSelected.size === 0) {
        setSelectionMode(false);
        setShowSelectionActions(false);
      }
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
    setShowSelectionActions(false);
  };

  const selectAllMessages = () => {
    const allMessageIds = new Set(messages.map(msg => msg.id));
    setSelectedMessages(allMessageIds);
  };

  const deleteSelectedMessages = () => {
    Alert.alert(
      'Delete Messages',
      `Are you sure you want to delete ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMessages = messages.filter(msg => !selectedMessages.has(msg.id));
            setMessages(updatedMessages);
            exitSelectionMode();
          }
        }
      ]
    );
  };

  const copySelectedMessages = async () => {
    try {
      const selectedMsgs = messages.filter(msg => selectedMessages.has(msg.id));
      const textToCopy = selectedMsgs.map(msg => {
        if (msg.text) return msg.text;
        if (msg.voice) return '[Voice Message]';
        if (msg.mediaUri) return `[${msg.mediaType?.toUpperCase()} Message]`;
        if (msg.file) return `[${msg.file.fileType?.toUpperCase()} File: ${msg.file.name}]`;
        return '[Message]';
      }).join('\n');
      
      // Use Expo's Clipboard
      await Clipboard.setStringAsync(textToCopy);
      
      Alert.alert('Success', `${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} copied to clipboard`);
      exitSelectionMode();
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy messages to clipboard');
    }
  };

  const forwardSelectedMessages = () => {
    setShowForwardModal(true);
  };

  const handleForwardMessages = async (selectedContacts: any[], message?: string) => {
    try {
      const selectedMsgs = messages.filter(msg => selectedMessages.has(msg.id));
      
      // Here you would implement the actual forwarding logic
      // For now, we'll simulate it
      console.log('Forwarding messages to contacts:', selectedContacts.map(c => c.name));
      console.log('Messages to forward:', selectedMsgs);
      console.log('Additional message:', message);
      
      Alert.alert('Success', `${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} forwarded to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}!`);
      setShowForwardModal(false);
      exitSelectionMode();
    } catch (error) {
      Alert.alert('Error', 'Failed to forward messages');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle={theme.background === '#1c1c1e' ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBackground} translucent={false} />
      {/* Modern Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border, justifyContent: 'flex-start' }]}>
        {selectionMode ? (
          // Selection mode header
          <>
            <TouchableOpacity onPress={exitSelectionMode} accessibilityLabel="Exit selection" accessibilityRole="button">
              <Ionicons name="close" size={26} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text, marginLeft: 12, fontSize: 18 }]}>
              {selectedMessages.size} selected
            </Text>
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <TouchableOpacity
                onPress={selectAllMessages}
                accessibilityLabel="Select all"
                accessibilityRole="button"
                style={{ marginRight: 16 }}
              >
                <Ionicons name="checkmark-done" size={24} color={theme.activeTab} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={copySelectedMessages}
                accessibilityLabel="Copy messages"
                accessibilityRole="button"
                style={{ marginRight: 16 }}
              >
                <Ionicons name="copy" size={24} color={theme.activeTab} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={forwardSelectedMessages}
                accessibilityLabel="Forward messages"
                accessibilityRole="button"
                style={{ marginRight: 16 }}
              >
                <Ionicons name="arrow-forward" size={24} color={theme.activeTab} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deleteSelectedMessages}
                accessibilityLabel="Delete messages"
                accessibilityRole="button"
              >
                <Ionicons name="trash" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Normal mode header
          <>
            <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back" accessibilityRole="button">
              <Ionicons name="arrow-back" size={26} color={theme.text} />
            </TouchableOpacity>
            {/* Make avatar clickable */}
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/ProfileScreen',
                params: { name, chatId }
              } as any)}
              accessibilityLabel={`View ${name}'s profile`}
              accessibilityRole="button"
            >
              <Image
                source={avatarImages[chatId] || defaultAvatar}
                style={{ width: 36, height: 36, borderRadius: 18, marginLeft: 12, borderWidth: 2, borderColor: theme.activeTab }}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text, marginLeft: 12, fontSize: 18 }]}>{name}</Text>
            {/* Call buttons */}
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <TouchableOpacity
                onPress={() => {/* Add your audio call logic here */}}
                accessibilityLabel="Audio call"
                accessibilityRole="button"
                style={{ marginLeft: 16 }}
              >
                <Ionicons name="call-outline" size={24} color={theme.activeTab} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {/* Add your video call logic here */}}
                accessibilityLabel="Video call"
                accessibilityRole="button"
                style={{ marginLeft: 12 }}
              >
                <Ionicons name="videocam-outline" size={24} color={theme.activeTab} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      {/* Chat Area */}
      <View style={{ flex: 1, backgroundColor: Appearance.getColorScheme() === 'dark' ? '#232325' : '#f7f7fa' }}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (selectionMode) {
                  toggleMessageSelection(item.id);
                }
              }}
              onLongPress={() => toggleMessageSelection(item.id)}
              activeOpacity={selectionMode ? 0.7 : 1}
              style={{ position: 'relative' }}
            >
              <View style={[
                styles.messageContainer,
                item.sent ? styles.sentMessageContainer : styles.receivedMessageContainer,
                {
                  backgroundColor: selectedMessages.has(item.id) 
                    ? (item.sent ? '#ff6600' : '#e6f2ff') 
                    : (item.sent ? '#ff4500' : '#fff'),
                  borderRadius: 18,
                  marginVertical: 4,
                  padding: 10,
                  shadowColor: item.sent ? '#ff4500' : '#000',
                  shadowOpacity: item.sent ? 0.15 : 0.05,
                  shadowRadius: 4,
                  elevation: item.sent ? 2 : 1,
                  alignSelf: item.sent ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  borderWidth: selectedMessages.has(item.id) ? 2 : 0,
                  borderColor: selectedMessages.has(item.id) ? theme.activeTab : 'transparent',
                },
              ]}>
                {/* Selection indicator */}
                {selectedMessages.has(item.id) && (
                  <View style={{
                    position: 'absolute',
                    top: -8,
                    right: item.sent ? -8 : undefined,
                    left: item.sent ? undefined : -8,
                    backgroundColor: theme.activeTab,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                  }}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
                
                {item.voice ? (
                  <VoiceBubble
                    sent={item.sent}
                    duration={item.duration}
                    isPlaying={isPlayingId === item.id}
                    onPlayPause={() => handlePlayPause(item.id, item.audioUri)}
                  />
                ) : item.mediaUri ? (
                // Media bubble for camera-shared images/videos - now clickable
                <TouchableOpacity 
                  style={styles.mediaBubble}
                  onPress={() => handleMediaClick(item.mediaUri!, item.mediaType!, `${item.mediaType} from ${name}`)}
                  accessibilityLabel={`View ${item.mediaType}`}
                  accessibilityRole="button"
                >
                  {item.mediaType === 'image' ? (
                    <View style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: item.mediaUri }}
                        style={styles.mediaImage}
                        onError={() => console.log('Failed to load image:', item.mediaUri)}
                      />
                      <View style={styles.mediaViewIndicator}>
                        <Ionicons name="eye" size={12} color="#fff" />
                      </View>
                    </View>
                  ) : item.mediaType === 'video' ? (
                    <View style={styles.videoContainer}>
                      <Image
                        source={{ uri: item.mediaUri }}
                        style={styles.mediaImage}
                      />
                      <View style={styles.videoPlayOverlay}>
                        <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                      </View>
                      <View style={styles.mediaViewIndicator}>
                        <Ionicons name="eye" size={12} color="#fff" />
                      </View>
                    </View>
                  ) : null}
                  {item.text && item.text !== `Shared ${item.mediaType}` && (
                    <Text style={{ 
                      color: item.sent ? '#fff' : '#222', 
                      fontSize: 14, 
                      marginTop: 8,
                      paddingHorizontal: 4
                    }}>
                      {item.text}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : item.file ? (
                // Enhanced file bubble with different styles based on file type
                <TouchableOpacity 
                  style={[
                    item.file.fileType === 'image' ? styles.imageBubble :
                    item.file.fileType === 'video' ? styles.videoBubble :
                    item.file.fileType === 'audio' ? styles.audioBubble :
                    item.file.fileType === 'pdf' ? styles.pdfBubble :
                    item.file.fileType === 'archive' ? styles.archiveBubble :
                    styles.documentBubble,
                    { backgroundColor: item.sent ? (
                      item.file.fileType === 'pdf' ? '#dc2626' :
                      item.file.fileType === 'archive' ? '#7c3aed' :
                      '#ff4500'
                    ) : (
                      item.file.fileType === 'pdf' ? '#fef2f2' :
                      item.file.fileType === 'archive' ? '#f3f4f6' :
                      '#f9f9f9'
                    )}
                  ]}
                  onPress={() => {
                    if (item.file.fileType === 'image') {
                      handleMediaClick(item.file.uri, 'image', item.file.name);
                    } else if (item.file.fileType === 'video') {
                      handleMediaClick(item.file.uri, 'video', item.file.name);
                    } else {
                      handleDocumentClick(item.file);
                    }
                  }}
                  accessibilityLabel={`View ${item.file.fileType}: ${item.file.name}`}
                  accessibilityRole="button"
                >
                  {item.file.fileType === 'image' ? (
                    <View style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: item.file.uri }}
                        style={[styles.mediaImage, { borderRadius: 12 }]}
                        onError={() => console.log('Failed to load image:', item.file.uri)}
                      />
                      <View style={styles.mediaViewIndicator}>
                        <Ionicons name="eye" size={12} color="#fff" />
                      </View>
                    </View>
                  ) : item.file.fileType === 'video' ? (
                    <View style={styles.videoContainer}>
                      <Image
                        source={{ uri: item.file.uri }}
                        style={[styles.mediaImage, { borderRadius: 12 }]}
                      />
                      <View style={styles.videoPlayOverlay}>
                        <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                      </View>
                      <View style={styles.mediaViewIndicator}>
                        <Ionicons name="eye" size={12} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <>
                      <Ionicons 
                        name={getFileIcon(item.file.fileType || 'unknown')} 
                        size={28} 
                        color={item.sent ? "#fff" : (
                          item.file.fileType === 'pdf' ? '#dc2626' :
                          item.file.fileType === 'archive' ? '#7c3aed' :
                          theme.activeTab
                        )} 
                      />
                      <View style={styles.fileInfo}>
                        <Text style={[
                          styles.fileName, 
                          { color: item.sent ? '#fff' : (
                            item.file.fileType === 'pdf' ? '#dc2626' :
                            item.file.fileType === 'archive' ? '#7c3aed' :
                            '#222'
                          )}
                        ]}>
                          {item.file.name || 'Attached file'}
                        </Text>
                        <Text style={[
                          styles.fileSize, 
                          { color: item.sent ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }
                        ]}>
                          {formatFileSize(item.file.fileSize)} • {item.file.fileType?.toUpperCase()}
                        </Text>
                      </View>
                      <Ionicons 
                        name="eye-outline" 
                        size={18} 
                        color={item.sent ? "#fff" : (
                          item.file.fileType === 'pdf' ? '#dc2626' :
                          item.file.fileType === 'archive' ? '#7c3aed' :
                          theme.activeTab
                        )} 
                      />
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <Text style={{ color: item.sent ? '#fff' : '#222', fontSize: 16 }}>{item.text}</Text>
              )}
              {item.sent && (
                <Ionicons
                  name="checkmark-done-outline"
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 6, marginTop: 2 }}
                />
              )}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        />
      </View>
      {/* Modern Input Bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.headerBackground,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 8,
      }}>
        <TouchableOpacity
          onPress={() => setShowAttachMenu(true)}
          accessibilityLabel="Attach file"
          accessibilityRole="button"
          style={{
            backgroundColor: theme.activeTab,
            borderRadius: 22,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            shadowColor: theme.activeTab,
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
        {/* Voice note button */}
        {!isRecording ? (
          <TouchableOpacity
            onPress={startRecording}
            accessibilityLabel="Record voice note"
            accessibilityRole="button"
            style={{
              backgroundColor: theme.icon,
              borderRadius: 22,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Ionicons name="mic" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
            <Ionicons name="mic" size={22} color={theme.activeTab} />
            <Text style={{ marginLeft: 8, color: theme.activeTab, fontWeight: 'bold' }}>Recording...</Text>
            <TouchableOpacity onPress={sendVoiceNote} style={{ marginLeft: 12 }}>
              <Ionicons name="send" size={22} color={theme.activeTab} />
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelRecording} style={{ marginLeft: 8 }}>
              <Ionicons name="close" size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            backgroundColor: Appearance.getColorScheme() === 'dark' ? '#232325' : '#f1f1f4',
            paddingHorizontal: 18,
            color: theme.text,
            fontSize: 16,
            marginRight: 10,
            borderWidth: 0,
          }}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.placeholder}
          accessibilityLabel="Type a message"
        />
        <TouchableOpacity
          onPress={sendMessage}
          accessibilityLabel="Send message"
          accessibilityRole="button"
          style={{
            backgroundColor: theme.activeTab,
            borderRadius: 22,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.activeTab,
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {attachedFile && (
        <View style={{ 
          padding: 12, 
          flexDirection: 'row', 
          alignItems: 'center',
          backgroundColor: theme.headerBackground,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          marginHorizontal: 10,
          borderRadius: 12,
          marginBottom: 5,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{
            backgroundColor: attachedFile.fileType === 'pdf' ? '#dc2626' :
                           attachedFile.fileType === 'archive' ? '#7c3aed' :
                           theme.activeTab,
            borderRadius: 8,
            padding: 8,
            marginRight: 12,
          }}>
            <Ionicons 
              name={getFileIcon(attachedFile.fileType || 'unknown')} 
              size={20} 
              color="#fff" 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14 }}>
              {attachedFile.name}
            </Text>
            <Text style={{ color: theme.icon, fontSize: 12, marginTop: 2 }}>
              {formatFileSize(attachedFile.fileSize)} • {attachedFile.fileType?.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setAttachedFile(null)} 
            style={{ 
              backgroundColor: 'rgba(255,0,0,0.1)',
              borderRadius: 15,
              padding: 6,
            }}
          >
            <Ionicons name="close" size={16} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}
      {renderMediaModal()}
      {renderAttachMenu()}
      
      {/* Forward Messages Modal */}
      {showForwardModal && (
        <ContactSelector
          visible={showForwardModal}
          onClose={() => setShowForwardModal(false)}
          onSend={handleForwardMessages}
          mediaUri=""
          mediaType="image"
        />
      )}
    </SafeAreaView>
  );
}
