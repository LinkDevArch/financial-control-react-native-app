import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import { useFinancialData } from "../hooks/useFinancialData";
import type { TransactionResponse } from "../interfaces/types";
import { dateTimeFormatter } from "../utils";

interface RecentTransactionsProps {
  transactions?: TransactionResponse[];
}

export default function RecentTransactions({transactions}: RecentTransactionsProps) {
  const displayTransactions = transactions;

  const renderTransaction = ({
    item,
    index,
  }: {
    item: TransactionResponse;
    index: number;
  }) => (
    <View style={styles.transactionItem}>
      <View style={styles.iconContainer}>
        {item.transactionType === "EXPENSE" ? (
          <TrendingDown size={20} color="#f44336" />
        ) : (
          <TrendingUp size={20} color="#4caf50" />
        )}
      </View>
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text style={styles.description}>{item.description}</Text>
          <Text
            style={[
              styles.amount,
              {
                color:
                  item.transactionType === "EXPENSE" ? "#f44336" : "#4caf50",
              },
            ]}
          >
            {item.transactionType === "EXPENSE" ? "-" : "+"}$
            {item.amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.transactionFooter}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{dateTimeFormatter(item.date)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <Text style={styles.title}>Transacciones Recientes</Text>

        <FlatList
          data={displayTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay transacciones recientes</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
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
});
