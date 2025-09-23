import { View, StyleSheet } from "react-native";
import IncomesTransactions from "../../../src/components/IncomesTransactions";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import { AlertProvider } from "../../../src/context/AlertContext";
import Header from "../../../src/components/Header";
import { useEffect, useMemo, useCallback } from "react";
import { useState } from "react";
import { useFocusEffect } from "expo-router";
import type { IncomeDTO } from "../../../src/interfaces/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ViewMoreIncomes() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [incomesList, setIncomesList] = useState<IncomeDTO[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const options = useMemo(() => ({
    fetchIncomes: true,
    incomesFilterType: "ALL" as const,
    incomesYear: 0,
    incomesMonth: 0,
    incomesPage: page,
    incomesSize: 20,
    incomesSortBy: "creationDate" as const,
    incomesDirection: "desc" as const,
    disableCache: true,
  }), [page]);

  const { incomes, loading, refreshData } = useFinancialData(options);

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

  const handleLoadMore = () => {
    // Protección adicional contra múltiples llamadas simultáneas
    if (loading || isLoadingMore) {
      return;
    }

    if (
      !isLoadingMore &&
      incomes?.page &&
      typeof incomes.page.number === "number" &&
      typeof incomes.page.totalPages === "number" &&
      incomes.page.number + 1 < incomes.page.totalPages
    ) {
      console.log('Condiciones cumplidas, cargando página:', page + 1);
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    } else {
      console.log('Condiciones no cumplidas para cargar más');
      console.log('Página actual:', incomes?.page?.number);
      console.log('Total páginas:', incomes?.page?.totalPages);
    }
  };

  useEffect(() => {
    if (incomes?.content) {
      if (page === 0) {
        setIncomesList(incomes.content);
      } else {
        setIncomesList((prev) => {
          const ids = new Set(prev.map((e) => e.id));
          const nuevos = incomes.content.filter((e) => !ids.has(e.id));
          return [...prev, ...nuevos];
        });
      }
      setIsLoadingMore(false);
    }
  }, [incomes, page]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Header title="Todos los ingresos" showBackButton={true} showConfig={false} />
      <IncomesTransactions
        incomes={
          incomes
            ? {
                content: incomesList,
                page: incomes.page ?? {
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

export default function ViewMoreIncomesPage() {
  return (
    <AlertProvider>
      <ViewMoreIncomes />
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
