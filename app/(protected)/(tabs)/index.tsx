import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../../src/context/AuthContext";
import { useRouter } from "expo-router";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import Navbar from "../../../src/components/Navbar";
import Header from "../../../src/components/Header";
import SummaryCards from "../../../src/components/SummaryCards";
import TopCategory from "../../../src/components/TopCategory";
import RecentTransactions from "../../../src/components/RecentTransactions";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HomePage = memo(function HomePage() {
  const { onLogout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Estado para el refresh
  const [refreshing, setRefreshing] = useState(false);
  
  const { userInfo, report, transactions, loading, debtsValueSummary, goalsSummary, refreshData } =
    useFinancialData({
      fetchUserInfo: true,
      fetchReport: true,
      fetchDebts: true,
      fetchGoals: true,
      fetchTransactions: true,
    });

  // Función de refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const signout = async () => {
    await onLogout?.();
    router.replace("/login");
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <Header title="Resumen" />
        <ActivityIndicator size="large" style={{ flex: 1 }} />
        <Navbar />
      </View>
    );
  }

  if (!report && !refreshing) {
    return (
      <View style={[styles.mainContainer, styles.errorContainer]}>
        <Header title="Resumen" />
        <View style={styles.errorContent}>
          <Text>No se pudo cargar el reporte</Text>
          <Button title="Reintentar" onPress={onRefresh} />
          <Button title="Cerrar sesión" onPress={signout} />
        </View>
        <Navbar />
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, {paddingBottom: insets.bottom}]}>
      <Header title="Resumen" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E90FF']} // Android - color del spinner
            tintColor={'#1E90FF'} // iOS - color del spinner
            title="Actualizando..." // iOS - texto durante la actualización
            titleColor={'#666'} // iOS - color del texto
          />
        }
      >
        <View style={styles.contentContainerStyle}>
          {/* <Text style={styles.title}>Bienvenido {userInfo?.name}</Text> */}
          <SummaryCards
            report={report!}
            debtsValueSummary={debtsValueSummary}
            goalsSummary={goalsSummary()}
          />
          <RecentTransactions transactions={transactions || []}/>
          <TopCategory report={report!} fontTitle="Inter_700Bold" fontContent="Inter_400Regular"  />
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
});

export default HomePage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  contentContainerStyle: {
    marginTop: 10,
    gap: 10,
    marginBottom: 20,
    paddingInline: 10,
    paddingBottom: 70,
  },
  title: {
    fontFamily: "Inter_500Medium",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
});
