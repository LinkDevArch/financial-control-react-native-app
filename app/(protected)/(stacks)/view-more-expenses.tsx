import { View, StyleSheet } from "react-native";
import ExpensesTransactions from "../../../src/components/ExpensesTransactions";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import { AlertProvider } from "../../../src/context/AlertContext";
import Header from "../../../src/components/Header";
import { useEffect, useMemo, useCallback } from "react";
import { useState } from "react";
import { useFocusEffect } from "expo-router";
import type { ExpenseDTO } from "../../../src/interfaces/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ViewMoreExpenses() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [expensesList, setExpensesList] = useState<ExpenseDTO[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const options = useMemo(() => ({
    fetchExpenses: true,
    expensesFilterType: "ALL" as const,
    expensesYear: 0,
    expensesMonth: 0,
    expensesPage: page,
    expensesSize: 20,
    expensesSortBy: "creationDate" as const,
    expensesDirection: "desc" as const,
    disableCache: true,
  }), [page]);

  const { expenses, loading, refreshData } = useFinancialData(options);

  // Actualizar datos cuando el usuario regrese a esta pantalla
  useFocusEffect(
    useCallback(() => {
      // Detectar si venimos de una página de edición u otra navegación
      // Usar un timeout para evitar interferir con el scroll normal
      const timeoutId = setTimeout(() => {
        if (refreshData) {
          refreshData();
        }
      }, 100); // Pequeño delay para evitar conflictos con scroll

      return () => clearTimeout(timeoutId);
    }, [refreshData])
  );

  const handleLoadMore = async () => {
    // Protección adicional contra múltiples llamadas simultáneas
    if (loading || isLoadingMore) {
      return;
    }
    
    if (
      !isLoadingMore &&
      expenses?.page &&
      typeof expenses.page.number === "number" &&
      typeof expenses.page.totalPages === "number" &&
      expenses.page.number + 1 < expenses.page.totalPages
    ) {
      console.log('Condiciones cumplidas, cargando página:', page + 1);
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    } else {
      console.log('Condiciones no cumplidas para cargar más');
      console.log('Página actual:', expenses?.page?.number);
      console.log('Total páginas:', expenses?.page?.totalPages);
    }
  };

  useEffect(() => {
    if (expenses?.content) {
      if (page === 0) {
        setExpensesList(expenses.content);
      } else {
        setExpensesList((prev) => {
          const ids = new Set(prev.map((e) => e.id));
          const nuevos = expenses.content.filter((e) => !ids.has(e.id));
          return [...prev, ...nuevos];
        });
      }
      setIsLoadingMore(false);
    }
  }, [expenses, page]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Header title="Todos los gastos" showBackButton={true} showConfig={false} />
      <ExpensesTransactions
        expenses={
          expenses
            ? {
                content: expensesList,
                page: expenses.page ?? {
                  size: 20,
                  number: 0,
                  totalElements: 0,
                  totalPages: 0,
                },
              }
            : undefined
        }
        showTitle={false}
        notRadius={true}
        onEndReached={handleLoadMore}
        loadingMore={isLoadingMore}
        enableScroll={true}
        enableActions={true}
        onRefresh={refreshData}
      />
    </View>
  );
}

export default function ViewMoreExpensesPage() {
  return (
    <AlertProvider>
      <ViewMoreExpenses />
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
