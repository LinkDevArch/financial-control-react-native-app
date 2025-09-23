import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { User, LogOut, X, Tags, Briefcase, CreditCard as CardIcon } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface SettingsOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  textColor?: string;
}

interface SettingsSidePanelProps {
  visible: boolean;
  onClose: () => void;
  onMyAccount: () => void;
  onLogout: () => void;
  onCategories: () => void;
  onIncomeSources: () => void;
  onAccounts: () => void;
  userName?: string;
  userEmail?: string;
}

function SettingsSidePanel({
  visible,
  onClose,
  onMyAccount,
  onLogout,
  onCategories,
  onIncomeSources,
  onAccounts,
  userName = "Usuario",
  userEmail = "usuario@email.com",
}: SettingsSidePanelProps) {
  // Animaciones
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(width)).current;

  // Efecto para manejar las animaciones cuando cambia la visibilidad
  useEffect(() => {
    if (visible) {
      // Abrir: overlay aparece suavemente y panel se desliza desde la derecha
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Cerrar: ambas animaciones de vuelta
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: width,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, slideAnimation]);

  const settingsOptions: SettingsOption[] = [
    {
      id: "my-account",
      title: "Mi cuenta",
      icon: <User size={20} color="#374151" />,
      onPress: onMyAccount,
    },
    {
      id: "categories",
      title: "Categorías",
      icon: <Tags size={20} color="#374151" />,
      onPress: onCategories,
    },
    {
      id: "income-sources",
      title: "Fuentes",
      icon: <Briefcase size={20} color="#374151" />,
      onPress: onIncomeSources,
    },
    {
      id: "accounts",
      title: "Cuentas",
      icon: <CardIcon size={20} color="#374151" />,
      onPress: onAccounts,
    },
    {
      id: "logout",
      title: "Cerrar sesión",
      icon: <LogOut size={20} color="#dc2626" />,
      onPress: onLogout,
      textColor: "#dc2626",
    },
  ];

  const handleOptionPress = (option: SettingsOption) => {
    option.onPress();
    onClose();
  };

  const renderOption = (option: SettingsOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionItem}
      onPress={() => handleOptionPress(option)}
      activeOpacity={0.7}
    >
      <View style={styles.optionIcon}>
        {option.icon}
      </View>
      <Text
        style={[
          styles.optionText,
          { color: option.textColor || "#374151" },
        ]}
      >
        {option.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: overlayOpacity }
        ]}
      >
        {/* Área transparente para cerrar al tocar */}
        <Pressable style={styles.overlayTouchable} onPress={onClose} />
        
        {/* Panel lateral */}
        <Animated.View 
          style={[
            styles.sidePanel,
            { transform: [{ translateX: slideAnimation }] }
          ]}
        >
          {/* Header del panel */}
          <View style={styles.panelHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Configuración</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Información del usuario */}
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <User size={32} color="#6b7280" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>

          {/* Separador */}
          <View style={styles.separator} />

          {/* Opciones de configuración */}
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Configuración</Text>
            {settingsOptions.map(renderOption)}
          </View>

          {/* Footer con versión */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Financial Control v1.0.0</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default SettingsSidePanel;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayTouchable: {
    flex: 1,
  },
  sidePanel: {
    width: width * 0.75, // 75% del ancho de la pantalla
    maxWidth: 300,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  panelHeader: {
    paddingTop: 60, // Espacio para el status bar
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 20,
  },
  optionsContainer: {
    padding: 20,
    flex: 1,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
