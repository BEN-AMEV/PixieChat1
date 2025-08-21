import * as Speech from 'expo-speech';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// Voice command types
export interface VoiceCommand {
  command: string;
  action: () => Promise<void>;
  description: string;
  keywords: string[];
}

// Privacy states
export interface PrivacyState {
  locationSharing: boolean;
  ghostMode: boolean;
  storyVisibility: 'public' | 'friends' | 'private';
  readReceipts: boolean;
  lastSeen: boolean;
}

// Voice control manager
export class VoiceControlManager {
  private isListening = false;
  private commands: VoiceCommand[] = [];
  private privacyState: PrivacyState = {
    locationSharing: true,
    ghostMode: false,
    storyVisibility: 'friends',
    readReceipts: true,
    lastSeen: true,
  };

  constructor() {
    this.initializeCommands();
    this.loadPrivacyState();
  }

  private initializeCommands() {
    this.commands = [
      {
        command: 'hide my location',
        action: async () => {
          await this.updatePrivacyState({ locationSharing: false });
          Speech.speak('Location sharing disabled', { rate: 0.8 });
        },
        description: 'Disable location sharing',
        keywords: ['hide', 'location', 'stop', 'sharing', 'location'],
      },
      {
        command: 'show my location',
        action: async () => {
          await this.updatePrivacyState({ locationSharing: true });
          Speech.speak('Location sharing enabled', { rate: 0.8 });
        },
        description: 'Enable location sharing',
        keywords: ['show', 'location', 'start', 'sharing', 'location'],
      },
      {
        command: 'enable ghost mode',
        action: async () => {
          await this.updatePrivacyState({ ghostMode: true });
          Speech.speak('Ghost mode activated', { rate: 0.8 });
        },
        description: 'Enable ghost mode for privacy',
        keywords: ['ghost', 'mode', 'enable', 'activate', 'invisible'],
      },
      {
        command: 'disable ghost mode',
        action: async () => {
          await this.updatePrivacyState({ ghostMode: false });
          Speech.speak('Ghost mode deactivated', { rate: 0.8 });
        },
        description: 'Disable ghost mode',
        keywords: ['ghost', 'mode', 'disable', 'deactivate', 'visible'],
      },
      {
        command: 'private stories',
        action: async () => {
          await this.updatePrivacyState({ storyVisibility: 'private' });
          Speech.speak('Stories set to private', { rate: 0.8 });
        },
        description: 'Set stories to private',
        keywords: ['private', 'stories', 'only', 'me'],
      },
      {
        command: 'friends only stories',
        action: async () => {
          await this.updatePrivacyState({ storyVisibility: 'friends' });
          Speech.speak('Stories set to friends only', { rate: 0.8 });
        },
        description: 'Set stories to friends only',
        keywords: ['friends', 'stories', 'only'],
      },
      {
        command: 'public stories',
        action: async () => {
          await this.updatePrivacyState({ storyVisibility: 'public' });
          Speech.speak('Stories set to public', { rate: 0.8 });
        },
        description: 'Set stories to public',
        keywords: ['public', 'stories', 'everyone'],
      },
      {
        command: 'hide read receipts',
        action: async () => {
          await this.updatePrivacyState({ readReceipts: false });
          Speech.speak('Read receipts disabled', { rate: 0.8 });
        },
        description: 'Disable read receipts',
        keywords: ['hide', 'read', 'receipts', 'disable'],
      },
      {
        command: 'show read receipts',
        action: async () => {
          await this.updatePrivacyState({ readReceipts: true });
          Speech.speak('Read receipts enabled', { rate: 0.8 });
        },
        description: 'Enable read receipts',
        keywords: ['show', 'read', 'receipts', 'enable'],
      },
      {
        command: 'hide last seen',
        action: async () => {
          await this.updatePrivacyState({ lastSeen: false });
          Speech.speak('Last seen hidden', { rate: 0.8 });
        },
        description: 'Hide last seen status',
        keywords: ['hide', 'last', 'seen', 'status'],
      },
      {
        command: 'show last seen',
        action: async () => {
          await this.updatePrivacyState({ lastSeen: true });
          Speech.speak('Last seen visible', { rate: 0.8 });
        },
        description: 'Show last seen status',
        keywords: ['show', 'last', 'seen', 'status'],
      },
      {
        command: 'privacy status',
        action: async () => {
          const status = this.getPrivacyStatus();
          Speech.speak(status, { rate: 0.7 });
        },
        description: 'Get current privacy status',
        keywords: ['privacy', 'status', 'settings', 'current'],
      },
    ];
  }

