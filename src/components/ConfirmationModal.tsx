import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  warning,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonColor = "#dc2626",
  icon,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{message}</Text>
            {warning && (
              <Text style={styles.modalWarning}>{warning}</Text>
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                { backgroundColor: confirmButtonColor },
                isLoading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
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
    color: "#1a1a1a",
    marginBottom: 12,
    lineHeight: 22,
  },
  modalWarning: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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
    backgroundColor: "#dc2626",
  },
  disabledButton: {
    opacity: 0.6,
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
