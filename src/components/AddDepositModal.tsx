import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator
} from "react-native";
import { X, PiggyBank } from "lucide-react-native";
import { Validator } from "../utils/validator";

interface AddDepositModalProps {
  visible: boolean;
  goalName: string;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AddDepositModal({
  visible,
  goalName,
  onConfirm,
  onCancel,
  isLoading = false,
}: AddDepositModalProps) {
  const [amount, setAmount] = useState("");
  const [showAmountError, setShowAmountError] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const handleConfirm = () => {
    const validAmount = new Validator(Number(amount)).isValidAmount().result();
    setShowAmountError(!validAmount);

    if (validAmount) {
      onConfirm(Number(amount));
      setAmount(""); // Limpiar el campo después de confirmar
      setShowAmountError(false);
    }
  };

  const handleCancel = () => {
    setAmount("");
    setShowAmountError(false);
    setIsAmountFocused(false);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <PiggyBank size={24} color="#4caf50" />
            </View>
            <Text style={styles.modalTitle}>Agregar Depósito</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>
              Agregar depósito a la meta "{goalName}"
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Monto del depósito</Text>
              <TextInput
                style={[
                  styles.input,
                  isAmountFocused && styles.inputFocused,
                  showAmountError && styles.inputError,
                ]}
                placeholder="Ej: 100000"
                value={amount}
                onChangeText={setAmount}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
                keyboardType="numeric"
                autoFocus={true}
              />
              {showAmountError && (
                <Text style={styles.errorText}>
                  El monto debe ser un número válido mayor a 0
                </Text>
              )}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]} 
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Agregar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 20,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  inputFocused: {
    borderColor: "#4caf50",
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#dc2626",
    borderWidth: 2,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  confirmButton: {
    backgroundColor: "#4caf50",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
