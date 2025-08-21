import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { voiceControl, showVoiceControlHelp } from '../utils/voiceControl';

const { width, height } = Dimensions.get('window');

interface VoiceControlProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function VoiceControl({ isVisible, onClose }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isListening]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startListening = async () => {
    setIsListening(true);
    Speech.speak('Listening for voice commands', { rate: 0.8 });
    
    // Simulate voice recognition (in real app, this would use actual voice recognition)
    setTimeout(() => {
      const commands = [
        'hide my location',
        'show my location',
        'enable ghost mode',
        'disable ghost mode',
        'private stories',
        'friends only stories',
        'public stories',
        'hide read receipts',
        'show read receipts',
        'hide last seen',
        'show last seen',
        'privacy status',
      ];
      
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setLastCommand(randomCommand);
      
      setTimeout(async () => {
        await voiceControl.processVoiceCommand(randomCommand);
        setIsListening(false);
      }, 1000);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    Speech.speak('Voice control stopped', { rate: 0.8 });
  };

  const showHelp = () => {
    showVoiceControlHelp();
  };

  const getPrivacyStatus = async () => {
    const status = voiceControl.getPrivacyState();
    const statusText = `Location sharing: ${status.locationSharing ? 'on' : 'off'}. Ghost mode: ${status.ghostMode ? 'on' : 'off'}. Stories: ${status.storyVisibility}. Read receipts: ${status.readReceipts ? 'on' : 'off'}. Last seen: ${status.lastSeen ? 'visible' : 'hidden'}`;
    Speech.speak(statusText, { rate: 0.7 });
  };

  const quickCommands = [
    { name: 'Hide Location', command: 'hide my location', icon: 'location' },
    { name: 'Ghost Mode', command: 'enable ghost mode', icon: 'eye-off' },
    { name: 'Private Stories', command: 'private stories', icon: 'lock-closed' },
    { name: 'Status', command: 'privacy status', icon: 'information-circle' },
  ];

  const executeQuickCommand = async (command: string) => {
    setLastCommand(command);
    await voiceControl.processVoiceCommand(command);
  };

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
            <Text style={styles.title}>Voice Control</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.mainSection}>
            <Animated.View
              style={[
                styles.microphoneButton,
                {
                  transform: [{ scale: pulseAnimation }],
                  backgroundColor: isListening ? '#ff4757' : '#4ecdc4',
                },
              ]}
            >
              <TouchableOpacity
                onPress={isListening ? stopListening : startListening}
                style={styles.microphoneTouchable}
              >
                <Ionicons
                  name={isListening ? 'mic' : 'mic-outline'}
                  size={40}
                  color="white"
                />
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.statusText}>
              {isListening ? 'Listening...' : 'Tap to start voice control'}
            </Text>

            {lastCommand && (
              <View style={styles.lastCommandContainer}>
                <Text style={styles.lastCommandLabel}>Last command:</Text>
                <Text style={styles.lastCommandText}>{lastCommand}</Text>
              </View>
            )}
          </View>

          <View style={styles.quickCommandsSection}>
            <Text style={styles.sectionTitle}>Quick Commands</Text>
            <View style={styles.quickCommandsGrid}>
              {quickCommands.map((cmd, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickCommandButton}
                  onPress={() => executeQuickCommand(cmd.command)}
                >
                  <Ionicons name={cmd.icon as any} size={24} color="#4ecdc4" />
                  <Text style={styles.quickCommandText}>{cmd.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.helpButton} onPress={showHelp}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.helpButtonText}>Help</Text>
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
    width: width * 0.9,
    maxHeight: height * 0.8,
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
  mainSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  microphoneButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  microphoneTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  lastCommandContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  lastCommandLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  lastCommandText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  quickCommandsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickCommandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCommandButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickCommandText: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  helpButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
}); 