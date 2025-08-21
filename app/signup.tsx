import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { authApi } from './api/api';
import * as SecureStore from 'expo-secure-store';

const avatarOptions: { [key: string]: any } = {
  '1': require('../assets/avatars/1.jpg'),
  '2': require('../assets/avatars/2.jpg'),
  '3': require('../assets/avatars/3.jpg'),
  '4': require('../assets/avatars/4.jpg'),
  '5': require('../assets/avatars/5.jpg'),
 
};

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [customAvatarUri, setCustomAvatarUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ });
  
  const handleNext = () => {
    if (!firstName || !lastName || !email || !dob) {
      Alert.alert('Please fill all fields');
      return;
    }
    setStep(2);
  };



  const handleAvatarUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCustomAvatarUri(result.assets[0].uri);
      setSelectedAvatar(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAvatar && !customAvatarUri) {
      Alert.alert('Please select or upload an avatar');
      return;
    }

    if (!username || !password) {
      Alert.alert('Please fill in username and password');
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract username from email (before @gmail.com)
      const extractedUsername = email.split('@')[0];
      
      const signupData = {
        firstName,
        lastName,
        email,
        dateOfBirth: dob, // Send as string format that backend expects
        username: username || extractedUsername,
        password,
        avatarId: selectedAvatar || '1', // Use selected avatar ID or default to 1
      };

      console.log('Signup data to send:', signupData);
      
      const response = await authApi.register(signupData);
      const token = response.token;

      if (token) {
        await SecureStore.setItemAsync('token', token);
        console.log('Signup successful, token stored');
        Alert.alert('Signup Successful', `Welcome ${firstName} ${lastName}! Your avatar has been set.`);
        router.replace('/(tabs)/chat');
      } else {
        Alert.alert('Registration Failed', 'No token returned from server');
      }
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error.message);
      Alert.alert('Signup Error', 'Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Link href = "/" style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </Link>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Sign Up</Text>

        {step === 1 && (
          <>
            <TextInput
              placeholder="First Name"
              placeholderTextColor={'#808080'}
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
            <TextInput
              placeholder="Last Name"
              placeholderTextColor={'#808080'}
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#808080"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                if (!text.endsWith('@gmail.com')) {
                  const cleaned = text.replace(/@.*/, '');
                  setEmail(cleaned + '@gmail.com');
                } else {
                  setEmail(text);
                }
              }}
              style={styles.input}
            />

            <TextInput
              placeholder="Date of Birth (MM-DD-YYYY)"
              placeholderTextColor={'#808080'}
              value={dob}
              onChangeText={setDob}
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(1)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.avatarTitle}>Choose Your Avatar</Text>
            <View style={styles.avatarGrid}>
              {Object.entries(avatarOptions).map(([key, source]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    setSelectedAvatar(key);
                    setCustomAvatarUri(null);
                  }}
                >
                  <Image
                    source={source}
                    style={[
                      styles.avatar,
                      selectedAvatar === key && styles.selectedAvatar,
                    ]}
                  />
                </TouchableOpacity>
              ))}

              <TouchableOpacity onPress={handleAvatarUpload} style={styles.uploadButton}>
                <Ionicons name="cloud-upload-outline" size={40} color="white" />
              </TouchableOpacity>
            </View>

            {customAvatarUri && (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#ccc' }}>Custom Avatar Preview:</Text>
                <Image
                  source={{ uri: customAvatarUri }}
                  style={[styles.avatar, { borderWidth: 2, borderColor: '#f5a623' }]}
                />
              </View>
            )}

            <TextInput
              placeholder="Username"
              placeholderTextColor={'#808080'}
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor={'#808080'}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={true}
            />

            <TouchableOpacity 
              style={[styles.button, isSubmitting && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Creating Account...' : 'Finish'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F24A1D',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    top: '17%',
  },
  title: {
    fontSize: 30,
    color: '#fff',
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#000',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarTitle: {
    fontSize: 20,
    color: '#ece7e4',
    marginBottom: 15,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
  },
  selectedAvatar: {
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 50, // assuming the image is circular
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // Android shadow
    backgroundColor: '#fff', // helps with shadow visibility on iOS
  },
  backText: {
    marginTop: 15,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  uploadButton: {
    backgroundColor: '#333',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  loginButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
});

export default SignUp;