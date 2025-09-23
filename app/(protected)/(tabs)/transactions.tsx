import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
} from "react-native";
import Header from "../../../src/components/Header";
import Navbar from "../../../src/components/Navbar";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import AppButton from "../../../src/components/AppButton";
import { PlusCircle } from "lucide-react-native";
import ExpensesTransactions from "../../../src/components/ExpensesTransactions";
import IncomesTransactions from "../../../src/components/IncomesTransactions";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TransactionsPage = React.memo(() => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear(); // 2025
  const currentMonth = currentDate.getMonth() + 1; // +1 porque getMonth() retorna 0-11

  const { expenses, incomes, loading, refreshData } = useFinancialData({
    fetchExpenses: true,
    expensesFilterType: "LAST30",
    expensesYear: currentYear,
    expensesMonth: currentMonth,
    expensesPage: 0,
    expensesSize: 5,
    expensesSortBy: "creationDate",
    expensesDirection: "desc",

    fetchIncomes: true,
    incomesFilterType: "LAST30",
    incomesYear: currentYear,
    incomesMonth: currentMonth,
    incomesPage: 0,
    incomesSize: 5,
    incomesSortBy: "creationDate",
    incomesDirection: "desc",
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData(); // Ahora usa la función real de refresh
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  return (
    <View style={[styles.layoutContainer, { paddingBottom: insets.bottom }]}>
      <Header title="Transacciones" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E90FF"]} // Android - color del spinner
            tintColor={"#1E90FF"} // iOS - color del spinner
            title="Actualizando..." // iOS - texto durante la actualización
            titleColor={"#666"} // iOS - color del texto
          />
        }
      >
        <View style={styles.contentContainerStyle}>
          <View style={styles.buttonsContainer}>
            <AppButton
              title="Agregar Gasto"
              icon={<PlusCircle color={"#ffffff"} />}
              bgColor="#1d1d1dff"
              pressedColor="#000000ff"
              onPress={() => router.push("/(protected)/(stacks)/add-expense")}
            />
            <AppButton
              title="Agregar Ingreso"
              icon={<PlusCircle color={"#ffffff"} />}
              bgColor="#1d1d1dff"
              pressedColor="#000000ff"
              onPress={() => router.push("/(protected)/(stacks)/add-income")}
            />
          </View>
          <ExpensesTransactions expenses={expenses!} onButton={() => router.push("/(protected)/(stacks)/view-more-expenses")} showViewMoreBtn={true}/>
          <IncomesTransactions incomes={incomes!} onButton={() => router.push("/(protected)/(stacks)/view-more-incomes")} showViewMoreBtn={true}/>
        </View>
      </ScrollView>

      <Navbar />
    </View>
  );
});

export default TransactionsPage;

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  contentContainerStyle: {
    gap: 10,
    marginBottom: 20,
    paddingInline: 10,
    paddingBottom: 70,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
    marginTop: 15,
  },
  title: {
    fontFamily: "Inter_500Medium",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});