import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ThemeProviderCustom } from '@/context/ThemeContext'; // 👈 import your ThemeContext
import { createContext, useState, useContext } from 'react';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProviderCustom> {/* 👈 wrap everything inside your ThemeContext */}
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar hidden={true} />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="ChatDetail" options={{ headerShown: false, presentation: 'fullScreenModal'}} />
          <Stack.Screen name="StoriesScreen" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="ProfileScreen" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="SearchUsersScreen" options={{ headerShown: false, presentation: 'fullScreenModal' }} />

          <Stack.Screen
            name="settings"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
              animation: 'fade',
            }}
          />

          <Stack.Screen
            name="onboarding"
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
              animation: "fade",
            }}
          />

          <Stack.Screen
            name="profile"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
              animation: 'fade',
            }}
          />
          

          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ThemeProviderCustom>
  );
}

