import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from "../../../src/components/Header";
import Navbar from "../../../src/components/Navbar";
import { FinancialCharts } from "../../../src/components/FinancialCharts";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ReportsPage = React.memo(() => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [months, setMonths] = useState("6");
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Convertir período string a Date para el picker
  const periodDate = new Date(period + "-01");

  const { incomesVsExpenses, refreshData } = useFinancialData({
    fetchIncomesVsExpenses: true,
    incomesVsExpensesPeriod: period,
    incomesVsExpensesMonths: parseInt(months) || 6, // Parsear a int
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // En iOS mantener abierto, en Android cerrar
    if (selectedDate) {
      // Convertir la fecha seleccionada a formato YYYY-MM
      const formattedDate = selectedDate.toISOString().slice(0, 7);
      setPeriod(formattedDate);
    }
  };

  const handleMonthsChange = (text: string) => {
    // Solo permitir números
    const numericValue = text.replace(/[^0-9]/g, '');
    setMonths(numericValue);
  };

  return (
    <View style={[styles.layoutContainer, { paddingBottom: insets.bottom }]}>
      <Header title="Reportes" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E90FF"]}
            tintColor={"#1E90FF"}
            title="Actualizando..."
            titleColor={"#666"}
          />
        }
      >
        {/* Controles de filtros */}
        <View style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filtros de Reporte</Text>
          
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Meses:</Text>
              <TextInput
                style={styles.monthsInput}
                value={months}
                onChangeText={handleMonthsChange}
                placeholder="6"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            
            <Text style={styles.filterConnector}>meses antes de</Text>
            
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Período:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {new Date(period + "-01").toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={periodDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Gráficos financieros */}
        {incomesVsExpenses ? (
          <FinancialCharts data={incomesVsExpenses} />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Cargando datos financieros...
            </Text>
          </View>
        )}
      </ScrollView>
      <Navbar />
    </View>
  );
});

export default ReportsPage;

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    position: "relative",
  },
  contentContainerStyle: {
    paddingBottom: 70, // Espacio para la navbar (valor estándar)
  },
  filtersCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 0,
  },
  filterItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  monthsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 5,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 60,
    backgroundColor: '#f9f9f9',
  },
  filterConnector: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 5,
    backgroundColor: '#f9f9f9',
    minWidth: 120,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
