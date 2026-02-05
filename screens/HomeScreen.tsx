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
import { ticketService } from '../services/tickets';
import { DashboardData } from '../types';
import i18n from '../i18n';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData>({
    ticketsSolicitados: 0,
    ticketsCerrados: 0,
    ticketsEnCurso: 0,
    sinAsignar: 0,
    ticketsPorEstado: {},
    ticketsCreadosPorMes: {},
  });

  const fetchData = async () => {
    try {
      const dashboardData = await ticketService.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0075B8" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('home.title')}</Text>
        <TouchableOpacity
          style={styles.viewTicketsButton}
          onPress={() => router.push('/(tabs)/tickets')}
        >
          <Text style={styles.viewTicketsText}>{i18n.t('home.viewTickets')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <StatCard
          title={i18n.t('home.requestedTickets')}
          value={data.ticketsSolicitados}
          icon="ticket-outline"
          color="#0075B8"
        />
        <StatCard
          title={i18n.t('home.closedTickets')}
          value={data.ticketsCerrados}
          icon="checkmark-circle-outline"
          color="#4CAF50"
        />
        <StatCard
          title={i18n.t('home.inProgressTickets')}
          value={data.ticketsEnCurso}
          icon="time-outline"
          color="#FF9800"
        />
        <StatCard
          title={i18n.t('home.unassigned')}
          value={data.sinAsignar}
          icon="alert-circle-outline"
          color="#F44336"
        />
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>{i18n.t('home.ticketsByStatus')}</Text>
        <View style={styles.chartPlaceholder}>
          {Object.entries(data.ticketsPorEstado).map(([estado, cantidad]) => (
            <View key={estado} style={styles.chartItem}>
              <Text style={styles.chartLabel}>{estado}</Text>
              <Text style={styles.chartValue}>{cantidad}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002B5B',
  },
  viewTicketsButton: {
    backgroundColor: '#002B5B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewTicketsText: {
    color: '#fff',
    fontWeight: '600',
  },
  cardsContainer: {
    padding: 20,
    paddingTop: 0,
  },
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
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002B5B',
  },
  chartSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002B5B',
    marginBottom: 16,
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chartLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002B5B',
  },
});
