import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PATH_URL_BACKEND } from '../../constants/api';
import i18n from '../../i18n';
import CreateTicketModal from '../../components/CreateTicketModal';
import { eventEmitter } from '../../utils/EventEmitter';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [, forceUpdate] = useState({});
  const [data, setData] = useState({
    ticketsSolicitados: 0,
    ticketsCerrados: 0,
    ticketsEnCurso: 0,
    sinAsignar: 0,
  });

  const fetchData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const res = await fetch(`${PATH_URL_BACKEND}/dashboard/cliente/${userId}`);
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleLanguageChange = () => {
      forceUpdate({});
    };

    eventEmitter.on('languageChanged', handleLanguageChange);

    return () => {
      eventEmitter.off('languageChanged', handleLanguageChange);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0075B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{i18n.t('home.title')}</Text>
            <Text style={styles.subtitle}>{i18n.t('home.subtitle')}</Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <StatCard title={i18n.t('home.requestedTickets')} value={data.ticketsSolicitados} icon="ticket-outline" color="#0075B8" />
          <StatCard title={i18n.t('home.closedTickets')} value={data.ticketsCerrados} icon="checkmark-circle-outline" color="#4CAF50" />
          <StatCard title={i18n.t('home.inProgressTickets')} value={data.ticketsEnCurso} icon="time-outline" color="#FF9800" />
          <StatCard title={i18n.t('home.unassigned')} value={data.sinAsignar} icon="alert-circle-outline" color="#F44336" />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/tickets')}
          >
            <Ionicons name="list-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>{i18n.t('home.viewTickets')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => setShowTicketModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#0075B8" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>{i18n.t('home.newTicket')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CreateTicketModal
        visible={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onSuccess={fetchData}
      />
    </View>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FC' },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#002B5B' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  cardsContainer: { padding: 20, paddingTop: 16 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  iconContainer: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#002B5B' },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#0075B8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0075B8',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#0075B8',
  },
});
