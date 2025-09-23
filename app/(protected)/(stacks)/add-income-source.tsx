import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { ChevronLeft, DollarSign, Save } from 'lucide-react-native';
import { useIncomeSourceActions } from '../../../src/hooks/useIncomeSourceActions';
import AppButton from '../../../src/components/AppButton';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from '../../../src/components/Header';

export default function AddIncomeSourceScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addIncomeSource } = useIncomeSourceActions();

  const handleBack = () => {
    router.back();
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la fuente de ingreso es requerido');
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
    
    setLoading(true);
    
    try {
      const result = await addIncomeSource({
        name: name.trim()
      });
      
      if (result.success) {
        Alert.alert('Éxito', 'Fuente de ingreso creada correctamente', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        const errorMessage = result.error?.join(', ') || 'Error al crear la fuente de ingreso';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al crear la fuente de ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header showBackButton={true} title='Nueva Fuente de Ingreso' showConfig={false}/>

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
              <DollarSign color="#10B981" size={32} />
            </View>
            <Text style={styles.iconLabel}>Fuente de Ingreso</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre de la fuente *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Salario, Freelance, Inversiones, Ventas..."
                placeholderTextColor="#999"
                maxLength={50}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>💡 Consejos para crear fuentes de ingreso:</Text>
              <Text style={styles.helpText}>• Usa nombres descriptivos (ej: "Salario Principal", "Ventas Online")</Text>
              <Text style={styles.helpText}>• Diferencia entre ingresos regulares e irregulares</Text>
              <Text style={styles.helpText}>• Incluye detalles específicos si tienes múltiples trabajos</Text>
              <Text style={styles.helpText}>• Esto te ayudará a organizar mejor tus ingresos</Text>
            </View>

            <View style={styles.buttonContainer}>
              <AppButton
                title={loading ? "Creando..." : "Crear Fuente de Ingreso"}
                onPress={handleSave}
                icon={<Save color="#fff" size={20} />}
                bgColor="#10B981"
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
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
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
