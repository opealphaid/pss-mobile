import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { ticketService } from '../services/tickets';
import i18n from '../i18n';

interface SafeTicket {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  categoria: string;
  fechaCreacion: string;
  imagen?: string;
}

export default function TicketsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<SafeTicket[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('EN_PROGRESO');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const downloadImage = async () => {
    if (!selectedImage) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso para guardar imágenes');
        return;
      }

      const filename = selectedImage.split('/').pop() || 'ticket-image.jpg';
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadResult = await FileSystem.downloadAsync(selectedImage, fileUri);
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync('PSS Mobile', asset, false);

      Alert.alert('Éxito', 'Imagen descargada correctamente');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar la imagen');
    }
  };

  const estados = ['Todos', 'ABIERTO', 'ACEPTADO', 'ASIGNADO', 'EN_PROGRESO', 'RESUELTO'];

  const sanitizeTicket = (ticket: any): SafeTicket => {
    return {
      id: String(ticket?.id || ''),
      titulo: String(ticket?.titulo || ''),
      descripcion: String(ticket?.descripcion || ''),
      estado: typeof ticket?.estado === 'object' ? String(ticket.estado?.nombre || '') : String(ticket?.estado || ''),
      categoria: typeof ticket?.categoria === 'object' ? String(ticket.categoria?.nombre || '') : String(ticket?.categoria || ''),
      fechaCreacion: String(ticket?.fechaCreacion || new Date().toISOString()),
      imagen: ticket?.imagen || null,
    };
  };

  const fetchTickets = async () => {
    try {
      const filters = {
        titulo: searchText || null,
        categoriaid: null,
        prioridadId: null,
        ciudadid: null,
        estado: selectedStatus === 'Todos' ? null : selectedStatus,
        fechaApertura: null,
        fechaCierre: null,
      };
      
      const data = await ticketService.getTickets(filters);
      const sanitized = data.map(sanitizeTicket);
      setTickets(sanitized);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedStatus, searchText]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleFilterChange = (estado: string) => {
    setTickets([]);
    setLoading(true);
    setSelectedStatus(estado);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'ABIERTO': return '#2196F3';
      case 'ACEPTADO': return '#9C27B0';
      case 'ASIGNADO': return '#FF9800';
      case 'EN_PROGRESO': return '#FFC107';
      case 'RESUELTO': return '#4CAF50';
      default: return '#757575';
    }
  };

  const renderTicket = ({ item }: { item: SafeTicket }) => (
    <TouchableOpacity style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={1}>{item.titulo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.ticketDescription} numberOfLines={2}>{item.descripcion}</Text>
      {item.imagen && (
        <TouchableOpacity onPress={() => handleImagePress(item.imagen!)}>
          <Image source={{ uri: item.imagen }} style={styles.ticketImage} />
        </TouchableOpacity>
      )}
      <View style={styles.ticketFooter}>
        <View style={styles.ticketInfo}>
          <Ionicons name="folder-outline" size={14} color="#666" />
          <Text style={styles.ticketInfoText}>{item.categoria}</Text>
        </View>
        <View style={styles.ticketInfo}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.ticketInfoText}>
            {new Date(item.fechaCreacion).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0075B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={i18n.t('customerTicket.searchPlaceholder')}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {estados.map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[styles.filterButton, selectedStatus === estado && styles.filterButtonActive]}
            onPress={() => handleFilterChange(estado)}
          >
            <Text style={[styles.filterButtonText, selectedStatus === estado && styles.filterButtonTextActive]}>
              {estado === 'Todos' ? i18n.t('customerTicket.all') :
               estado === 'ABIERTO' ? i18n.t('customerTicket.open') :
               estado === 'ACEPTADO' ? i18n.t('customerTicket.accepted') :
               estado === 'ASIGNADO' ? i18n.t('customerTicket.assigned') :
               estado === 'EN_PROGRESO' ? i18n.t('customerTicket.inProgress') :
               estado === 'RESUELTO' ? i18n.t('customerTicket.resolved') : estado}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay tickets disponibles</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
            )}
            <TouchableOpacity style={styles.downloadButton} onPress={downloadImage}>
              <Ionicons name="download-outline" size={24} color="#fff" />
              <Text style={styles.downloadButtonText}>Descargar Imagen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#0075B8',
    borderColor: '#0075B8',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  ticketCard: {
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002B5B',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  ticketImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0075B8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
