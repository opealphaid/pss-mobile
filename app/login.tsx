import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PATH_URL_BACKEND } from '../constants/api';
import LanguageSelector from '../components/LanguageSelector';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, ingrese su correo electrónico y contraseña.');
      return;
    }

    try {
      setLoading(true);
      console.log('Intentando login con:', email);
      console.log('URL:', `${PATH_URL_BACKEND}/usuario/login`);
      
      const response = await fetch(`${PATH_URL_BACKEND}/usuario/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(errorText || 'Usuario o contraseña incorrectos.');
      }

      const user = await response.json();
      console.log('Usuario recibido:', user);

      if (user.requireChangePwd) {
        Alert.alert('Error', 'Debe cambiar su contraseña');
        setLoading(false);
        return;
      }

      await AsyncStorage.multiSet([
        ['userId', user.id],
        ['fullname', user.nombre],
        ['email', user.email],
        ['userRole', user.rol],
      ]);

      console.log('Datos guardados, redirigiendo...');
      setLoading(false);
      router.replace('/(tabs)/home');
      
    } catch (error: any) {
      console.error('Error en login:', error);
      setLoading(false);
      Alert.alert('Error', error.message || 'Ocurrió un error al iniciar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageButton}>
        <LanguageSelector />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Iniciar Sesión</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#002B5B" />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B5B',
  },
  languageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 250,
    height: 120,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  buttonText: {
    color: '#002B5B',
    fontSize: 16,
    fontWeight: '600',
  },
});
