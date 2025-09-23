import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import AppButton from "./AppButton";
import { DollarSign, FileText, AlertCircle } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { dateTimeFormatter, toLocalISOString } from "../utils";

interface AddDebtPaymentModalProps {
  visible: boolean;
  debtDescription: string;
  currentAmount: number;
  onConfirm: (amount: number, date: string ,notes: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function AddDebtPaymentModal({
  visible,
  debtDescription,
  currentAmount,
  onConfirm,
  onCancel,
  isLoading = false,
}: AddDebtPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; notes?: string }>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [creationDate, setCreationDate] = useState(new Date());

  const resetForm = () => {
    setAmount("");
    setCreationDate(new Date());
    setNotes("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { amount?: string; notes?: string } = {};

    // Validar monto
    if (!amount.trim()) {
      newErrors.amount = "El monto es requerido";
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "El monto debe ser un número mayor a 0";
      } else if (amountNum > currentAmount) {
        newErrors.amount = `El pago no puede ser mayor a la deuda actual ($${currentAmount.toLocaleString()})`;
      }
    }

    // Validar notas (opcional, pero si se proporciona, debe tener longitud válida)
    if (notes.trim() && notes.trim().length > 500) {
      newErrors.notes = "Las notas no pueden exceder 500 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    const amountNum = parseFloat(amount);

    // Confirmación adicional para pagos grandes
    if (amountNum >= currentAmount * 0.5) {
      Alert.alert(
        "Confirmar Pago Grande",
        `Estás a punto de registrar un pago de $${amountNum.toLocaleString()} para la deuda "${debtDescription}". ¿Estás seguro?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Confirmar",
            style: "default",
            onPress: () => {
              onConfirm(amountNum, toLocalISOString(creationDate) ,notes.trim());
              resetForm();
            },
          },
        ]
      );
    } else {
      onConfirm(amountNum, toLocalISOString(creationDate) ,notes.trim());
      resetForm();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const formatAmountPreview = () => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      const remaining = Math.max(0, currentAmount - amountNum);
      return {
        payment: amountNum,
        remaining,
        willPayOff: remaining === 0,
      };
    }
    return null;
  };

  const amountPreview = formatAmountPreview();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.iconContainer}>
                  <DollarSign size={24} color="#4caf50" />
                </View>
                <Text style={styles.modalTitle}>Registrar Pago</Text>
                <Text style={styles.debtDescription} numberOfLines={2}>
                  {debtDescription}
                </Text>
              </View>

              {/* Información de la deuda */}
              <View style={styles.debtInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Deuda actual:</Text>
                  <Text style={styles.currentDebtAmount}>
                    ${currentAmount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Formulario */}
              <View style={styles.form}>
                {/* Campo de monto */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>
                    Monto del pago <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      errors.amount && styles.inputError,
                    ]}
                  >
                    <DollarSign
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      keyboardType="numeric"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.amount && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={16} color="#dc2626" />
                      <Text style={styles.errorText}>{errors.amount}</Text>
                    </View>
                  )}
                </View>

                {/* Previsualización del pago */}
                {amountPreview && (
                  <View style={styles.previewContainer}>
                    <Text style={styles.previewTitle}>Resumen del pago:</Text>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Pago:</Text>
                      <Text style={styles.previewPayment}>
                        ${amountPreview.payment.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Deuda restante:</Text>
                      <Text
                        style={[
                          styles.previewRemaining,
                          amountPreview.willPayOff && styles.previewPaidOff,
                        ]}
                      >
                        ${amountPreview.remaining.toLocaleString()}
                      </Text>
                    </View>
                    {amountPreview.willPayOff && (
                      <View style={styles.payoffNotice}>
                        <Text style={styles.payoffText}>
                          ¡Este pago liquidará completamente la deuda!
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Campo de fecha */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Fecha del pago</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <View style={[styles.inputContainer, {paddingHorizontal: 10}]}>
                      <TextInput
                        style={[styles.input]}
                        value={`${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}`}
                        editable={false}
                        pointerEvents="none"
                        placeholder="Selecciona la fecha y hora"
                      />
                    </View>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={creationDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) {
                          // Actualiza solo la fecha, mantiene la hora
                          const newDate = new Date(date);
                          newDate.setHours(creationDate.getHours());
                          newDate.setMinutes(creationDate.getMinutes());
                          setCreationDate(newDate);
                          setShowTimePicker(true);
                        }
                      }}
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      value={creationDate}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, time) => {
                        setShowTimePicker(false);
                        if (time) {
                          // Actualiza solo la hora, mantiene la fecha
                          const newDate = new Date(creationDate);
                          newDate.setHours(time.getHours());
                          newDate.setMinutes(time.getMinutes());
                          setCreationDate(newDate);
                        }
                      }}
                    />
                  )}
                </View>

                {/* Campo de notas */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Notas (opcional)</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      errors.notes && styles.inputError,
                    ]}
                  >
                    <FileText size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Agregar notas sobre este pago..."
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      editable={!isLoading}
                    />
                  </View>
                  {errors.notes && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={16} color="#dc2626" />
                      <Text style={styles.errorText}>{errors.notes}</Text>
                    </View>
                  )}
                  <Text style={styles.helperText}>
                    {notes.length}/500 caracteres
                  </Text>
                </View>
              </View>

              {/* Botones */}
              <View style={styles.buttonContainer}>
                <AppButton
                  title="Cancelar"
                  onPress={isLoading ? () => {} : handleCancel}
                  bgColor={isLoading ? "#ccc" : "#666"}
                  pressedColor={isLoading ? "#ccc" : "#555"}
                />
                <AppButton
                  title={isLoading ? "Registrando..." : "Registrar Pago"}
                  onPress={
                    isLoading || !amount.trim() ? () => {} : handleConfirm
                  }
                  bgColor={isLoading || !amount.trim() ? "#ccc" : "#4caf50"}
                  pressedColor={
                    isLoading || !amount.trim() ? "#ccc" : "#388e3c"
                  }
                  icon={<DollarSign size={20} color="#ffffff" />}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default AddDebtPaymentModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f8f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  debtDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  debtInfo: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  currentDebtAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
  },
  form: {
    padding: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  required: {
    color: "#dc2626",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1a1a1a",
    paddingRight: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
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
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  previewContainer: {
    backgroundColor: "#f0f8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: "#666",
  },
  previewPayment: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4caf50",
  },
  previewRemaining: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  previewPaidOff: {
    color: "#4caf50",
  },
  payoffNotice: {
    backgroundColor: "#e8f5e8",
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  payoffText: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "500",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
  },
});
