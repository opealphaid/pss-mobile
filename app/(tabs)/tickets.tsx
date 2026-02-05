import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { PATH_URL_BACKEND, PATH_DOCUMENTS } from "../../constants/api";
import i18n from "../../i18n";
import { eventEmitter } from "../../utils/EventEmitter";

export default function TicketsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ABIERTO");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [ticketFiles, setTicketFiles] = useState<any[]>([]);
  const [, forceUpdate] = useState({});

  const estados = [
    "Todos",
    "ABIERTO",
    "ACEPTADO",
    "ASIGNADO",
    "EN_PROGRESO",
    "RESUELTO",
  ];

  const fetchTickets = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const filters = {
        titulo: searchText || null,
        estado: selectedStatus === "Todos" ? null : selectedStatus,
      };

      const response = await fetch(
        `${PATH_URL_BACKEND}/tickets/normal/cliente-filter/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        },
      );

      if (!response.ok) throw new Error("Error al obtener tickets");

      const data = await response.json();
      setTickets(
        data.sort(
          (a: any, b: any) =>
            new Date(b.fechaCreacion).getTime() -
            new Date(a.fechaCreacion).getTime(),
        ),
      );
    } catch (error) {
      console.error("Error al cargar tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTicketFiles = async (ticketId: string) => {
    try {
      console.log('Fetching files for ticket:', ticketId);
      const response = await fetch(`${PATH_DOCUMENTS}/files/item/${ticketId}/tipo/solicitante`);
      console.log('Files response status:', response.status);
      
      if (response.ok) {
        const files = await response.json();
        console.log('Files loaded:', files.length, 'files');
        console.log('Files data:', JSON.stringify(files, null, 2));
        setTicketFiles(files);
      } else {
        console.log('No files found or error loading files');
        setTicketFiles([]);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
      setTicketFiles([]);
    }
  };

  useEffect(() => {
    fetchTickets();

    const handleLanguageChange = () => {
      forceUpdate({});
    };

    eventEmitter.on('languageChanged', handleLanguageChange);

    return () => {
      eventEmitter.off('languageChanged', handleLanguageChange);
    };
  }, [selectedStatus, searchText]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "ABIERTO":
        return "#2196F3";
      case "ACEPTADO":
        return "#9C27B0";
      case "ASIGNADO":
        return "#FF9800";
      case "EN_PROGRESO":
        return "#FFC107";
      case "RESUELTO":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const getStatusLabel = (estado: string) => {
    const labels: any = {
      Todos: i18n.t("customerTicket.all"),
      ABIERTO: i18n.t("customerTicket.open"),
      ACEPTADO: i18n.t("customerTicket.accepted"),
      ASIGNADO: i18n.t("customerTicket.assigned"),
      EN_PROGRESO: i18n.t("customerTicket.inProgress"),
      RESUELTO: i18n.t("customerTicket.resolved"),
    };
    return labels[estado] || estado;
  };

  const renderTicket = ({ item }: { item: any }) => {
    const titulo = String(item?.titulo || '');
    const descripcion = String(item?.descripcion || '');
    const estado = typeof item?.estado === 'object' ? String(item.estado?.nombre || '') : String(item?.estado || '');
    const categoria = typeof item?.categoria === 'object' ? String(item.categoria?.nombre || '') : String(item?.categoria || '');
    const fechaCreacion = String(item?.fechaCreacion || new Date().toISOString());

    return (
      <TouchableOpacity 
        style={styles.ticketCard}
        onPress={async () => {
          setSelectedTicket(item);
          await fetchTicketFiles(item.id);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle} numberOfLines={1}>
            {titulo}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(estado) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(estado)}</Text>
          </View>
        </View>
        <Text style={styles.ticketDescription} numberOfLines={2}>
          {descripcion}
        </Text>
        <View style={styles.ticketFooter}>
          <View style={styles.ticketInfo}>
            <Ionicons name="folder-outline" size={14} color="#666" />
            <Text style={styles.ticketInfoText}>{categoria}</Text>
          </View>
          <View style={styles.ticketInfo}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.ticketInfoText}>
              {new Date(fechaCreacion).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={i18n.t("customerTicket.searchPlaceholder")}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Ionicons name="options-outline" size={20} color="#0075B8" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTickets} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{i18n.t('customerTicket.noTickets')}</Text>
          </View>
        }
      />

      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('customerTicket.filterByStatus')}</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterList}>
              {estados.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.filterOption,
                    selectedStatus === estado && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedStatus(estado);
                    setShowFilters(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedStatus === estado &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {getStatusLabel(estado)}
                  </Text>
                  {selectedStatus === estado && (
                    <Ionicons name="checkmark" size={20} color="#0075B8" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('customerTicket.ticketDetail')}</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScroll}>
              {selectedTicket && (
                <View style={styles.detailContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.caseNumber')}:</Text>
                    <Text style={styles.detailValue}>{selectedTicket.id}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.title')}:</Text>
                    <Text style={styles.detailValue}>{String(selectedTicket.titulo || '')}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.status')}:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(typeof selectedTicket.estado === 'object' ? selectedTicket.estado?.nombre : selectedTicket.estado) }]}>
                      <Text style={styles.statusText}>
                        {getStatusLabel(typeof selectedTicket.estado === 'object' ? selectedTicket.estado?.nombre : selectedTicket.estado)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.category')}:</Text>
                    <Text style={styles.detailValue}>
                      {typeof selectedTicket.categoria === 'object' ? selectedTicket.categoria?.nombre : selectedTicket.categoria}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.subcategory')}:</Text>
                    <Text style={styles.detailValue}>
                      {typeof selectedTicket.subCategoria === 'object' ? selectedTicket.subCategoria?.nombre : selectedTicket.subCategoria || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.priority')}:</Text>
                    <Text style={styles.detailValue}>
                      {typeof selectedTicket.prioridad === 'object' ? selectedTicket.prioridad?.nombre : selectedTicket.prioridad || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.creationDate')}:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedTicket.fechaCreacion).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detailRowFull}>
                    <Text style={styles.detailLabel}>{i18n.t('customerTicket.description')}:</Text>
                    <Text style={styles.detailValueFull}>{String(selectedTicket.descripcion || '')}</Text>
                  </View>

                  {selectedTicket.tecnologia && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{i18n.t('customerTicket.technology')}:</Text>
                      <Text style={styles.detailValue}>{selectedTicket.tecnologia}</Text>
                    </View>
                  )}

                  {selectedTicket.ubicacion && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{i18n.t('customerTicket.location')}:</Text>
                      <Text style={styles.detailValue}>{selectedTicket.ubicacion}</Text>
                    </View>
                  )}

                  {ticketFiles.length > 0 && (
                    <View style={styles.detailRowFull}>
                      <Text style={styles.detailLabel}>Archivos Adjuntos:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filesScroll}>
                        {ticketFiles.map((file: any, index: number) => (
                          <TouchableOpacity key={index} style={styles.filePreview}>
                            {file.fileType?.startsWith('image/') ? (
                              <Image 
                                source={{ uri: `${PATH_DOCUMENTS}/files/download/${file.id}` }} 
                                style={styles.fileImage}
                              />
                            ) : (
                              <View style={styles.fileIcon}>
                                <Ionicons name="document-outline" size={40} color="#0075B8" />
                              </View>
                            )}
                            <Text style={styles.fileName} numberOfLines={1}>{file.fileNameOriginal}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FC" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F9FC",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: "#333" },
  filterButton: { padding: 8 },
  listContainer: { padding: 16 },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#002B5B",
    marginRight: 8,
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  ticketDescription: { fontSize: 14, color: "#666", marginBottom: 12 },
  ticketFooter: { flexDirection: "row", justifyContent: "space-between" },
  ticketInfo: { flexDirection: "row", alignItems: "center" },
  ticketInfoText: { fontSize: 12, color: "#666", marginLeft: 4 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, color: "#999", marginTop: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#002B5B" },
  filterList: { maxHeight: 400 },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F5F9FC",
  },
  filterOptionActive: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#0075B8",
  },
  filterOptionText: { fontSize: 16, color: "#002B5B" },
  filterOptionTextActive: { fontWeight: "600" },
  detailModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  detailScroll: { maxHeight: 500 },
  detailContainer: { gap: 16 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailRowFull: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: { fontSize: 14, fontWeight: "600", color: "#002B5B", flex: 1 },
  detailValue: { fontSize: 14, color: "#333", flex: 1, textAlign: "right" },
  detailValueFull: { fontSize: 14, color: "#333", marginTop: 8 },
  filesScroll: { marginTop: 12 },
  filePreview: {
    width: 100,
    marginRight: 12,
    alignItems: "center",
  },
  fileImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F5F9FC",
  },
  fileIcon: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  fileName: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
    textAlign: "center",
  },
});
