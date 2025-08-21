import { Image } from 'expo-image';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { usePermissions } from 'expo-media-library';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';

export default function OnboardingScreen() {
    const [cameraPermissionInfo, requestCameraPermission] = useCameraPermissions();
    const [microphonePermissionInfo, requestMicrophonePermission] = useMicrophonePermissions();
    const [mediaLibraryPermissionInfo, requestMediaLibraryPermission] = usePermissions();

    async function handleContinue() {
        const allPermissionsGranted = await requestAllPermissions();
        if (allPermissionsGranted) {
            await AsyncStorage.setItem("hasOpened", "true");
            router.replace("/(tabs)");
        } else {
            Alert.alert(
                "Permissions Required",
                "To continue, please provide the necessary permissions in Settings",
                [{ text: "OK", onPress: () => {} }]
            );
        }
    }

    async function requestAllPermissions() {
        try {
            const cameraStatus = await requestCameraPermission();
            if (!cameraStatus.granted) {
                Alert.alert("Camera Permission", "Please grant camera access to continue");
                return false;
            }
            
            const microphoneStatus = await requestMicrophonePermission();
            if (!microphoneStatus.granted) {
                Alert.alert("Microphone Permission", "Please grant microphone access for video recording");
                return false;
            }
            
            const mediaLibraryStatus = await requestMediaLibraryPermission();
            if (!mediaLibraryStatus.granted) {
                Alert.alert("Media Library", "Please grant access to save and view photos/videos");
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("Permission error:", error);
            return false;
        }
    }

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#FF9966', dark: '#FD600D' }}
            headerImage={
                <SymbolView 
                    name="camera.circle"  
                    size={250}
                    type="hierarchical"
                    animationSpec={{
                        effect: {
                            type: "bounce",
                        },
                    }}
                    fallback={
                        <Image
                            source={require('@/assets/images/partial-react-logo.png')}
                            style={styles.reactLogo}
                        />
                    }
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome To Pixelchat!</ThemedText>
                <HelloWave />
            </ThemedView>
            
            <ThemedText style={styles.description}>
                Hello! Please provide the necessary permissions for the best user experience.
            </ThemedText>
            
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Camera:</ThemedText>
                <ThemedText>To take your masterful pictures and videos!</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Microphone:</ThemedText>
                <ThemedText>To record audio for your videos!</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Photo and Video Library:</ThemedText>
                <ThemedText>To save, view and access your pictures and videos!</ThemedText>
            </ThemedView>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={handleContinue}
                >
                    <ThemedText style={styles.buttonText}>Continue</ThemedText>
                </TouchableOpacity>
            </View>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    description: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    buttonContainer: {
        marginTop: 16,
        paddingHorizontal: 8,
    },
    button: {
        backgroundColor: '#FF9966',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});