import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LanguageSelector() {
  const [visible, setVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.locale);

  const changeLanguage = async (lang: string) => {
    i18n.locale = lang;
    setCurrentLang(lang);
    await AsyncStorage.setItem('userLanguage', lang);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.button}>
        <Ionicons name="language-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <Text style={styles.title}>Seleccionar Idioma</Text>
            
            <TouchableOpacity
              style={[styles.option, currentLang === 'es' && styles.optionActive]}
              onPress={() => changeLanguage('es')}
            >
              <Text style={styles.optionText}>🇪🇸 Español</Text>
              {currentLang === 'es' && <Ionicons name="checkmark" size={20} color="#0075B8" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, currentLang === 'en' && styles.optionActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.optionText}>🇺🇸 English</Text>
              {currentLang === 'en' && <Ionicons name="checkmark" size={20} color="#0075B8" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002B5B',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F9FC',
  },
  optionActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#0075B8',
  },
  optionText: {
    fontSize: 16,
    color: '#002B5B',
  },
});
