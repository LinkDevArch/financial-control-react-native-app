import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import Card from "./Card";
import type { Report } from "../interfaces/types";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  HandCoins,
  CreditCard,
  Target,
} from "lucide-react-native";

interface SummaryCardsProps {
  report: Report;
  debtsValueSummary: number;
  goalsSummary: number;
}

export default function SummaryCards({
  report,
  debtsValueSummary,
  goalsSummary,
}: SummaryCardsProps) {
  const gridData = [
    {
      id: 1,
      icon: <HandCoins size={30} color="#32c007ff" />,
      title: "Ingresos",
      value: report?.totalIncome || 0,
      valueType: "amount" as const,
      variant: "up" as const,
    },
    {
      id: 2,
      icon: <TrendingDown size={30} color="#f44336" />,
      title: "Gastos",
      value: report?.totalExpenses || 0,
      valueType: "amount" as const,
      variant: "down" as const,
    },
    {
      id: 3,
      icon: <PiggyBank size={30} color="#FFEB3B" />,
      title: "Balance",
      value: report?.balance || 0,
      valueType: "amount" as const,
      variant: "up" as const,
    },
    {
      id: 5,
      icon: <CreditCard size={30} color="#f44336" />,
      title: "Deudas",
      value: debtsValueSummary,
      valueType: "amount" as const,
    },
    {
      id: 4,
      icon: <TrendingUp size={30} color="#32c007ff" />,
      title: "Ahorro",
      value: report?.savingsRate || 0,
      valueType: "percentage" as const,
      variant: "up" as const,
    },

    {
      id: 6,
      icon: <Target size={30} color="#2b4afcff" />,
      title: "Metas",
      value: goalsSummary,
    },
  ];

  const renderCard = ({ item }: { item: any }) => (
    <View style={styles.gridItem}>
      <Card
        icon={item.icon}
        title={item.title}
        value={item.value}
        valueType={item.valueType}
        variant={item.variant}
      />
    </View>
  );

  return (
    <View style={{ gap: 4 }}>
      <View style={styles.gridItem}>
        <Card
          icon={gridData[0].icon}
          title={gridData[0].title}
          value={gridData[0].value}
          valueType={gridData[0].valueType}
          variant={gridData[0].variant}
        />
      </View>
      <View style={styles.gridItem}>
        <Card
          icon={gridData[1].icon}
          title={gridData[1].title}
          value={gridData[1].value}
          valueType={gridData[1].valueType}
          variant={gridData[1].variant}
        />
      </View>
      <View style={styles.gridItem}>
        <Card
          icon={gridData[2].icon}
          title={gridData[2].title}
          value={gridData[2].value}
          valueType={gridData[2].valueType}
          variant={gridData[2].variant}
        />
      </View>
      <View style={styles.gridItem}>
        <Card
          icon={gridData[3].icon}
          title={gridData[3].title}
          value={gridData[3].value}
          valueType={gridData[3].valueType}
          variant={gridData[3].variant}
        />
      </View>
      <View style={{flexDirection: 'row', gap: 4}}>
        <View style={styles.gridItem}>
          <Card
            icon={gridData[4].icon}
            title={gridData[4].title}
            value={gridData[4].value}
            valueType={gridData[4].valueType}
            variant={gridData[4].variant}
          />
        </View>
        <View style={styles.gridItem}>
          <Card
            icon={gridData[5].icon}
            title={gridData[5].title}
            value={gridData[5].value}
            valueType={gridData[5].valueType}
            variant={gridData[5].variant}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {},
  gridItem: {
    flex: 1,
  },
  row: {
    gap: 5,
    paddingHorizontal: 0,
  },
  separator: {
    height: 5,
  },
});
