import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { TrendingUp, Edit3, Trash2 } from "lucide-react-native";
import type { IncomeDTO, IncomesResponse } from "../interfaces/types";
import AppButton from "./AppButton";
import ActionSheet from "./ActionSheet";
import { useIncomeActionSheet } from "../hooks/useActionSheets";
import { dateTimeFormatter } from "../utils";

interface Props {
  incomes?: IncomesResponse;
  showViewMoreBtn?: boolean;
  onButton?: () => void;
  showTitle?: boolean;
  notRadius?: boolean;
  onEndReached?: () => void;
  loadingMore?: boolean;
  enableScroll?: boolean;
  enableActions?: boolean;
  onRefresh?: () => void;
}

export default function IncomesTransactions({
  incomes,
  showViewMoreBtn = false,
  onButton,
  showTitle = true,
  notRadius = false,
  onEndReached,
  loadingMore,
  enableScroll = false,
  enableActions = false,
  onRefresh,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    selectedIncome,
    showActionSheet,
    openActionSheet,
    closeActionSheet,
    handleEdit,
    handleDelete,
  } = useIncomeActionSheet(onRefresh);

  useEffect(() => {
    if (incomes && incomes.content) {
      setIsLoading(false);
    }
  }, [incomes]);

  const renderTransaction = ({
    item,
    index,
  }: {
    item: IncomeDTO;
    index: number;
  }) => {
    const TransactionContainer = enableActions ? Pressable : View;

    return (
      <TransactionContainer
        style={[
          styles.transactionItem,
          enableActions && styles.pressableTransactionItem,
        ]}
        onLongPress={enableActions ? () => openActionSheet(item) : undefined}
        delayLongPress={500}
      >
        <View style={styles.iconContainer}>
          <TrendingUp size={20} color="#4caf50" />
        </View>
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.description}>{item.description}</Text>
            <Text
              style={[
                styles.amount,
                {
                  color: "#4caf50",
                },
              ]}
            >
              +${item.amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.transactionFooter}>
            <Text style={styles.category}>{item.sourceName}</Text>
            <Text style={styles.date}>
              {dateTimeFormatter(item.creationDate)}
            </Text>
          </View>
          <Text style={styles.accountName}>{item.accountName}</Text>
        </View>
      </TransactionContainer>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.listContainer,
          notRadius ? { borderRadius: 0, flex: 1 } : null,
        ]}
      >
        {showTitle && <Text style={styles.title}>Ingresos</Text>}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#1d1d1dff"
            style={{ marginVertical: 32 }}
          />
        ) : (
          <FlatList
            data={incomes?.content}
            renderItem={renderTransaction}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            scrollEnabled={enableScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            style={enableScroll ? { flex: 1 } : undefined}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay ingresos recientes</Text>
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color="#1d1d1dff" />
              ) : showViewMoreBtn ? (
                <AppButton
                  title="Ver más ingresos"
                  bgColor="#1d1d1dff"
                  pressedColor="#000000ff"
                  onPress={onButton}
                />
              ) : null
            }
            ListFooterComponentStyle={{
              margin: 16,
            }}
          />
        )}
      </View>

      {/* ActionSheet para acciones de editar/eliminar */}
      {enableActions && (
        <ActionSheet
          visible={showActionSheet}
          onClose={closeActionSheet}
          title={selectedIncome ? `${selectedIncome.description}` : "Opciones"}
          options={[
            {
              title: "Editar ingreso",
              icon: <Edit3 size={20} color="#2563eb" />,
              onPress: handleEdit,
              color: "#2563eb",
            },
            {
              title: "Eliminar ingreso",
              icon: <Trash2 size={20} color="#dc2626" />,
              onPress: handleDelete,
              destructive: true,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  listContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressableTransactionItem: {
    backgroundColor: "#fafafa",
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
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  category: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "transparent",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
    fontSize: 14,
  },
  actionHint: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
  },
  actionHintText: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
  accountName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: "#2b4afcff",
    backgroundColor: "transparent",
  },
});
