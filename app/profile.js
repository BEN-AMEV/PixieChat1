import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import meIcon from '@/assets/icons/me.png';

const SnapchatProfile = () => {
  const router = useRouter();

  // Stories data organized in iOS-style lists
  const storiesSections = [
    {
      title: 'My Stories',
      data: [
        {
          id: 'my-story',
          title: 'My Story',
          emoji: '📷',
          count: '28',
          onPress: () => console.log('My Story Pressed')
        }
      ]
    },
    {
      title: 'Shared Stories',
      data: [
        {
          id: 'NK',
          title: 'Nana Kwame\s Story',
          emoji: '📷',
          count: '174',
          onPress: () => console.log('NK\'s Story Pressed')
        },
        {
          id: 'Benedict',
          title: 'Benedict\'s Story',
          emoji: '📷',
          count: '289',
          onPress: () => console.log('Benedict\'s StoryPressed')
        }
      ]
    },
    {
      title: 'Discover',
      data: [
        {
          id: 'tutorial',
          title: 'Don\'t know what we\'d put here yet',
          tag: '3/4',
          onPress: () => console.log('Tutorial Pressed')
        }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={'orange'} />
        </TouchableOpacity>
      </View>

      {/* Profile section */}
      <View style={styles.profileSection}>
        <Image 
          source={meIcon} 
          style={styles.avatar}
        />
        <Text style={styles.username}>@pixie_me</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>23,654</Text>
            <Text style={styles.statLabel}>PixieScore</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>289</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>
      </View>

      {/* Add Friends button */}
      <TouchableOpacity style={styles.addFriendsButton}>
        <Text style={styles.addFriendsText}>Add Friends</Text>
      </TouchableOpacity>

      {/* iOS-style list sections */}
      {storiesSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.data.map((item, itemIndex) => (
              <TouchableOpacity 
                key={item.id}
                style={[
                  styles.listItem,
                  itemIndex !== section.data.length - 1 && styles.itemWithBorder
                ]}
                onPress={item.onPress}
              >
                {item.emoji && (
                  <View style={styles.emojiCircle}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                  </View>
                )}
                
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.count && (
                    <Text style={styles.itemCount}>{item.count}</Text>
                  )}
                </View>
                
                {item.tag ? (
                  <Text style={styles.itemTag}>{item.tag}</Text>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#999"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  header: {
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'orange',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '80%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'gray',
  },
  addFriendsButton: {
    backgroundColor: 'orange',
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addFriendsText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
    paddingLeft: 10,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  itemWithBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: 'gray',
    marginRight: 8,
  },
  itemTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    color: '#666',
  },
});

export default SnapchatProfile;