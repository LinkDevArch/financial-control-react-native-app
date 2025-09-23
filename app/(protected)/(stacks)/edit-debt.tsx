import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import Header from "../../../src/components/Header";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppButton from "../../../src/components/AppButton";
import { useDebtActions } from "../../../src/hooks/useDebtActions";
import type { DebtUpdateDTO } from "../../../src/interfaces/types";
import { AlertTriangle, Calendar, CreditCard, Save } from "lucide-react-native";

function EditDebt() {
  const {
    debtId,
    description: initialDescription,
    initialAmount: initialAmountParam,
    interestRate: initialInterestRateParam,
    creditorName: initialCreditorName,
    type: initialType,
    dueDate: initialDueDate,
  } = useLocalSearchParams();

  const [description, setDescription] = useState(initialDescription as string || "");
  const [initialAmount, setInitialAmount] = useState(initialAmountParam as string || "");
  const [interestRate, setInterestRate] = useState(initialInterestRateParam as string || "0");
  const [creditorName, setCreditorName] = useState(initialCreditorName as string || "");
  const [selectedType, setSelectedType] = useState(initialType as string || "CREDIT_CARD");
  const [dueDate, setDueDate] = useState(
    initialDueDate ? new Date(initialDueDate as string) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    description?: string;
    initialAmount?: string;
    interestRate?: string;
    creditorName?: string;
    dueDate?: string;
  }>({});

  const { updateDebt } = useDebtActions();

  const debtTypes = [
    { value: "CREDIT_CARD", label: "Tarjeta de crédito" },
    { value: "LOAN", label: "Préstamo" },
    { value: "PERSONAL_DEBT", label: "Deuda personal" },
    { value: "MORTGAGE", label: "Hipoteca" },
    { value: "OTHER", label: "Otro" },
  ];

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validar descripción
    if (!description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (description.trim().length < 3) {
      newErrors.description = "La descripción debe tener al menos 3 caracteres";
    }

    // Validar monto inicial
    if (!initialAmount.trim()) {
      newErrors.initialAmount = "El monto inicial es requerido";
    } else {
      const amount = parseFloat(initialAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.initialAmount = "El monto inicial debe ser un número mayor a 0";
      }
    }

    // Validar tasa de interés
    if (interestRate.trim()) {
      const rate = parseFloat(interestRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.interestRate = "La tasa de interés debe ser un número entre 0 y 100";
      }
    }

    // Validar nombre del acreedor
    if (!creditorName.trim()) {
      newErrors.creditorName = "El nombre del acreedor es requerido";
    } else if (creditorName.trim().length < 2) {
      newErrors.creditorName = "El nombre del acreedor debe tener al menos 2 caracteres";
    }

    // Validar fecha de vencimiento
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      newErrors.dueDate = "La fecha de vencimiento no puede ser anterior a hoy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const debtData: DebtUpdateDTO = {
        description: description.trim(),
        initialAmount: parseFloat(initialAmount),
        interestRate: parseFloat(interestRate) || 0,
        creditorName: creditorName.trim(),
        type: selectedType as any,
        dueDate: dueDate.toISOString(),
      };

      const result = await updateDebt(parseInt(debtId as string), debtData);

      if (result.success) {
        Alert.alert(
          "Deuda actualizada",
          "Los cambios han sido guardados exitosamente",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          Array.isArray(result.error) ? result.error.join("\n") : result.error || "No se pudo actualizar la deuda",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error inesperado al actualizar la deuda", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === "ios");
    setDueDate(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} title="Editar Deuda" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Descripción */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Descripción <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.description && styles.inputError]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ej: Tarjeta de crédito Banco XYZ"
              editable={!isLoading}
            />
            {errors.description && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{errors.description}</Text>
              </View>
            )}
          </View>

          {/* Monto inicial */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Monto inicial <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.initialAmount && styles.inputError]}
              value={initialAmount}
              onChangeText={setInitialAmount}
              placeholder="0"
              keyboardType="numeric"
              editable={!isLoading}
            />
            {errors.initialAmount && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{errors.initialAmount}</Text>
              </View>
            )}
          </View>

          {/* Tasa de interés */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tasa de interés (%)</Text>
            <TextInput
              style={[styles.input, errors.interestRate && styles.inputError]}
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="0"
              keyboardType="numeric"
              editable={!isLoading}
            />
            {errors.interestRate && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{errors.interestRate}</Text>
              </View>
            )}
          </View>

          {/* Nombre del acreedor */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Acreedor <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.creditorName && styles.inputError]}
              value={creditorName}
              onChangeText={setCreditorName}
              placeholder="Ej: Banco XYZ, Juan Pérez"
              editable={!isLoading}
            />
            {errors.creditorName && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{errors.creditorName}</Text>
              </View>
            )}
          </View>

          {/* Tipo de deuda */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Tipo de deuda <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.typeContainer}>
              {debtTypes.map((type) => (
                <Pressable
                  key={type.value}
                  style={[
                    styles.typeOption,
                    selectedType === type.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => setSelectedType(type.value)}
                  disabled={isLoading}
                >
                  <CreditCard
                    size={20}
                    color={selectedType === type.value ? "#2b4afcff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      selectedType === type.value && styles.typeOptionTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Fecha de vencimiento */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Fecha de vencimiento <Text style={styles.required}>*</Text>
            </Text>
            <Pressable
              style={[styles.dateInput, errors.dueDate && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Calendar size={20} color="#666" />
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            </Pressable>
            {errors.dueDate && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{errors.dueDate}</Text>
              </View>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <View style={styles.buttonContainer}>
            <AppButton
              title={isLoading ? "Guardando..." : "Guardar Cambios"}
              onPress={isLoading ? () => {} : handleSave}
              bgColor={isLoading ? "#ccc" : "#4caf50"}
              pressedColor={isLoading ? "#ccc" : "#388e3c"}
              icon={<Save size={20} color="#ffffff" />}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default EditDebt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  required: {
    color: "#dc2626",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginLeft: 4,
  },
  typeContainer: {
    gap: 8,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  typeOptionSelected: {
    borderColor: "#2b4afcff",
    backgroundColor: "#f0f4ff",
  },
  typeOptionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  typeOptionTextSelected: {
    color: "#2b4afcff",
    fontWeight: "500",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  dateText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
