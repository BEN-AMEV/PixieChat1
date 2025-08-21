import React from 'react';
import { Platform } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFirstTimeOpen } from '@/hooks/useFirstTimeOpen';

// Reusable TabBarIcon component
const TabBarIcon = (props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused?: boolean;
}) => {
  return <Ionicons size={32} style={{ marginBottom: -3 }} {...props} />;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isFirstTime, isLoading } = useFirstTimeOpen();

  if (isLoading) return null;
  if (isFirstTime) return <Redirect href="./onboarding" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { 
            position: 'absolute',
            height: 85,
            paddingBottom: 25,
            paddingTop: 10,
          },
          default: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }),
      }}
    >

      <Tabs.Screen
        name="map"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'navigate-circle' : 'navigate-circle-outline'}
              color={focused ? 'orange' : 'gray'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'camera' : 'camera-outline'}
              color={focused ? 'orange' : 'gray'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              color={focused ? 'orange' : 'gray'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="stories"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'book' : 'book-outline'}
              color={focused ? 'orange' : 'gray'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
