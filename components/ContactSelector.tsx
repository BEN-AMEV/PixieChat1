import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Image, 
  Modal, 
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

// Define Contact type
interface Contact {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
  lastSeen?: string;
}

interface ContactSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSend: (selectedContacts: Contact[], message?: string) => void;
  mediaUri?: string;
  mediaType?: 'image' | 'video';
}

// Mock contacts data (in real app, this would come from your contacts/chat API)
const contacts: Contact[] = [
  { id: '1', name: 'Andy', avatar: '1', isGroup: false, lastSeen: 'online' },
  { id: '2', name: 'Kay', avatar: '2', isGroup: false, lastSeen: '2 min ago' },
  { id: '3', name: 'Joe Crews', avatar: '3', isGroup: false, lastSeen: '5 min ago' },
  { id: '4', name: 'Etornam', avatar: '4', isGroup: false, lastSeen: '1 hour ago' },
  { id: '5', name: 'Selorm', avatar: '5', isGroup: false, lastSeen: 'yesterday' },
  { id: '6', name: 'Louis', avatar: '6', isGroup: false, lastSeen: 'online' },
  { id: '7', name: 'Team Pixiechat', avatar: '7', isGroup: true, lastSeen: '12 members' },
  { id: '8', name: 'Wendy', avatar: '8', isGroup: false, lastSeen: '30 min ago' },
  { id: '9', name: 'Benedict', avatar: '9', isGroup: false, lastSeen: '2 hours ago' },
  { id: '10', name: 'Fredrick', avatar: '10', isGroup: false, lastSeen: 'last week' },
];

// Avatar images mapping
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

const { width } = Dimensions.get('window');

export default function ContactSelector({ 
  visible, 
  onClose, 
  onSend, 
  mediaUri, 
  mediaType = 'image' 
}: ContactSelectorProps) {
  const { isDarkMode } = useTheme();
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  // Theme configuration
  const theme = isDarkMode ? {
    background: '#1c1c1e',
    headerBackground: '#2c2c2e',
    border: '#3a3a3c',
    text: '#ffffff',
    subText: '#a0a0a0',
    placeholder: '#666666',
    selectedBackground: '#ff4500',
    searchBackground: '#3a3a3c',
  } : {
    background: '#ffffff',
    headerBackground: '#f8f8f8',
    border: '#e0e0e0',
    text: '#333333',
    subText: '#666666',
    placeholder: '#999999',
    selectedBackground: '#ff4500',
    searchBackground: '#f5f5f5',
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle contact selection
  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  // Handle send action
  const handleSend = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No contacts selected', 'Please select at least one contact to share with.');
      return;
    }

    onSend(selectedContacts, message.trim() || undefined);
    
    // Reset state
    setSelectedContacts([]);
    setMessage('');
    setSearchQuery('');
    onClose();
  };

  // Render contact item
  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.some(c => c.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, { backgroundColor: theme.background, borderBottomColor: theme.border }]}
        onPress={() => toggleContactSelection(item)}
      >
        <View style={styles.contactInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={avatarImages[item.avatar || '1'] || defaultAvatar}
              style={styles.contactAvatar}
            />
            {item.isGroup && (
              <View style={[styles.groupBadge, { backgroundColor: theme.selectedBackground }]}>
                <Ionicons name="people" size={10} color="white" />
              </View>
            )}
          </View>
          <View style={styles.contactDetails}>
            <Text style={[styles.contactName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.contactStatus, { color: theme.subText }]}>
              {item.isGroup ? item.lastSeen : `Last seen ${item.lastSeen}`}
            </Text>
          </View>
        </View>
        <View style={[
          styles.checkbox,
          { 
            borderColor: isSelected ? theme.selectedBackground : theme.border,
            backgroundColor: isSelected ? theme.selectedBackground : 'transparent'
          }
        ]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Share {mediaType}</Text>
          <TouchableOpacity 
            onPress={handleSend} 
            style={[styles.sendButton, { backgroundColor: selectedContacts.length > 0 ? theme.selectedBackground : theme.border }]}
            disabled={selectedContacts.length === 0}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Media preview */}
        {mediaUri && (
          <View style={[styles.mediaPreview, { borderBottomColor: theme.border }]}>
            <Image source={{ uri: mediaUri }} style={styles.previewImage} />
            <Text style={[styles.previewLabel, { color: theme.subText }]}>
              Sharing this {mediaType}
            </Text>
          </View>
        )}

        {/* Selected contacts bar */}
        {selectedContacts.length > 0 && (
          <View style={[styles.selectedBar, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
            <Text style={[styles.selectedCount, { color: theme.text }]}>
              {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
            </Text>
            <FlatList
              horizontal
              data={selectedContacts}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectedContact}
                  onPress={() => toggleContactSelection(item)}
                >
                  <Image
                    source={avatarImages[item.avatar || '1'] || defaultAvatar}
                    style={styles.selectedAvatar}
                  />
                  <View style={styles.removeButton}>
                    <Ionicons name="close" size={12} color="white" />
                  </View>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedList}
            />
          </View>
        )}

        {/* Search bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.subText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.searchBackground, color: theme.text }]}
            placeholder="Search contacts..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Message input */}
        <View style={[styles.messageContainer, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <TextInput
            style={[styles.messageInput, { backgroundColor: theme.searchBackground, color: theme.text, borderColor: theme.border }]}
            placeholder="Add a message (optional)..."
            placeholderTextColor={theme.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={280}
          />
        </View>

        {/* Contacts list */}
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.id}
          renderItem={renderContactItem}
          style={styles.contactsList}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  selectedBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectedList: {
    paddingVertical: 4,
  },
  selectedContact: {
    position: 'relative',
    marginRight: 8,
  },
  selectedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4500',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 80,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  groupBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
