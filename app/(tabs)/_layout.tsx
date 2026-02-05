import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventEmitter } from '../../utils/EventEmitter';

export default function TabsLayout() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const loadLocale = async () => {
      const savedLocale = await AsyncStorage.getItem('locale');
      if (savedLocale) {
        i18n.locale = savedLocale;
        forceUpdate({});
      }
    };
    loadLocale();

    const handleLanguageChange = () => {
      forceUpdate({});
    };

    eventEmitter.on('languageChanged', handleLanguageChange);

    return () => {
      eventEmitter.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0075B8',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: '#002B5B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: i18n.t('header.home'),
          tabBarLabel: i18n.t('header.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: i18n.t('header.tickets'),
          tabBarLabel: i18n.t('header.tickets'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t('header.profile'),
          tabBarLabel: i18n.t('header.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
