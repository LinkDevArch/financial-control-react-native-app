import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "expo-router";
import { useFonts, Inter_700Bold } from "@expo-google-fonts/inter";
import SettingsSidePanel from "./SettingsSidePanel";
import { useSettingsPanel } from "../hooks/useSettingsPanel";
import { useFinancialData } from "../hooks/useFinancialData";
import { User } from "lucide-react-native";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showLogout?: boolean;
  showConfig?: boolean;
  backgroundColor?: string;
  backRoute?: string;
  customSection?: React.ReactElement;
}

export default function Header({
  title = "Default Title",
  showBackButton = false,
  showLogout = true,
  showConfig = true,
  backgroundColor = "#ffffff",
  backRoute,
  customSection,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { onLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isVisible, openPanel, closePanel } = useSettingsPanel();
  const { userInfo, loading, refreshData } = useFinancialData({
    fetchUserInfo: true,
  });

  let [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Mientras cargan las fuentes
  }

  const handleBack = () => {
    // Detectar si estamos en un modal (páginas add-expense, add-income)
    const isModal =
      pathname.includes("/add-expense") || pathname.includes("/add-income");

    if (isModal) {
      // Para modales, usar dismiss para cerrar el modal
      router.dismiss();
    } else if (backRoute) {
      // Para navegación normal, usar la ruta específica
      router.push(backRoute);
    } else {
      // Fallback a navegación normal
      router.back();
    }
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await onLogout?.();
            router.replace("/login");
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
          }
        },
      },
    ]);
  };

  const handleMyAccount = () => {
    // TODO: Navegar a la página de mi cuenta
    Alert.alert("Mi cuenta", "Funcionalidad próximamente disponible", [
      { text: "OK" },
    ]);
  };

  const handleCategories = () => {
    router.push("/(protected)/(stacks)/categories");
  };

  const handleIncomeSources = () => {
    router.push("/(protected)/(stacks)/income-sources");
  };

  const handleAccounts = () => {
    router.push("/(protected)/(stacks)/accounts");
  };

  return (
    <>
      {/* Configuración de la barra de estado */}
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />

      <View
        style={[
          styles.header_container,
          {
            backgroundColor,
            paddingTop: insets.top, // Se adapta automáticamente al notch/status bar
            height: 60 + insets.top, // Altura base + espacio del notch
          },
        ]}
      >
        {/* Sección izquierda */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Sección derecha */}

        <View style={styles.rightSection}>{customSection}</View>

        {showConfig && (
          <View style={styles.rightSection}>
            <TouchableOpacity onPress={openPanel} activeOpacity={0.7}>
              <View style={styles.userAvatar}>
                <User size={32} color="#6b7280" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Panel lateral de configuración */}
      <SettingsSidePanel
        visible={isVisible}
        onClose={closePanel}
        onMyAccount={handleMyAccount}
        onLogout={handleLogout}
        onCategories={handleCategories}
        onIncomeSources={handleIncomeSources}
        onAccounts={handleAccounts}
        userName={userInfo?.name}
        userEmail={userInfo?.email}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header_container: {
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 100,
    backgroundColor: "#ffffff",
    // ✅ Solo borde inferior
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 999,
  },
  leftSection: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  accountButton: {
    backgroundColor: "#e0dedc",
    borderRadius: 20,
    padding: 3,
  },
  backButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 25,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
});
