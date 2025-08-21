import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { authApi } from './api/api';
import * as SecureStore from 'expo-secure-store';


export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const payload = {username, password}

  const handleLogin = async() => {
    try {
      const response = await authApi.login(username, password);
      const token = response.token;

      if (token) {
        await SecureStore.setItemAsync('token', token);
        console.log('Login successful, token stored');
        router.push('/(tabs)/chat');
      } else {
        Alert.alert('Login Failed', 'No token returned from server');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('Login Error', 'Please check your inputs and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F24A1D" />

      {/* Top-left Sign Up button */}
      <TouchableOpacity 
        style={styles.signupButton} 
        onPress={() => {
          console.log('Sign up button pressed');
          router.push('/signup');
        }}
      >
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.inner}>
        <Image 
        source={require('../assets/images/login.png')} // Replace with your image path
        style={styles.loginImage}
        resizeMode="contain"
      />
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={'#808080'}
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={'#808080'}
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F24A1D' },

  signupButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  signupText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  inner: {
    flex: 1,
    justifyContent: 'center', // 👈 center vertically
    padding: 20,
  },
  loginImage: {
  width: '100%',
  height: '100%',
  top: -180,
  pointerEvents: 'none',
  alignSelf: 'center',
  position: 'absolute'

},
  title: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
