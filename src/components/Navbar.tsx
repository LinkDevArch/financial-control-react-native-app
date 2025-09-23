import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from "expo-router";
import { BarChart3, CircleDollarSign, CreditCard, Home, Target } from "lucide-react-native";

export default function Navbar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('home');

  // Actualizar el estado activo basado en la ruta actual
  useEffect(() => {
    if (pathname === '/' || pathname === '/(protected)') {
      setActiveTab('home');
    } else if (pathname.includes('transactions')) {
      setActiveTab('transactions');
    } else if (pathname.includes('reports')) {
      setActiveTab('reports');
    } else if (pathname.includes('goals')) {
      setActiveTab('goals');
    } else if (pathname.includes('debts')) {
      setActiveTab('debts');
    }
    // Agregar más rutas cuando las tengas
  }, [pathname]);

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);

    switch (tabName) {
      case 'home':
        router.push('/(protected)/(tabs)');
        break;
      case 'transactions':
        router.push('/(protected)/(tabs)/transactions');
        break;
      case 'reports':
        router.push('/(protected)/(tabs)/reports');
        break;
      case 'goals':
        router.push('/(protected)/(tabs)/goals');
        break;
      case 'debts':
        router.push('/(protected)/(tabs)/debts');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[
      styles.navbar_container,
      { paddingBottom: Math.max(insets.bottom+5) }
    ]}>
      <View style={styles.border_line}></View>

      <View style={styles.nav_content}>
        <Pressable 
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
            activeTab === 'home' && styles.navItemActive
          ]}
          onPress={() => handleTabPress('home')}
          android_ripple={null}
        >
          <Home 
            size={24} 
            color={activeTab === 'home' ? '#1E90FF' : '#666666'} 
          />
        </Pressable>

        <Pressable 
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
            activeTab === 'transactions' && styles.navItemActive
          ]}
          onPress={() => handleTabPress('transactions')}
          android_ripple={null}
        >
          <CircleDollarSign 
            size={24} 
            color={activeTab === 'transactions' ? '#1E90FF' : '#666666'} 
          />
        </Pressable>

        <Pressable 
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
            activeTab === 'reports' && styles.navItemActive
          ]}
          onPress={() => handleTabPress('reports')}
          android_ripple={null}
        >
          <BarChart3 
            size={24} 
            color={activeTab === 'reports' ? '#1E90FF' : '#666666'} 
          />
        </Pressable>

        <Pressable 
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
            activeTab === 'goals' && styles.navItemActive
          ]}
          onPress={() => handleTabPress('goals')}
          android_ripple={null}
        >
          <Target 
            size={24} 
            color={activeTab === 'goals' ? '#1E90FF' : '#666666'} 
          />
        </Pressable>

        <Pressable 
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
            activeTab === 'debts' && styles.navItemActive
          ]}
          onPress={() => handleTabPress('debts')}
          android_ripple={null}
        >
          <CreditCard 
            size={24} 
            color={activeTab === 'debts' ? '#1E90FF' : '#666666'} 
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar_container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    zIndex: 999,
    shadowColor: "#000",
  },
  border_line: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: "#898989",
    borderRadius: 2,
  },
  nav_content: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10
    // paddingVertical: 15,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    flex: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navItemPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Fondo gris/negro semitransparente
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  navItemActive: {
    backgroundColor: "rgba(30, 144, 255, 0.1)", // Fondo azul claro para el activo
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});
