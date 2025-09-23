import React, { useState } from "react";
import Header from "../../../src/components/Header";
import Navbar from "../../../src/components/Navbar";
import { router } from "expo-router";
import { Plus, CreditCard, AlertTriangle, CheckCircle, Clock } from "lucide-react-native";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import type { Debt } from "../../../src/interfaces/types";
import { dateTimeFormatter } from "../../../src/utils";
import AppButton from "../../../src/components/AppButton";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DebtsPage() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { debts, loading, refreshData } = useFinancialData({
    fetchDebts: true,
    debtsPage: 0,
    debtsSize: 20,
    debtsSortBy: "createdAt",
    debtsDirection: "desc",
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getDebtTypeLabel = (type: string) => {
    switch (type) {
      case "CREDIT_CARD":
        return "Tarjeta de crédito";
      case "LOAN":
        return "Préstamo";
      case "PERSONAL_DEBT":
        return "Deuda personal";
      case "MORTGAGE":
        return "Hipoteca";
      case "OTHER":
        return "Otro";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID_OFF":
        return "#4caf50";
      case "ACTIVE":
        return "#ff9800";
      case "DEFAULTED":
        return "#dc2626";
      case "REFINANCED":
        return "#2196f3";
      default:
        return "#666";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID_OFF":
        return <CheckCircle size={16} color="#4caf50" />;
      case "ACTIVE":
        return <Clock size={16} color="#ff9800" />;
      case "DEFAULTED":
        return <AlertTriangle size={16} color="#dc2626" />;
      case "REFINANCED":
        return <CreditCard size={16} color="#2196f3" />;
      default:
        return <Clock size={16} color="#666" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID_OFF":
        return "Pagada";
      case "ACTIVE":
        return "Activa";
      case "DEFAULTED":
        return "En mora";
      case "REFINANCED":
        return "Refinanciada";
      default:
        return status;
    }
  };

  const handleDebtPress = (debt: Debt) => {
    router.push({
      pathname: "/(protected)/(stacks)/debt-details",
      params: {
        debt: JSON.stringify(debt),
      },
    });
  };

  const handleAddDebtPress = () => {
    router.push("/(protected)/(stacks)/add-debt");
  };

  const renderDebt = ({ item }: { item: Debt }) => {
    // Calcular el progreso de pago (inverso)
    const paymentProgress = ((item.initialAmount - item.currentAmount) / item.initialAmount) * 100;
    const isOverdue = new Date(item.dueDate) < new Date() && item.status === "ACTIVE";

    return (
      <TouchableOpacity 
        style={[styles.debtCard, isOverdue && styles.overdueCard]} 
        onPress={() => handleDebtPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.debtHeader}>
          <View style={styles.debtTypeContainer}>
            <CreditCard size={20} color="#2b4afcff" />
            <Text style={styles.debtType}>{getDebtTypeLabel(item.type)}</Text>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.debtDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.creditorContainer}>
          <Text style={styles.creditorLabel}>Acreedor:</Text>
          <Text style={styles.creditorName}>{item.creditorName}</Text>
        </View>

        <View style={styles.amountContainer}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Deuda actual:</Text>
            <Text style={styles.currentAmount}>
              ${item.currentAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Monto inicial:</Text>
            <Text style={styles.initialAmount}>
              ${item.initialAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso de pago</Text>
            <Text style={styles.progressPercentage}>
              {paymentProgress.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${paymentProgress}%`,
                  backgroundColor: getStatusColor(item.status)
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.debtFooter}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Vence:</Text>
            <Text style={[styles.dueDate, isOverdue && styles.overdueText]}>
              {dateTimeFormatter(item.dueDate)}
            </Text>
          </View>
          {item.interestRate > 0 && (
            <Text style={styles.interestRate}>
              {item.interestRate}% interés
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Deudas" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando deudas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Header title="Deudas" />
      <ScrollView
        showsVerticalScrollIndicator={false}
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
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>Mis Deudas</Text>
              {debts?.content && debts.content.length > 0 && (
                <Text style={styles.debtCount}>
                  {debts.content.length} deuda{debts.content.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
            
            <AppButton
              title="Agregar"
              icon={<Plus size={20} color="#ffffff" />}
              onPress={handleAddDebtPress}
              bgColor="#2b4afcff"
              pressedColor="#1f3bd6ff"
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando deudas...</Text>
            </View>
          ) : debts?.content && debts.content.length > 0 ? (
            <FlatList
              data={debts.content}
              renderItem={renderDebt}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <CreditCard size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No hay deudas agregadas</Text>
              <Text style={styles.emptySubtitle}>
                Comienza agregando tus deudas para llevar un mejor control de tus finanzas
              </Text>
              <View style={styles.emptyButtonContainer}>
                <AppButton
                  title="Agregar primera deuda"
                  icon={<Plus size={20} color="#ffffff" />}
                  onPress={handleAddDebtPress}
                  bgColor="#2b4afcff"
                  pressedColor="#1f3bd6ff"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 16,
    paddingBottom: 70, // Espacio para la navbar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  debtCount: {
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    paddingBottom: 20,
  },
  debtCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  overdueCard: {
    borderColor: "#dc2626",
    borderWidth: 2,
  },
  debtHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  debtTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  debtType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2b4afcff",
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  debtDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  creditorContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  creditorLabel: {
    fontSize: 14,
    color: "#666",
  },
  creditorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    marginLeft: 4,
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
  },
  initialAmount: {
    fontSize: 14,
    color: "#666",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4caf50",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  debtFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
  },
  dueDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1a1a1a",
    marginLeft: 4,
  },
  overdueText: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  interestRate: {
    fontSize: 12,
    color: "#ff9800",
    fontWeight: "500",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButtonContainer: {
    width: "80%",
  },
});
