import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import Header from "../../../src/components/Header";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import type { Debt, RecentPayment, DebtPaymentCreateDTO, DebtPaymentResponse } from "../../../src/interfaces/types";
import { dateTimeFormatter } from "../../../src/utils";
import {
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Plus,
} from "lucide-react-native";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import AppButton from "../../../src/components/AppButton";
import { useDebtActions } from "../../../src/hooks/useDebtActions";
import ConfirmationModal from "../../../src/components/ConfirmationModal";
import AddDebtPaymentModal from "../../../src/components/AddDebtPaymentModal";

function DebtDetails() {
  const { debt: debtString } = useLocalSearchParams();
  const [debt, setDebt] = useState<Debt | null>(null);
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const { removeDebt, addDebtPayment, getPayments } = useDebtActions();

  useEffect(() => {
    try {
      if (debtString) {
        const parsedDebt = JSON.parse(debtString as string);
        setDebt(parsedDebt);
        // Cargar los pagos una vez que tengamos la deuda
        loadDebtPayments(parsedDebt.id);
      } else {
        setError("No se recibieron datos de la deuda");
      }
    } catch (err) {
      setError("Error al procesar los datos de la deuda");
      console.error("Error parsing debt data:", err);
    }
  }, [debtString]);

  const loadDebtPayments = async (debtId: number) => {
    setLoadingPayments(true);
    try {
      const result = await getPayments(debtId, 0, 50); // Cargar hasta 50 pagos
      if (result.success && result.data) {
        const paymentResponse = result.data as DebtPaymentResponse;
        setPayments(paymentResponse.content);
      } else {
        console.error("Error loading payments:", result.error);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!debt) return;

    setIsDeleting(true);
    setShowDeleteModal(false);

    try {
      const result = await removeDebt(debt.id);

      if (result.success) {
        Alert.alert(
          "Deuda eliminada",
          "La deuda ha sido eliminada exitosamente",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          Array.isArray(result.error) ? result.error.join("\n") : result.error || "No se pudo eliminar la deuda",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error inesperado al eliminar la deuda", [
        { text: "OK" },
      ]);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleEditPress = () => {
    if (!debt) return;

    router.push({
      pathname: "/(protected)/(stacks)/edit-debt",
      params: {
        debtId: debt.id.toString(),
        description: debt.description,
        initialAmount: debt.initialAmount.toString(),
        interestRate: debt.interestRate.toString(),
        creditorName: debt.creditorName,
        type: debt.type,
        dueDate: debt.dueDate,
      },
    });
  };

  const handleAddPaymentPress = () => {
    setShowAddPaymentModal(true);
  };

  const handleAddPaymentConfirm = async (amount: number, date: string ,notes: string) => {
    if (!debt) return;

    setIsAddingPayment(true);

    try {
      const paymentData: DebtPaymentCreateDTO = {
        amount,
        paymentDate: date,
        notes,
      };

      const result = await addDebtPayment(debt.id, paymentData);

      if (result.success) {
        setShowAddPaymentModal(false);
        Alert.alert(
          "Pago registrado",
          `Se registró exitosamente el pago de $${amount.toLocaleString()} para la deuda "${debt.description}"`,
          [
            {
              text: "OK",
              onPress: () => {
                // Refrescar los datos para mostrar el nuevo pago
                refreshData();
                // Recargar los pagos de la deuda
                loadDebtPayments(debt.id);
                // Actualizar la deuda con el nuevo monto actual
                setDebt(prevDebt => prevDebt ? {
                  ...prevDebt,
                  currentAmount: Math.max(0, prevDebt.currentAmount - amount),
                  paymentProgress: Math.min(100, ((prevDebt.initialAmount - Math.max(0, prevDebt.currentAmount - amount)) / prevDebt.initialAmount) * 100)
                } : null);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          Array.isArray(result.error) ? result.error.join("\n") : result.error || "No se pudo registrar el pago",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error inesperado al registrar el pago", [
        { text: "OK" },
      ]);
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleAddPaymentCancel = () => {
    setShowAddPaymentModal(false);
  };

  // Simulamos la obtención de pagos (en una implementación real, esto vendría de la API)
  const { refreshData } = useFinancialData({});

  if (error) {
    return (
      <View style={styles.container}>
        <Header showBackButton={true} title="Detalles" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  if (!debt) {
    return (
      <View style={styles.container}>
        <Header showBackButton={true} title="Detalles" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

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
        return <CheckCircle size={20} color="#4caf50" />;
      case "ACTIVE":
        return <Clock size={20} color="#ff9800" />;
      case "DEFAULTED":
        return <AlertTriangle size={20} color="#dc2626" />;
      case "REFINANCED":
        return <CreditCard size={20} color="#2196f3" />;
      default:
        return <Clock size={20} color="#666" />;
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

  const paymentProgress = ((debt.initialAmount - debt.currentAmount) / debt.initialAmount) * 100;
  const isOverdue = new Date(debt.dueDate) < new Date() && debt.status === "ACTIVE";

  function debtItem(item: Debt) {
    return (
      <View style={[styles.debtItem, isOverdue && styles.overdueItem]}>
        <View style={styles.debtHeader}>
          <View style={styles.typeContainer}>
            <CreditCard size={24} color="#2b4afcff" />
            <Text style={styles.debtType}>{getDebtTypeLabel(item.type)}</Text>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.debtDescription}>{item.description}</Text>

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
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Pagado hasta ahora:</Text>
            <Text style={styles.paidAmount}>
              ${(item.initialAmount - item.currentAmount).toLocaleString()}
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
            <Text style={styles.dateLabel}>Inicio:</Text>
            <Text style={styles.dateText}>
              {dateTimeFormatter(item.startDate)}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Vence:</Text>
            <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
              {dateTimeFormatter(item.dueDate)}
            </Text>
          </View>
        </View>

        {item.interestRate > 0 && (
          <View style={styles.interestContainer}>
            <Text style={styles.interestRate}>
              Tasa de interés: {item.interestRate}%
            </Text>
          </View>
        )}
      </View>
    );
  }

  const renderPayment = ({ item, index }: { item: RecentPayment; index: number }) => {
    return (
      <View style={styles.paymentItem}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIconContainer}>
            <DollarSign size={20} color="#4caf50" />
          </View>
          <View style={styles.paymentContent}>
            <View style={styles.paymentTitleRow}>
              <Text style={styles.paymentTitle}>Pago #{index + 1}</Text>
              <Text style={styles.paymentAmount}>
                ${item.amount.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.paymentDate}>
              {dateTimeFormatter(item.paymentDate)}
            </Text>
            {item.notes && (
              <Text style={styles.paymentNotes} numberOfLines={2}>
                {item.notes}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} title="Detalles de Deuda" showConfig={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {debtItem(debt)}
        
        <View style={styles.buttons}>
          <AppButton
            title="Editar Deuda"
            bgColor="#2b4afcff"
            pressedColor="#1f3bd6ff"
            onPress={handleEditPress}
            icon={<Edit size={20} color={"#ffffff"} />}
          />
          <AppButton
            title="Eliminar Deuda"
            bgColor="#dc2626"
            pressedColor="#ac1a1aff"
            onPress={handleDeletePress}
            icon={<Trash2 size={20} color="#ffffff" />}
          />
        </View>

        <View style={styles.paymentsContainer}>
          <View style={styles.paymentsHeader}>
            <Text style={styles.paymentsTitle}>Historial de Pagos</Text>
            <AppButton 
              title="Agregar Pago"
              onPress={handleAddPaymentPress}
              bgColor="#4caf50"
              pressedColor="#388e3c"
              icon={<Plus size={16} color="#ffffff" />}
            />
          </View>

          {loadingPayments ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Cargando pagos...
              </Text>
            </View>
          ) : payments && payments.length > 0 ? (
            <FlatList
              data={payments}
              renderItem={renderPayment}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay pagos registrados para esta deuda
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Eliminar Deuda"
        message={`¿Estás seguro de que deseas eliminar la deuda "${debt?.description}"?`}
        warning="Esta acción no se puede deshacer y se eliminarán todos los pagos asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonColor="#dc2626"
        icon={<Trash2 size={24} color="#dc2626" />}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />

      {/* Modal para agregar pago */}
      <AddDebtPaymentModal
        visible={showAddPaymentModal}
        debtDescription={debt?.description || ""}
        currentAmount={debt?.currentAmount || 0}
        onConfirm={handleAddPaymentConfirm}
        onCancel={handleAddPaymentCancel}
        isLoading={isAddingPayment}
      />
    </View>
  );
}

export default DebtDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
  },
  debtItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  overdueItem: {
    borderColor: "#dc2626",
    borderWidth: 2,
  },
  debtHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeContainer: {
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
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  creditorContainer: {
    flexDirection: "row",
    marginBottom: 16,
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
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
  },
  initialAmount: {
    fontSize: 16,
    color: "#666",
  },
  paidAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4caf50",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4caf50",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  debtFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1a1a1a",
    marginLeft: 4,
  },
  overdueText: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  interestContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  interestRate: {
    fontSize: 12,
    color: "#ff9800",
    fontWeight: "500",
  },
  buttons: {
    margin: 16,
    flexDirection: "row",
    gap: 10,
  },
  paymentsContainer: {
    flex: 1,
    marginTop: 16,
  },
  paymentsHeader: {
    flexDirection: "row",
    gap: 40,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 16,
  },
  paymentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  paymentItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  paymentHeader: {
    flexDirection: "row",
    padding: 16,
  },
  paymentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4caf50",
  },
  paymentDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  paymentNotes: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
