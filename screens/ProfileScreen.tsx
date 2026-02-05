import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../services/user';
import { authService } from '../services/auth';
import { Usuario } from '../types';
import i18n from '../i18n';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.locale);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await userService.getProfile();
      setUsuario(data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      await userService.changePassword(oldPassword, newPassword, confirmPassword);
      Alert.alert('Éxito', 'La contraseña se ha cambiado correctamente');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Hubo un problema al cambiar la contraseña');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      i18n.t('header.logoutConfirm'),
      '',
      [
        { text: i18n.t('header.logoutCancel'), style: 'cancel' },
        {
          text: i18n.t('header.logoutYes'),
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const changeLanguage = async (lang: string) => {
    i18n.locale = lang;
    setCurrentLang(lang);
    await AsyncStorage.setItem('userLanguage', lang);
    await AsyncStorage.setItem('locale', lang);
    setShowLanguageModal(false);
    
    // Emitir evento de cambio de idioma
    const { eventEmitter } = require('../utils/EventEmitter');
    eventEmitter.emit('languageChanged', lang);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0075B8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#0075B8" />
        </View>
        <Text style={styles.userName}>{usuario?.nombre} {usuario?.apellidos}</Text>
        <Text style={styles.userEmail}>{usuario?.email}</Text>
        
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Ionicons name="language-outline" size={20} color="#0075B8" />
          <Text style={styles.languageButtonText}>
            {currentLang === 'es' ? 'Español' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            {i18n.t('profileClient.personalInfo')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'security' && styles.tabActive]}
          onPress={() => setActiveTab('security')}
        >
          <Text style={[styles.tabText, activeTab === 'security' && styles.tabTextActive]}>
            {i18n.t('profileClient.security')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? (
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>{i18n.t('profileClient.name')}</Text>
            <Text style={styles.value}>{usuario?.nombre}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.label}>{i18n.t('profileClient.lastName')}</Text>
            <Text style={styles.value}>{usuario?.apellidos}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.label}>{i18n.t('profileClient.email')}</Text>
            <Text style={styles.value}>{usuario?.email}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.label}>{i18n.t('profileClient.role')}</Text>
            <Text style={styles.value}>{usuario?.rol}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.label}>{i18n.t('profileClient.company')}</Text>
            <Text style={styles.value}>{usuario?.empresa}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.label}>{i18n.t('profileClient.regional')}</Text>
            <Text style={styles.value}>{usuario?.regional}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{i18n.t('profileClient.changePassword')}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{i18n.t('profileClient.currentPassword')}</Text>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{i18n.t('profileClient.newPassword')}</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{i18n.t('profileClient.confirmPassword')}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>{i18n.t('profileClient.saveChanges')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#F44336" />
        <Text style={styles.logoutText}>{i18n.t('profileClient.logout')}</Text>
      </TouchableOpacity>

      <Modal visible={showLanguageModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.languageModal}>
            <Text style={styles.modalTitle}>{i18n.t('profileClient.selectLanguage')}</Text>
            
            <TouchableOpacity
              style={[styles.languageOption, currentLang === 'es' && styles.languageOptionActive]}
              onPress={() => changeLanguage('es')}
            >
              <Text style={styles.languageOptionText}>🇪🇸 Español</Text>
              {currentLang === 'es' && <Ionicons name="checkmark" size={20} color="#0075B8" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, currentLang === 'en' && styles.languageOptionActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.languageOptionText}>🇺🇸 English</Text>
              {currentLang === 'en' && <Ionicons name="checkmark" size={20} color="#0075B8" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002B5B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0075B8',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#0075B8',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#002B5B',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002B5B',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#0075B8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  languageButtonText: {
    color: '#0075B8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002B5B',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F9FC',
  },
  languageOptionActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#0075B8',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#002B5B',
  },
});
