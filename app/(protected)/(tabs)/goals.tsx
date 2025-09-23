import React, { useState, useCallback } from "react";
import Header from "../../../src/components/Header";
import Navbar from "../../../src/components/Navbar";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import AppButton from "../../../src/components/AppButton";
import { PlusCircle, Target, CheckCircle, Clock } from "lucide-react-native";
import { useFinancialData } from "../../../src/hooks/useFinancialData";
import { Goal } from "../../../src/interfaces/types";
import { dateTimeFormatter } from "../../../src/utils";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GoalsPage = React.memo(() => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const router = useRouter();
  const { goals, loading, refreshData } = useFinancialData({
    fetchGoals: true,

    goalsSize: 20,
    goalsPage: page,
    goalsDirection: "desc",
    goalsSortBy: "createdAt",
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

  const handleGoalPress = (goal: Goal) => {
    console.log("Meta presionada:", goal.name);
    router.push({
      pathname: "/(protected)/(stacks)/goal-details",
      params: {
        goal: JSON.stringify(goal),
      },
    });
  };

  const renderGoal = ({ item, index }: { item: Goal; index: number }) => {
    const progressPercentage = Math.min(
      100,
      Math.max(0, item.progressPercentage || 0)
    );

    return (
      <View style={styles.goalItem}>
        <Pressable
          onPress={() => handleGoalPress(item)}
          style={({ pressed }) => [
            styles.pressableContent,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.goalHeader}>
            <View style={styles.iconContainer}>
              {getStatusIcon(item.status)}
            </View>
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
            <Text style={styles.goalDate}>
              Fecha límite: {dateTimeFormatter(item.targetDate)}
            </Text>
            <Text
              style={[
                styles.goalStatus,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status === "COMPLETED"
                ? "Completada"
                : item.status === "IN_PROGRESS"
                ? "En progreso"
                : "Pendiente"}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.layoutContainer, { paddingBottom: insets.bottom }]}>
      <Header title="Metas" />
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
        <View style={styles.contentContainer}>
          <View style={styles.addBtn}>
            <AppButton
              bgColor="#2b4afcff"
              title="Agregar Metas"
              onPress={() => router.push("/(protected)/(stacks)/add-goal")}
              icon={<PlusCircle color={"#ffffff"} style={styles.addBtn} />}
            />
          </View>
          {goals?.content.length == 0 ? (
            <View style={styles.emptyContainer}>
              <Target size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No hay metas agregadas</Text>
              <Text style={styles.emptySubtitle}>
                Comienza agregando tus metas para alcanzarlas con constancia!
              </Text>
            </View>
          ) : loading ? (
            <View>
              <Text>Cargando...</Text>
            </View>
          ) : (
            <FlatList
              data={goals?.content}
              renderItem={renderGoal}
              keyExtractor={(item) => `${item.id}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
});

export default GoalsPage;

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    position: "relative",
  },
  addBtn: {
    marginBlock: 10,
  },
  contentContainer: {
    marginBottom: 20,
    paddingInline: 10,
    paddingBottom: 70,
  },
  goalItem: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pressableContent: {
    flex: 1,
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
  goalStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
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
