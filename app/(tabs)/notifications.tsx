import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated, Alert, Image } from 'react-native';
import { useNotification } from '@/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';

export default function NotificationsScreen() {
  const { notifications, stopAlarm } = useNotification();
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set(prev).add(notificationId));
  };

  const deleteNotification = async (index: number) => {
    const newNotifications = localNotifications.filter((_, i) => i !== index);
    setLocalNotifications(newNotifications);
    await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  const deleteAll = () => {
    Alert.alert(
      'Eliminar todas',
      '¿Estás seguro de eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLocalNotifications([]);
            await AsyncStorage.setItem('notifications', JSON.stringify([]));
          },
        },
      ]
    );
  };

  const getFilteredNotifications = () => {
    const now = new Date();
    return localNotifications.filter(item => {
      const notifDate = new Date(item.date);
      if (filter === 'today') {
        return notifDate.toDateString() === now.toDateString();
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return notifDate >= weekAgo;
      }
      return true;
    });
  };

  const NotificationItem = ({ item, index }: any) => {
    const data = item.request.content;
    const isUrgent = data.data?.type === 'urgent';
    const notificationId = `${item.date}-${index}`;
    const isUnread = !readNotifications.has(notificationId);
    const [fadeAnim] = useState(new Animated.Value(1));

    // Usar timestamp de data si existe, sino usar item.date
    const notificationDate = data.data?.timestamp ? new Date(data.data.timestamp) : new Date(item.date);

    // Calcular tiempo transcurrido
    const getTimeAgo = () => {
      const now = new Date();
      const diffMs = now.getTime() - notificationDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      console.log('Notification date:', notificationDate.toISOString());
      console.log('Current date:', now.toISOString());
      console.log('Diff hours:', diffHours, 'Diff minutes:', diffMinutes);
      
      if (diffHours >= 24) {
        const days = Math.floor(diffHours / 24);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      } else if (diffMinutes > 0) {
        return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
      } else {
        return 'Ahora';
      }
    };

    useEffect(() => {
      if (isUnread && index === 0) {
        const blink = Animated.loop(
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
        blink.start();
        return () => blink.stop();
      }
    }, [isUnread, index]);

    const handlePress = () => {
      markAsRead(notificationId);
      router.push('/(tabs)/tickets');
    };

    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(index)}
      >
        <Ionicons name="trash" size={24} color="#fff" />
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <Animated.View style={{ opacity: isUnread && index === 0 ? fadeAnim : 1 }}>
          <TouchableOpacity
            style={[
              styles.notificationCard,
              isUrgent && styles.urgentCard,
              isUnread && styles.unreadCard,
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              isUrgent && styles.urgentIconContainer
            ]}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Text style={[
                  styles.title,
                  isUnread && styles.unreadTitle
                ]}>
                  {data.title}
                </Text>
                {isUnread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>NUEVO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.body} numberOfLines={2}>{data.body}</Text>
              <View style={styles.footer}>
                <Ionicons name="time-outline" size={14} color="#999" />
                <Text style={styles.time}>{getTimeAgo()}</Text>
                <Text style={styles.timeSeparator}>•</Text>
                <Text style={styles.timeDetail}>
                  {notificationDate.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
            {isUrgent && (
              <View style={styles.urgentIndicator}>
                <Ionicons name="warning" size={20} color="#ff0000" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    );
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          {localNotifications.length > 0 && (
            <>
              <TouchableOpacity onPress={stopAlarm} style={styles.actionButton}>
                <Ionicons name="volume-mute" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteAll} style={styles.actionButton}>
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {localNotifications.length > 0 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Notificaciones</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'today' && styles.filterButtonActive]}
              onPress={() => setFilter('today')}
            >
              <Text style={[styles.filterButtonText, filter === 'today' && styles.filterButtonTextActive]}>
                Hoy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'week' && styles.filterButtonActive]}
              onPress={() => setFilter('week')}
            >
              <Text style={[styles.filterButtonText, filter === 'week' && styles.filterButtonTextActive]}>
                Últimos 7 días
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#e0e0e0" />
          </View>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptySubtitle}>
            {localNotifications.length > 0 ? 'No hay notificaciones en este rango' : 'Aquí aparecerán tus alertas'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={({ item, index }) => <NotificationItem item={item} index={index} />}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#002B5B',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002B5B',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#002B5B',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  urgentCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#ff0000',
    backgroundColor: '#fff5f5',
  },
  unreadCard: {
    borderWidth: 2,
    borderColor: '#002B5B',
    backgroundColor: '#f0f7ff',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#002B5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  urgentIconContainer: {
    backgroundColor: '#ff0000',
  },
  logo: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: '#002B5B',
  },
  unreadBadge: {
    backgroundColor: '#002B5B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 6,
  },
  timeDetail: {
    fontSize: 11,
    color: '#bbb',
  },
  urgentIndicator: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
