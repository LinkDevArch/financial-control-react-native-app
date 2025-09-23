import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Tag, Save } from 'lucide-react-native';
import { useCategoryActions } from '../../../src/hooks/useCategoryActions';
import AppButton from '../../../src/components/AppButton';
import Header from '../../../src/components/Header';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditCategoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const categoryId = Number(params.categoryId);
  const initialName = params.categoryName as string || '';
  
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  
  const { updateCategory } = useCategoryActions();

  const handleBack = () => {
    router.back();
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es requerido');
      return false;
    }
    
    if (name.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    if (name.trim().length > 50) {
      Alert.alert('Error', 'El nombre no puede exceder 50 caracteres');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    // Verificar si hay cambios
    if (name.trim() === initialName) {
      Alert.alert('Información', 'No se han realizado cambios');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updateCategory(categoryId, {
        name: name.trim()
      });
      
      if (result.success) {
        Alert.alert('Éxito', 'Categoría actualizada correctamente', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        const errorMessage = result.error?.join(', ') || 'Error al actualizar la categoría';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = name.trim() !== initialName;

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header title='Editar Categoria' showBackButton={true} showConfig={false}/>
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Categoría</Text>
        <View style={styles.placeholder} />
      </View> */}

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Tag color="#4A90E2" size={32} />
            </View>
            <Text style={styles.iconLabel}>Categoría</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre de la categoría *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Alimentación, Transporte, Entretenimiento..."
                placeholderTextColor="#999"
                maxLength={50}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            {hasChanges && (
              <View style={styles.changesIndicator}>
                <Text style={styles.changesText}>✓ Cambios pendientes por guardar</Text>
              </View>
            )}

            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>💡 Consejos para editar categorías:</Text>
              <Text style={styles.helpText}>• Mantén nombres descriptivos y específicos</Text>
              <Text style={styles.helpText}>• Evita categorías muy generales</Text>
              <Text style={styles.helpText}>• Los cambios afectarán transacciones futuras</Text>
              <Text style={styles.helpText}>• Las transacciones anteriores mantendrán el nombre original</Text>
            </View>

            <View style={styles.buttonContainer}>
              <AppButton
                title={loading ? "Guardando..." : "Guardar Cambios"}
                onPress={handleSave}
                icon={<Save color="#fff" size={20} />}
                bgColor={hasChanges ? "#4A90E2" : "#ccc"}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A90E2',
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  changesIndicator: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  changesText: {
    fontSize: 14,
    color: '#2d7d2d',
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
});
