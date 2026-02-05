import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { PATH_URL_BACKEND, PATH_DOCUMENTS } from '../constants/api';
import i18n from '../i18n';
import { eventEmitter } from '../utils/EventEmitter';

interface CreateTicketModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTicketModal({ visible, onClose, onSuccess }: CreateTicketModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState({});
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [ciudades, setCiudades] = useState<any[]>([]);
  const [ciudadId, setCiudadId] = useState('');
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tecnologia, setTecnologia] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  
  const [prioridades, setPrioridades] = useState<any[]>([]);
  const [prioridadId, setPrioridadId] = useState('');
  
  const [archivos, setArchivos] = useState<any[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchSubcategory, setSearchSubcategory] = useState('');

  useEffect(() => {
    if (visible) {
      fetchInitialData();
    }
  }, [visible]);

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    eventEmitter.on('languageChanged', handleLanguageChange);

    return () => {
      eventEmitter.off('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    if (categoriaId) {
      fetchSubcategorias();
    } else {
      setSubcategorias([]);
      setSubcategoriaId('');
    }
  }, [categoriaId]);

  const fetchInitialData = async () => {
    try {
      const [catRes, prioRes, ciudRes] = await Promise.all([
        fetch(`${PATH_URL_BACKEND}/categorias`),
        fetch(`${PATH_URL_BACKEND}/prioridades`),
        fetch(`${PATH_URL_BACKEND}/ciudad`),
      ]);
      
      setCategorias(await catRes.json());
      setPrioridades(await prioRes.json());
      const ciudadesData = await ciudRes.json();
      
      const ciudadesHabilitadas = ciudadesData.filter((c: any) => c.nombre === 'La Paz');
      setCiudades(ciudadesHabilitadas);
      
      if (ciudadesHabilitadas.length > 0) {
        setCiudadId(ciudadesHabilitadas[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const res = await fetch(`${PATH_URL_BACKEND}/subcategorias/por-categoria/${categoriaId}`);
      setSubcategorias(await res.json());
    } catch (error) {
      console.error('Error cargando subcategorías:', error);
    }
  };

  const pickFile = async () => {
    const options = [i18n.t('createTicket.takePhoto'), i18n.t('createTicket.chooseGallery'), i18n.t('createTicket.selectDocument'), i18n.t('createTicket.cancel')];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) await takePhoto();
          else if (buttonIndex === 1) await pickImage();
          else if (buttonIndex === 2) await pickDocument();
        }
      );
    } else {
      Alert.alert(i18n.t('createTicket.selectFiles'), i18n.t('createTicket.filesSubtext'), [
        { text: i18n.t('createTicket.takePhoto'), onPress: takePhoto },
        { text: i18n.t('createTicket.chooseGallery'), onPress: pickImage },
        { text: i18n.t('createTicket.selectDocument'), onPress: pickDocument },
        { text: i18n.t('createTicket.cancel'), style: 'cancel' },
      ]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(i18n.t('createTicket.error'), i18n.t('createTicket.permissionError'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setArchivos([...archivos, {
        uri: result.assets[0].uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image',
      }]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(i18n.t('createTicket.error'), i18n.t('createTicket.permissionError'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setArchivos([...archivos, {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
        type: result.assets[0].type || 'image',
      }]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        setArchivos([...archivos, {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: 'document',
        }]);
      }
    } catch (error) {
      Alert.alert(i18n.t('createTicket.error'), i18n.t('createTicket.fileError'));
    }
  };

  const removeFile = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!categoriaId || !subcategoriaId) {
        Alert.alert(i18n.t('createTicket.error'), i18n.t('createTicket.selectCategoryError'));
        return;
      }
    } else if (step === 2) {
      if (!titulo.trim() || !descripcion.trim()) {
        Alert.alert(i18n.t('createTicket.error'), i18n.t('createTicket.completeTitleError'));
        return;
      }
    } else if (step === 3) {
      if (!prioridadId) {
        Alert.alert(i18n.t('createTicket.error'), i18n.t('createTicket.selectPriorityError'));
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const ticketData = {
        titulo,
        descripcion,
        prioridadId: parseInt(prioridadId),
        tecnologia: tecnologia || null,
        ubicacion: ubicacion || null,
        categoriaId: String(categoriaId),
        subCategoriaId: String(subcategoriaId),
        solicitanteId: String(userId),
        ciudadId: String(ciudadId),
        solicitanteExtraId: String(userId),
      };
      
      console.log('Ticket Data:', JSON.stringify(ticketData, null, 2));

      const response = await fetch(`${PATH_URL_BACKEND}/tickets/crear-normal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear ticket');
      }

      const ticketCreado = await response.json();
      
      if (archivos.length > 0) {
        await subirArchivos(ticketCreado.id);
      }

      Alert.alert(i18n.t('createTicket.success'), i18n.t('createTicket.ticketCreated'));
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al crear ticket:', error.message);
      Alert.alert(i18n.t('createTicket.error'), `${i18n.t('createTicket.createError')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const subirArchivos = async (ticketId: string) => {
    const token = await AsyncStorage.getItem('token');
    console.log('Uploading', archivos.length, 'files for ticket:', ticketId);
    
    for (const archivo of archivos) {
      try {
        console.log('Uploading file:', archivo.name, 'type:', archivo.type);
        const formData = new FormData();
        
        const file: any = {
          uri: archivo.uri,
          type: archivo.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          name: archivo.name,
        };
        
        formData.append('file', file);
        formData.append('idItem', ticketId);
        formData.append('entityType', 'solicitante');

        const response = await fetch(`${PATH_DOCUMENTS}/files/upload`, {
          method: 'POST',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        });

        console.log('Upload response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error uploading ${archivo.name}:`, errorText);
        } else {
          const result = await response.json();
          console.log('File uploaded successfully:', result);
        }
      } catch (error) {
        console.error(`Error uploading file ${archivo.name}:`, error);
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setCategoriaId('');
    setSubcategoriaId('');
    setCiudadId('');
    setTitulo('');
    setDescripcion('');
    setTecnologia('');
    setUbicacion('');
    setPrioridadId('');
    setArchivos([]);
    setSearchCategory('');
    setSearchSubcategory('');
  };

  const filteredCategorias = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const filteredSubcategorias = subcategorias.filter((sub) =>
    sub.nombre.toLowerCase().includes(searchSubcategory.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#002B5B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{i18n.t('createTicket.title')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.stepperContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={styles.stepperItem}>
              <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>
              </View>
              {s < 4 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{i18n.t('createTicket.ticketInfo')}</Text>

              <Text style={styles.label}>{i18n.t('createTicket.cityRegional')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityContainer}>
                {ciudades.map((ciudad) => (
                  <TouchableOpacity
                    key={ciudad.id}
                    style={[
                      styles.cityChip,
                      ciudadId === ciudad.id && styles.cityChipActive,
                    ]}
                    onPress={() => setCiudadId(ciudad.id)}
                  >
                    <Text style={[
                      styles.cityChipText,
                      ciudadId === ciudad.id && styles.cityChipTextActive,
                    ]}>
                      {ciudad.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>{i18n.t('createTicket.category')} *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.selectButtonText, !categoriaId && styles.placeholder]}>
                  {categoriaId
                    ? categorias.find((c) => c.id === categoriaId)?.nombre
                    : i18n.t('createTicket.selectCategory')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#0075B8" />
              </TouchableOpacity>

              {categoriaId && (
                <>
                  <Text style={styles.label}>{i18n.t('createTicket.subcategory')} *</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowSubcategoryModal(true)}
                  >
                    <Text style={[styles.selectButtonText, !subcategoriaId && styles.placeholder]}>
                      {subcategoriaId
                        ? subcategorias.find((s) => s.id === subcategoriaId)?.nombre
                        : i18n.t('createTicket.selectSubcategory')}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#0075B8" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{i18n.t('createTicket.problemDetails')}</Text>

              <Text style={styles.label}>{i18n.t('createTicket.title_field')} *</Text>
              <TextInput
                style={styles.input}
                placeholder={i18n.t('createTicket.enterTitle')}
                value={titulo}
                onChangeText={setTitulo}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>{i18n.t('createTicket.description')} *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={i18n.t('createTicket.describeDetail')}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>{i18n.t('createTicket.technology')}</Text>
              <TextInput
                style={styles.input}
                placeholder={i18n.t('createTicket.technologyExample')}
                value={tecnologia}
                onChangeText={setTecnologia}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>{i18n.t('createTicket.location')}</Text>
              <TextInput
                style={styles.input}
                placeholder={i18n.t('createTicket.locationExample')}
                value={ubicacion}
                onChangeText={setUbicacion}
                placeholderTextColor="#999"
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{i18n.t('createTicket.ticketPriority')}</Text>
              <Text style={styles.subtitle}>{i18n.t('createTicket.selectPriority')}</Text>

              {prioridades.map((prioridad) => (
                <TouchableOpacity
                  key={prioridad.id}
                  style={[
                    styles.priorityCard,
                    prioridadId === String(prioridad.id) && styles.priorityCardActive,
                  ]}
                  onPress={() => setPrioridadId(String(prioridad.id))}
                >
                  <View style={styles.priorityContent}>
                    <Text style={styles.priorityName}>{prioridad.nombre}</Text>
                    {prioridad.descripcion && (
                      <Text style={styles.priorityDescription}>{prioridad.descripcion}</Text>
                    )}
                  </View>
                  {prioridadId === String(prioridad.id) && (
                    <Ionicons name="checkmark-circle" size={24} color="#0075B8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{i18n.t('createTicket.attachments')}</Text>

              <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
                <Ionicons name="cloud-upload-outline" size={32} color="#0075B8" />
                <Text style={styles.uploadButtonText}>{i18n.t('createTicket.selectFiles')}</Text>
                <Text style={styles.uploadButtonSubtext}>{i18n.t('createTicket.filesSubtext')}</Text>
              </TouchableOpacity>

              {archivos.length > 0 && (
                <View style={styles.filesContainer}>
                  {archivos.map((archivo, index) => (
                    <View key={index} style={styles.fileItem}>
                      {archivo.type === 'image' ? (
                        <Image source={{ uri: archivo.uri }} style={styles.fileImage} />
                      ) : (
                        <View style={styles.fileIcon}>
                          <Ionicons name="document-outline" size={32} color="#0075B8" />
                        </View>
                      )}
                      <Text style={styles.fileName} numberOfLines={1}>
                        {archivo.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFile(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.buttonSecondaryText}>{i18n.t('createTicket.back')}</Text>
            </TouchableOpacity>
          )}

          {step < 4 ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, step === 1 && styles.buttonFull]}
              onPress={handleNext}
            >
              <Text style={styles.buttonPrimaryText}>{i18n.t('createTicket.next')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>{i18n.t('createTicket.create')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={showCategoryModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{i18n.t('createTicket.category')}</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={i18n.t('createTicket.searchCategory')}
                  value={searchCategory}
                  onChangeText={setSearchCategory}
                  placeholderTextColor="#999"
                />
              </View>

              <ScrollView style={styles.optionsList}>
                {filteredCategorias.length > 0 ? (
                  filteredCategorias.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.optionItem,
                        categoriaId === cat.id && styles.optionItemActive,
                      ]}
                      onPress={() => {
                        setCategoriaId(cat.id);
                        setSubcategoriaId('');
                        setShowCategoryModal(false);
                        setSearchCategory('');
                      }}
                    >
                      <Text style={styles.optionText}>{cat.nombre}</Text>
                      {categoriaId === cat.id && (
                        <Ionicons name="checkmark" size={20} color="#0075B8" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>{i18n.t('createTicket.noCategories')}</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={showSubcategoryModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{i18n.t('createTicket.subcategory')}</Text>
                <TouchableOpacity onPress={() => setShowSubcategoryModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={i18n.t('createTicket.searchSubcategory')}
                  value={searchSubcategory}
                  onChangeText={setSearchSubcategory}
                  placeholderTextColor="#999"
                />
              </View>

              <ScrollView style={styles.optionsList}>
                {filteredSubcategorias.length > 0 ? (
                  filteredSubcategorias.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.optionItem,
                        subcategoriaId === sub.id && styles.optionItemActive,
                      ]}
                      onPress={() => {
                        setSubcategoriaId(sub.id);
                        setShowSubcategoryModal(false);
                        setSearchSubcategory('');
                      }}
                    >
                      <Text style={styles.optionText}>{sub.nombre}</Text>
                      {subcategoriaId === sub.id && (
                        <Ionicons name="checkmark" size={20} color="#0075B8" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>{i18n.t('createTicket.noSubcategories')}</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#002B5B' },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  stepperItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: { backgroundColor: '#0075B8' },
  stepNumber: { fontSize: 16, fontWeight: '600', color: '#999' },
  stepNumberActive: { color: '#fff' },
  stepLine: { width: 40, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#0075B8' },
  content: { flex: 1, padding: 20 },
  stepContent: { paddingBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#002B5B', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#002B5B', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectButtonText: { fontSize: 16, color: '#333', flex: 1 },
  placeholder: { color: '#999' },
  priorityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  priorityCardActive: { borderColor: '#0075B8', backgroundColor: '#E3F2FD' },
  priorityContent: { flex: 1 },
  priorityName: { fontSize: 16, fontWeight: '600', color: '#002B5B', marginBottom: 4 },
  priorityDescription: { fontSize: 14, color: '#666' },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0075B8',
    borderStyle: 'dashed',
  },
  uploadButtonText: { fontSize: 16, fontWeight: '600', color: '#0075B8', marginTop: 12 },
  uploadButtonSubtext: { fontSize: 14, color: '#666', marginTop: 4 },
  filesContainer: { marginTop: 16 },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  fileIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileName: { flex: 1, fontSize: 14, color: '#333' },
  removeButton: { padding: 4 },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
  buttonFull: { flex: 1 },
  buttonPrimary: { backgroundColor: '#0075B8' },
  buttonSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#0075B8' },
  buttonPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonSecondaryText: { color: '#0075B8', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#002B5B' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: '#333', marginLeft: 8 },
  optionsList: { maxHeight: 400 },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F9FC',
  },
  optionItemActive: { backgroundColor: '#E3F2FD', borderWidth: 2, borderColor: '#0075B8' },
  optionText: { fontSize: 16, color: '#002B5B', flex: 1 },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', paddingVertical: 32 },
  cityContainer: { marginBottom: 8 },
  cityChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  cityChipActive: {
    backgroundColor: '#0075B8',
    borderColor: '#0075B8',
  },
  cityChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: '#fff',
  },
});