  private async loadPrivacyState() {
    try {
      const savedState = await SecureStore.getItemAsync('privacyState');
      if (savedState) {
        this.privacyState = { ...this.privacyState, ...JSON.parse(savedState) };
      }
    } catch (error) {
      console.error('Error loading privacy state:', error);
    }
  }

  private async updatePrivacyState(updates: Partial<PrivacyState>) {
    this.privacyState = { ...this.privacyState, ...updates };
    try {
      await SecureStore.setItemAsync('privacyState', JSON.stringify(this.privacyState));
    } catch (error) {
      console.error('Error saving privacy state:', error);
    }
  }

  private getPrivacyStatus(): string {
    const status = [];
    status.push(`Location sharing is ${this.privacyState.locationSharing ? 'on' : 'off'}`);
    status.push(`Ghost mode is ${this.privacyState.ghostMode ? 'on' : 'off'}`);
    status.push(`Stories are ${this.privacyState.storyVisibility}`);
    status.push(`Read receipts are ${this.privacyState.readReceipts ? 'on' : 'off'}`);
    status.push(`Last seen is ${this.privacyState.lastSeen ? 'visible' : 'hidden'}`);
    return status.join('. ');
  }

  // Process voice command
  public async processVoiceCommand(command: string): Promise<boolean> {
    const normalizedCommand = command.toLowerCase().trim();
    
    for (const cmd of this.commands) {
      if (this.matchesCommand(normalizedCommand, cmd)) {
        try {
          await cmd.action();
          return true;
        } catch (error) {
          console.error('Error executing voice command:', error);
          Speech.speak('Sorry, I could not complete that action', { rate: 0.8 });
          return false;
        }
      }
    }
    
    Speech.speak('Command not recognized. Try saying privacy status for available commands', { rate: 0.8 });
    return false;
  }

  private matchesCommand(input: string, command: VoiceCommand): boolean {
    // Check exact match
    if (input === command.command) return true;
    
    // Check keyword matching
    const inputWords = input.split(' ');
    const keywordMatches = command.keywords.filter(keyword => 
      inputWords.some(word => word.includes(keyword) || keyword.includes(word))
    );
    
    return keywordMatches.length >= 2; // At least 2 keywords must match
  }

  // Get current privacy state
  public getPrivacyState(): PrivacyState {
    return { ...this.privacyState };
  }

  // Get available commands for help
  public getAvailableCommands(): string[] {
    return this.commands.map(cmd => cmd.command);
  }

  // Simulate voice input (for testing)
  public async simulateVoiceInput(command: string): Promise<boolean> {
    return this.processVoiceCommand(command);
  }
}

// Global voice control instance
export const voiceControl = new VoiceControlManager();

// Helper function to show voice control help
export const showVoiceControlHelp = () => {
  const commands = voiceControl.getAvailableCommands();
  const helpText = `Available voice commands:\n\n${commands.join('\n')}`;
  
  Alert.alert(
    'Voice Control Help',
    helpText,
    [{ text: 'OK' }]
  );
};

// Privacy zone detection
export const isInPrivacyZone = (latitude: number, longitude: number): boolean => {
  // Define privacy zones (homes, workplaces, etc.)
  const privacyZones = [
    { lat: 5.6047, lng: -0.186, radius: 100 }, // Example: Home
    { lat: 5.6027, lng: -0.188, radius: 50 },  // Example: Work
  ];

  return privacyZones.some(zone => {
    const distance = calculateDistance(latitude, longitude, zone.lat, zone.lng);
    return distance <= zone.radius;
  });
};

// Calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}; 