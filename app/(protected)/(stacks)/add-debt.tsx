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
import { useState } from "react";
import { router } from "expo-router";
import AppButton from "../../../src/components/AppButton";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { DebtCreateDTO } from "../../../src/interfaces/types";
import { toLocalISOString } from "../../../src/utils";
import ActionMessage from "../../../src/components/ActionMessage";
import { AlertProvider, useAlert } from "../../../src/context/AlertContext";

import { useDebtActions } from "../../../src/hooks/useDebtActions";
import { Validator } from "../../../src/utils/validator";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "lucide-react-native";

function AddDebtPageInner() {
  const { alert, showAlert, hideAlert } = useAlert();
  const { addDebt, loading } = useDebtActions();

  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isInitialAmountFocused, setIsInitialAmountFocused] = useState(false);
  const [isInterestRateFocused, setIsInterestRateFocused] = useState(false);
  const [isCreditorNameFocused, setIsCreditorNameFocused] = useState(false);
  const [isTypeFocused, setIsTypeFocused] = useState(false);
  const [isStartDateFocused, setIsStartDateFocused] = useState(false);
  const [isDueDateFocused, setIsDueDateFocused] = useState(false);

  const [description, setDescription] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [creditorName, setCreditorName] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const [showDescriptionError, setShowDescriptionError] = useState(false);
  const [showInitialAmountError, setShowInitialAmountError] = useState(false);
  const [showInterestRateError, setShowInterestRateError] = useState(false);
  const [showCreditorNameError, setShowCreditorNameError] = useState(false);
  const [showTypeError, setShowTypeError] = useState(false);
  const [showStartDateError, setShowStartDateError] = useState(false);
  const [showDueDateError, setShowDueDateError] = useState(false);

  // Opciones de tipo de deuda
  const debtTypeOptions = [
    { label: "Tarjeta de crédito", value: "CREDIT_CARD" },
    { label: "Préstamo", value: "LOAN" },
    { label: "Deuda personal", value: "PERSONAL_DEBT" },
    { label: "Hipoteca", value: "MORTGAGE" },
    { label: "Otro", value: "OTHER" },
  ];

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  function validate() {
    const validDescription = new Validator(description).notBlank().result();
    setShowDescriptionError(!validDescription);

    const validInitialAmount = new Validator(Number(initialAmount))
      .isValidAmount()
      .result();
    setShowInitialAmountError(!validInitialAmount);

    const validInterestRate = Number(interestRate) >= 0;
    setShowInterestRateError(!validInterestRate);

    const validCreditorName = new Validator(creditorName).notBlank().result();
    setShowCreditorNameError(!validCreditorName);

    const validType = new Validator(type).notBlank().result();
    setShowTypeError(!validType);

    // Validar que la fecha de vencimiento sea posterior a la fecha de inicio
    const validDates = dueDate > startDate;
    if (!validDates) {
      showAlert(
        "La fecha de vencimiento debe ser posterior a la fecha de inicio.",
        "error"
      );
      return false;
    }

    return (
      validDescription &&
      validInitialAmount &&
      validInterestRate &&
      validCreditorName &&
      validType &&
      validDates
    );
  }

  const handleSubmit = async () => {
    if (!validate()) {
      showAlert("Campos inválidos, corrígelos e intenta de nuevo.", "error");
      return;
    }

    const debt: DebtCreateDTO = {
      description,
      initialAmount: Number(initialAmount),
      interestRate: Number(interestRate || 0),
      creditorName,
      type,
      startDate: toLocalISOString(startDate).split("T")[0], // Solo la fecha, sin hora
      dueDate: toLocalISOString(dueDate).split("T")[0], // Solo la fecha, sin hora
    };

    const result = await addDebt(debt);

    if (result.success) {
      showAlert("Deuda creada exitosamente", "success");
      // Esperar un momento para que se muestre la alerta antes de navegar
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      const errorMessage = Array.isArray(result.error)
        ? result.error.join(", ")
        : result.error || "Error al crear la deuda";
      showAlert(errorMessage, "error");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Agregar Deuda" showBackButton={true} showConfig={false} />
      <View style={{flex: 1}}>
        {/* Mensaje de acción */}
        {alert.visible && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <ActionMessage
              message={alert.message}
              type={
                alert.type === "info"
                  ? "success"
                  : (alert.type as "error" | "success")
              }
              onClose={hideAlert}
            />
          </View>
        )}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Campo Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción de la deuda</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                isDescriptionFocused && styles.inputFocused,
                showDescriptionError && styles.inputError,
              ]}
              placeholder="Ej: Préstamo para el auto, Tarjeta de crédito..."
              value={description}
              onChangeText={setDescription}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
              multiline
              numberOfLines={3}
            />
            {showDescriptionError && (
              <Text style={styles.errorText}>
                La descripción es obligatoria
              </Text>
            )}
          </View>

          {/* Campo Monto Inicial */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monto inicial</Text>
            <TextInput
              style={[
                styles.input,
                isInitialAmountFocused && styles.inputFocused,
                showInitialAmountError && styles.inputError,
              ]}
              placeholder="Ej: 500000"
              value={initialAmount}
              onChangeText={setInitialAmount}
              onFocus={() => setIsInitialAmountFocused(true)}
              onBlur={() => setIsInitialAmountFocused(false)}
              keyboardType="numeric"
            />
            {showInitialAmountError && (
              <Text style={styles.errorText}>
                El monto inicial debe ser válido
              </Text>
            )}
          </View>

          {/* Campo Tasa de Interés */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tasa de interés (%)</Text>
            <TextInput
              style={[
                styles.input,
                isInterestRateFocused && styles.inputFocused,
                showInterestRateError && styles.inputError,
              ]}
              placeholder="Ej: 2.5 (opcional)"
              value={interestRate}
              onChangeText={setInterestRate}
              onFocus={() => setIsInterestRateFocused(true)}
              onBlur={() => setIsInterestRateFocused(false)}
              keyboardType="numeric"
            />
            {showInterestRateError && (
              <Text style={styles.errorText}>
                La tasa de interés debe ser válida
              </Text>
            )}
          </View>

          {/* Campo Nombre del Acreedor */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del acreedor</Text>
            <TextInput
              style={[
                styles.input,
                isCreditorNameFocused && styles.inputFocused,
                showCreditorNameError && styles.inputError,
              ]}
              placeholder="Ej: Banco Nacional, Juan Pérez..."
              value={creditorName}
              onChangeText={setCreditorName}
              onFocus={() => setIsCreditorNameFocused(true)}
              onBlur={() => setIsCreditorNameFocused(false)}
            />
            {showCreditorNameError && (
              <Text style={styles.errorText}>
                El nombre del acreedor es obligatorio
              </Text>
            )}
          </View>

          {/* Campo Tipo de Deuda */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de deuda</Text>
            <View
              style={[
                styles.input,
                styles.pickerContainer,
                isTypeFocused && styles.inputFocused,
                showTypeError && styles.inputError,
              ]}
            >
              <Picker
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
                onFocus={() => setIsTypeFocused(true)}
                onBlur={() => setIsTypeFocused(false)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona un tipo" value="" />
                {debtTypeOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
            {showTypeError && (
              <Text style={styles.errorText}>
                El tipo de deuda es obligatorio
              </Text>
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
              <Text style={styles.errorText}>
                La fecha de inicio es obligatoria
              </Text>
            )}
          </View>

          {/* Campo Fecha de Vencimiento */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de vencimiento</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dateInput,
                isDueDateFocused && styles.inputFocused,
                showDueDateError && styles.inputError,
              ]}
              onPress={() => setShowDueDatePicker(true)}
              onFocus={() => setIsDueDateFocused(true)}
              onBlur={() => setIsDueDateFocused(false)}
            >
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
              <Calendar size={20} color="#666" />
            </TouchableOpacity>
            {showDueDateError && (
              <Text style={styles.errorText}>
                La fecha de vencimiento es obligatoria
              </Text>
            )}
          </View>

          {/* Botón de envío */}
          <View style={styles.buttonContainer}>
            <AppButton
              title={loading ? "Creando..." : "Crear Deuda"}
              onPress={handleSubmit}
              icon={
                loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : undefined
              }
            />
          </View>
        </ScrollView>
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showDueDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={handleDueDateChange}
        />
      )}
    </KeyboardAvoidingView>
  );
}

export default function AddDebtPage() {
  return (
    <AlertProvider>
      <AddDebtPageInner />
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
