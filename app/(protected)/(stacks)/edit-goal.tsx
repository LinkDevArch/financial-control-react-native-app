import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Header from "../../../src/components/Header";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import AppButton from "../../../src/components/AppButton";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { GoalUpdateDTO } from "../../../src/interfaces/types";
import { toLocalISOString } from "../../../src/utils";
import ActionMessage from "../../../src/components/ActionMessage";
import { AlertProvider, useAlert } from "../../../src/context/AlertContext";

import { useGoalActions } from "../../../src/hooks/useGoalActions";
import { Validator } from "../../../src/utils/validator";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "lucide-react-native";

function EditGoalPageInner() {
  const params = useLocalSearchParams();
  const { alert, showAlert, hideAlert } = useAlert();
  const { updateGoal, loading } = useGoalActions();
  
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isTargetAmountFocused, setIsTargetAmountFocused] = useState(false);
  const [isCurrentAmountFocused, setIsCurrentAmountFocused] = useState(false);
  const [isStartDateFocused, setIsStartDateFocused] = useState(false);
  const [isTargetDateFocused, setIsTargetDateFocused] = useState(false);
  const [isStatusFocused, setIsStatusFocused] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date());
  const [status, setStatus] = useState("");

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);

  const [showNameError, setShowNameError] = useState(false);
  const [showDescriptionError, setShowDescriptionError] = useState(false);
  const [showTargetAmountError, setShowTargetAmountError] = useState(false);
  const [showCurrentAmountError, setShowCurrentAmountError] = useState(false);
  const [showStartDateError, setShowStartDateError] = useState(false);
  const [showTargetDateError, setShowTargetDateError] = useState(false);
  const [showStatusError, setShowStatusError] = useState(false);

  // Opciones de estado
  const statusOptions = [
    { label: "En progreso", value: "IN_PROGRESS" },
    { label: "Completada", value: "COMPLETED" }
  ];

  // Cargar datos de la meta desde los parámetros solo una vez
  useEffect(() => {
    // Limpiar alertas al cargar la página
    hideAlert();
    
    if (params.name) setName(params.name as string);
    if (params.description) setDescription(params.description as string);
    if (params.targetAmount) setTargetAmount(params.targetAmount as string);
    if (params.currentAmount) setCurrentAmount(params.currentAmount as string);
    if (params.status) setStatus(params.status as string);
    
    if (params.startDate) {
      try {
        setStartDate(new Date(params.startDate as string));
      } catch (error) {
        console.error('Error parsing start date:', error);
      }
    }
    
    if (params.targetDate) {
      try {
        setTargetDate(new Date(params.targetDate as string));
      } catch (error) {
        console.error('Error parsing target date:', error);
      }
    }
  }, []); // Dependency array vacío para ejecutar solo una vez

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleTargetDateChange = (event: any, selectedDate?: Date) => {
    setShowTargetDatePicker(false);
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  function validate() {
    const validName = new Validator(name).notBlank().result();
    setShowNameError(!validName);
    
    const validDescription = new Validator(description).notBlank().result();
    setShowDescriptionError(!validDescription);
    
    const validTargetAmount = new Validator(Number(targetAmount)).isValidAmount().result();
    setShowTargetAmountError(!validTargetAmount);
    
    const validCurrentAmount = new Validator(Number(currentAmount)).isValidAmount().result() || Number(currentAmount) === 0;
    setShowCurrentAmountError(!validCurrentAmount);
    
    const validStatus = new Validator(status).notBlank().result();
    setShowStatusError(!validStatus);

    // Validar que la fecha objetivo sea posterior a la fecha de inicio
    const validDates = targetDate >= startDate;
    if (!validDates) {
      showAlert("La fecha objetivo debe ser posterior a la fecha de inicio.", "error");
      return false;
    }

    return (
      validName && 
      validDescription && 
      validTargetAmount && 
      validCurrentAmount && 
      validStatus &&
      validDates
    );
  }

  const handleSubmit = async () => {
    if (!params.goalId) {
      showAlert("Error: ID de meta no encontrado", "error");
      return;
    }

    if (!validate()) {
      showAlert("Campos inválidos, corrígelos e intenta de nuevo.", "error");
      return;
    }

    const goal: GoalUpdateDTO = {
      name,
      description,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      startDate: toLocalISOString(startDate).split('T')[0], // Solo la fecha, sin hora
      targetDate: toLocalISOString(targetDate).split('T')[0], // Solo la fecha, sin hora
      status,
    };

    const result = await updateGoal(Number(params.goalId), goal);

    if (result.success) {
      showAlert("Meta actualizada exitosamente", "success");
      // Esperar un momento para que se muestre la alerta antes de navegar
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      const errorMessage = Array.isArray(result.error) ? result.error.join(", ") : result.error || "Error al actualizar la meta";
      showAlert(errorMessage, "error");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusLabel = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.label : statusValue;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Editar Meta" showBackButton={true} />
      {alert.visible && (
        <View
          style={{
            top: 70,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <ActionMessage
            message={alert.message}
            type={alert.type === "info" ? "success" : alert.type as "error" | "success"}
            onClose={hideAlert}
          />
        </View>
      )}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Campo Nombre */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre de la meta</Text>
          <TextInput
            style={[
              styles.input,
              isNameFocused && styles.inputFocused,
              showNameError && styles.inputError,
            ]}
            placeholder="Ej: Vacaciones, Casa nueva..."
            value={name}
            onChangeText={setName}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
          />
          {showNameError && (
            <Text style={styles.errorText}>El nombre es obligatorio</Text>
          )}
        </View>

        {/* Campo Descripción */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              isDescriptionFocused && styles.inputFocused,
              showDescriptionError && styles.inputError,
            ]}
            placeholder="Describe tu meta..."
            value={description}
            onChangeText={setDescription}
            onFocus={() => setIsDescriptionFocused(true)}
            onBlur={() => setIsDescriptionFocused(false)}
            multiline
            numberOfLines={3}
          />
          {showDescriptionError && (
            <Text style={styles.errorText}>La descripción es obligatoria</Text>
          )}
        </View>

        {/* Campo Monto Objetivo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Monto objetivo</Text>
          <TextInput
            style={[
              styles.input,
              isTargetAmountFocused && styles.inputFocused,
              showTargetAmountError && styles.inputError,
            ]}
            placeholder="Ej: 1000000"
            value={targetAmount}
            onChangeText={setTargetAmount}
            onFocus={() => setIsTargetAmountFocused(true)}
            onBlur={() => setIsTargetAmountFocused(false)}
            keyboardType="numeric"
          />
          {showTargetAmountError && (
            <Text style={styles.errorText}>El monto objetivo debe ser válido</Text>
          )}
        </View>

        {/* Campo Monto Actual */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Monto actual</Text>
          <TextInput
            style={[
              styles.input,
              isCurrentAmountFocused && styles.inputFocused,
              showCurrentAmountError && styles.inputError,
            ]}
            placeholder="Ej: 500000"
            value={currentAmount}
            onChangeText={setCurrentAmount}
            onFocus={() => setIsCurrentAmountFocused(true)}
            onBlur={() => setIsCurrentAmountFocused(false)}
            keyboardType="numeric"
          />
          {showCurrentAmountError && (
            <Text style={styles.errorText}>El monto actual debe ser válido</Text>
          )}
        </View>

        {/* Campo Fecha de Inicio */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha de inicio</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              isStartDateFocused && styles.inputFocused,
              showStartDateError && styles.inputError,
            ]}
            onPress={() => setShowStartDatePicker(true)}
            onFocus={() => setIsStartDateFocused(true)}
            onBlur={() => setIsStartDateFocused(false)}
          >
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Calendar size={20} color="#666" />
          </TouchableOpacity>
          {showStartDateError && (
            <Text style={styles.errorText}>La fecha de inicio es obligatoria</Text>
          )}
        </View>

        {/* Campo Fecha Objetivo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha objetivo</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              isTargetDateFocused && styles.inputFocused,
              showTargetDateError && styles.inputError,
            ]}
            onPress={() => setShowTargetDatePicker(true)}
            onFocus={() => setIsTargetDateFocused(true)}
            onBlur={() => setIsTargetDateFocused(false)}
          >
            <Text style={styles.dateText}>{formatDate(targetDate)}</Text>
            <Calendar size={20} color="#666" />
          </TouchableOpacity>
          {showTargetDateError && (
            <Text style={styles.errorText}>La fecha objetivo es obligatoria</Text>
          )}
        </View>

        {/* Campo Estado */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Estado</Text>
          <View
            style={[
              styles.input,
              styles.pickerContainer,
              isStatusFocused && styles.inputFocused,
              showStatusError && styles.inputError,
            ]}
          >
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              onFocus={() => setIsStatusFocused(true)}
              onBlur={() => setIsStatusFocused(false)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un estado" value="" />
              {statusOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
          {showStatusError && (
            <Text style={styles.errorText}>El estado es obligatorio</Text>
          )}
        </View>

        {/* Botón de envío */}
        <View style={styles.buttonContainer}>
          <AppButton
            title={loading ? "Actualizando..." : "Actualizar Meta"}
            onPress={handleSubmit}
            icon={loading ? <ActivityIndicator color="#fff" size="small" /> : undefined}
          />
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showTargetDatePicker && (
        <DateTimePicker
          value={targetDate}
          mode="date"
          display="default"
          onChange={handleTargetDateChange}
        />
      )}
    </KeyboardAvoidingView>
  );
}

export default function EditGoalPage() {
  return (
    <AlertProvider>
      <EditGoalPageInner />
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  inputFocused: {
    borderColor: "#2b4afcff",
    borderWidth: 2,
  },
  inputError: {
    borderColor: "#dc2626",
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 56,
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    color: "#333",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
