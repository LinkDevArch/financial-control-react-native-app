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
import { GoalResponse } from "../../../src/interfaces/types";
import { useState } from "react";
import { useEffect } from "react";
import type { Deposit, Goal, DepositCreateDTO } from "../../../src/interfaces/types";
import { dateTimeFormatter } from "../../../src/utils";
import {
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Edit,
  PiggyBank,
} from "lucide-react-native";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import AppButton from "../../../src/components/AppButton";
import { useGoalActions } from "../../../src/hooks/useGoalActions";
import ConfirmationModal from "../../../src/components/ConfirmationModal";
import AddDepositModal from "../../../src/components/AddDepositModal";

function GoalDetails() {
  const { goal: goalString } = useLocalSearchParams();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [isAddingDeposit, setIsAddingDeposit] = useState(false);

  const { removeGoal, addGoalDeposit } = useGoalActions();

  useEffect(() => {
    try {
      if (goalString) {
        const parsedGoal = JSON.parse(goalString as string);
        setGoal(parsedGoal);
      } else {
        setError("No se recibieron datos de la meta");
      }
    } catch (err) {
      setError("Error al procesar los datos de la meta");
      console.error("Error parsing goal data:", err);
    }
  }, [goalString]);

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!goal) return;

    setIsDeleting(true);
    setShowDeleteModal(false);

    try {
      const result = await removeGoal(goal.id);

      if (result.success) {
        Alert.alert(
          "Meta eliminada",
          "La meta ha sido eliminada exitosamente",
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
          result.error?.join("\n") || "No se pudo eliminar la meta",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error inesperado al eliminar la meta", [
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
    if (!goal) return;

    router.push({
      pathname: "/(protected)/(stacks)/edit-goal",
      params: {
        goalId: goal.id.toString(),
        name: goal.name,
        description: goal.description,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        startDate: goal.startDate,
        targetDate: goal.targetDate,
        status: goal.status,
      },
    });
  };

  const handleAddDepositPress = () => {
    setShowAddDepositModal(true);
  };

  const handleAddDepositConfirm = async (amount: number) => {
    if (!goal) return;

    setIsAddingDeposit(true);

    try {
      const depositData: DepositCreateDTO = { amount };
      const result = await addGoalDeposit(goal.id, depositData);

      if (result.success) {
        setShowAddDepositModal(false);
        Alert.alert(
          "Depósito agregado",
          `Se agregó exitosamente $${amount.toLocaleString()} a la meta "${goal.name}"`,
          [
            {
              text: "OK",
              onPress: () => {
                // Refrescar los datos para mostrar el nuevo depósito
                refreshData();
                // Actualizar la meta con los nuevos valores
                if (result.data) {
                  setGoal(prevGoal => prevGoal ? {
                    ...prevGoal,
                    currentAmount: prevGoal.currentAmount + amount,
                    progressPercentage: Math.min(100, ((prevGoal.currentAmount + amount) / prevGoal.targetAmount) * 100)
                  } : null);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          Array.isArray(result.error) ? result.error.join("\n") : result.error || "No se pudo agregar el depósito",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error inesperado al agregar el depósito", [
        { text: "OK" },
      ]);
    } finally {
      setIsAddingDeposit(false);
    }
  };

  const handleAddDepositCancel = () => {
    setShowAddDepositModal(false);
  };

  const { deposits, loading, refreshData } = useFinancialData({
    fetchDeposits: !!goal?.id,
    depositsGoalId: goal?.id,
    depositsPage: page,
    depositsSize: 20,
    depositsSortBy: "createdAt",
    depositsDirection: "desc",
  });

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#4caf50";
      case "IN_PROGRESS":
        return "#ff9800";
      default:
        return "#2b4afcff";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={20} color="#4caf50" />;
      case "IN_PROGRESS":
        return <Clock size={20} color="#ff9800" />;
      default:
        return <Target size={20} color="#2b4afcff" />;
    }
  };

  function goalItem(item: Goal) {
    const progressPercentage = Math.min(
      100,
      Math.max(0, item.progressPercentage || 0)
    );

    return (
      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <View style={styles.iconContainer}>{getStatusIcon(item.status)}</View>
          <View style={styles.goalContent}>
            <View style={styles.goalTitleRow}>
              <Text style={styles.goalName}>{item.name}</Text>
              <Text style={styles.goalAmount}>
                ${item.currentAmount.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.goalDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              ${item.currentAmount.toLocaleString()} de $
              {item.targetAmount.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.progressPercentage,
                { color: getStatusColor(item.status) },
              ]}
            >
              {progressPercentage.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.goalFooter}>
          <View style={styles.sideContainer}>
            <Text style={styles.goalDate}>
              Fecha de inicio: {dateTimeFormatter(item.startDate)}
            </Text>
            <Text style={styles.goalDate}>
              Fecha límite: {dateTimeFormatter(item.targetDate)}
            </Text>
          </View>

          <Text
            style={[styles.goalStatus, { color: getStatusColor(item.status) }]}
          >
            {item.status === "COMPLETED"
              ? "Completada"
              : item.status === "IN_PROGRESS"
              ? "En progreso"
              : "Pendiente"}
          </Text>
        </View>
      </View>
    );
  }

  const renderDeposit = ({ item, index }: { item: Deposit; index: number }) => {
    return (
      <View style={styles.depositItem}>
        <View style={styles.depositHeader}>
          <View style={styles.depositIconContainer}>
            <Text style={styles.depositIcon}>
              {<PiggyBank color={"#4caf50"} />}
            </Text>
          </View>
          <View style={styles.depositContent}>
            <View style={styles.depositTitleRow}>
              <Text style={styles.depositTitle}>Depósito #{index + 1}</Text>
              <Text style={styles.depositAmount}>
                ${item.amount.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.depositDate}>
              {dateTimeFormatter(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.layoutContainer}>
      <Header showBackButton={true} title="Detalles" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {goalItem(goal)}
        <View style={styles.buttons}>
          <AppButton
            title="Editar Meta"
            bgColor="#2b4afcff"
            pressedColor="#1f3bd6ff"
            onPress={handleEditPress}
            icon={<Edit size={20} color={"#ffffff"} />}
          />
          <AppButton
            title="Eliminar Meta"
            bgColor="#dc2626"
            pressedColor="#ac1a1aff"
            onPress={handleDeletePress}
            icon={<Trash2 size={20} color="#ffffff" />}
          />
        </View>
        <View style={styles.depositsContainer}>
          <View style={styles.depositsHeader}>
            <Text style={styles.depositsTitle}>Depósitos</Text>
            <AppButton 
              title="Añadir Deposito"
              onPress={handleAddDepositPress}
              bgColor="#4caf50"
              pressedColor="#388e3c"
              icon={<Plus size={16} color="#ffffff" />}
            />
          </View>

          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Cargando depósitos...</Text>
            </View>
          ) : deposits && deposits.content && deposits.content.length > 0 ? (
            <FlatList
              data={deposits.content}
              renderItem={renderDeposit}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay depósitos registrados para esta meta
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Eliminar Meta"
        message={`¿Estás seguro de que deseas eliminar la meta "${goal?.name}"?`}
        warning="Esta acción no se puede deshacer y se eliminarán todos los depósitos asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonColor="#dc2626"
        icon={<Trash2 size={24} color="#dc2626" />}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />

      {/* Modal para agregar depósito */}
      <AddDepositModal
        visible={showAddDepositModal}
        goalName={goal?.name || ""}
        onConfirm={handleAddDepositConfirm}
        onCancel={handleAddDepositCancel}
        isLoading={isAddingDeposit}
      />
    </View>
  );
}

export default GoalDetails;

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  goalItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  goalHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goalContent: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2b4afcff",
  },
  goalDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: "bold",
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
  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalDate: {
    fontSize: 12,
    color: "#888",
  },
  sideContainer: {
    flexDirection: "column",
    gap: 5,
  },
  goalStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Estilos para depósitos
  depositsContainer: {
    flex: 1,
    marginTop: 16,
  },
  depositsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  depositItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  depositHeader: {
    flexDirection: "row",
    padding: 16,
  },
  depositIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  depositIcon: {
    fontSize: 18,
  },
  depositContent: {
    flex: 1,
  },
  depositTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  depositTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  depositAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4caf50",
  },
  depositDate: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttons: {
    margin: 10,
    flexDirection: "row",
    gap: 10,
  },
  depositsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 100,
    alignItems: 'center',
    marginBottom: 10,
    marginInline: 15
  }
});
