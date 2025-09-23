import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { IncomesVsExpensesResponse } from '../interfaces/types';

interface FinancialChartsProps {
  data: IncomesVsExpensesResponse;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 70;

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ data }) => {
  // Verificar si hay datos válidos para mostrar el gráfico
  const hasValidData = data.totalIncome > 0 || data.totalExpenses > 0;
  // Preparar datos para los gráficos
  const monthlyData = Object.entries(data.monthlyComparison)
    .map(([month, values]) => ({
      month: month.slice(-2), // Solo mostrar MM
      fullMonth: month,
      income: values.income / 1000000, // Convertir a millones
      expenses: values.expenses / 1000000,
      balance: values.balance / 1000000,
    }))
    // .filter(item => item.income > 0 || item.expenses > 0); // Filtrar meses sin datos

  // Configuración común para los gráficos
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e0e0e0',
      strokeWidth: 1,
    },
  };

  // Datos para gráfico de líneas
  const lineChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        data: monthlyData.map(item => item.income),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: monthlyData.map(item => item.expenses),
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Ingresos', 'Gastos'],
  };

  // Datos para gráfico de barras
  const barChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        data: monthlyData.map(item => item.balance),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      },
    ],
  };

  // Datos para gráfico de torta
  const pieChartData = [
    {
      name: 'Ingresos',
      population: data.totalIncome,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: 15,
    },
    {
      name: 'Gastos',
      population: data.totalExpenses,
      color: '#F44336',
      legendFontColor: '#333',
      legendFontSize: 15,
    },
  ];

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(1)}M`;
  };

  const formatYLabel = (value: string) => {
    const numValue = parseFloat(value);
    return `$${numValue.toFixed(1)}M`;
  };

  const formatFullCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <View style={styles.container}>
      {/* Resumen del período actual */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen {data.period}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
              {formatFullCurrency(data.totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={[styles.summaryValue, { color: '#F44336' }]}>
              {formatFullCurrency(data.totalExpenses)}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryValue, { color: data.netBalance >= 0 ? '#4CAF50' : '#F44336' }]}>
              {formatFullCurrency(data.netBalance)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tasa de Ahorro</Text>
            <Text style={[styles.summaryValue, { color: '#2196F3' }]}>
              {data.savingsRate.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Gráfico de líneas - Tendencia mensual */}
      {monthlyData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tendencia Mensual (Millones)</Text>
          <LineChart
            data={lineChartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            formatYLabel={formatYLabel}
          />
        </View>
      )}

      {/* Gráfico de barras - Balance mensual */}
      {monthlyData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Balance Mensual (Millones)</Text>
          <BarChart
            data={barChartData}
            width={chartWidth}
            height={220}
            yAxisLabel="$"
            yAxisSuffix="M"
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      )}


      {/* Gráfico de torta - Distribución total */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Distribución Total del Período</Text>
        
        {/* Leyenda personalizada */}
        <View style={styles.pieChartContainer}>
          <View style={styles.legendContainer}>
            {pieChartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.name}: {hasValidData ? `${((item.population / (data.totalIncome + data.totalExpenses)) * 100).toFixed(1)}%` : "0%"}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Gráfico sin leyenda */}
          <View style={styles.pieContainer}>
            {hasValidData ? (<PieChart
              data={pieChartData.map(item => ({
                ...item,
                name: '', // Quitar nombres para que no se muestren
              }))}
              width={Math.min(chartWidth, 300)} // Aumentar un poco el ancho
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15" // Restaurar padding necesario
              center={[60, 0]} // Mover el centro hacia la DERECHA
              absolute // Mostrar valores absolutos en lugar de porcentajes
              hasLegend={false} // Desactivar leyenda built-in
              style={styles.chart}
            />) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No hay datos para mostrar</Text>
                <Text style={styles.noDataSubtext}>
                  Agrega algunos ingresos o gastos para ver la distribución
                </Text>
              </View>
            )}
            
          </View>
        </View>
      </View>

      {/* Métricas adicionales */}
      <View style={styles.metricsCard}>
        <Text style={styles.chartTitle}>Métricas del Período</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Promedio de ingresos mensuales:</Text>
          <Text style={styles.metricValue}>
            {formatFullCurrency(data.totalIncome / Math.max(monthlyData.length, 1))}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Promedio de gastos mensuales:</Text>
          <Text style={styles.metricValue}>
            {formatFullCurrency(data.totalExpenses / Math.max(monthlyData.length, 1))}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Mejor mes (balance):</Text>
          <Text style={styles.metricValue}>
            {monthlyData.length > 0 
              ? monthlyData.reduce((prev, current) => 
                  prev.balance > current.balance ? prev : current
                ).fullMonth
              : 'N/A'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    gap: 10
  },
  summaryCard: {
    backgroundColor: 'white',
    marginInline: 10,
    padding: 20,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  metricsCard: {
    backgroundColor: 'white',
    marginInline: 10,
    padding: 20,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
