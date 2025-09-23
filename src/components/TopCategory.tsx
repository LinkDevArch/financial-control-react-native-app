import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Report } from "../interfaces/types";
import { amountFormatter } from "../utils";

interface TopCategoryProps {
  report: Report;
  fontTitle: string;
  fontContent: string;
}

export default function TopCategory({
  report,
  fontTitle,
  fontContent,
}: TopCategoryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionContent}>
        <View style={styles.headerContainer}>
          <Text style={[styles.sectionTitle, { fontFamily: fontTitle }]}>
            Top categorías de gastos
          </Text>
          <View
            style={[styles.shapeColor, { backgroundColor: "#f44336" }]}
          ></View>
        </View>
        {report.topExpenseCategories.length === 0 ? (
          <Text>No hay gastos</Text>
        ) : (
          report.topExpenseCategories.map((cat, idx) => (
            <View key={idx} style={styles.elementContainer}>
              <Text style={{ fontFamily: fontContent }}>{cat.category}</Text>
              <View style={styles.rightColumn}>
                <Text
                  style={[styles.rightColumnText, { fontFamily: fontContent }]}
                >
                  ${amountFormatter(cat.amount)}
                </Text>
                <Text style={[styles.percentage, { fontFamily: fontContent }]}>
                  {cat.percentage}%
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionContent}>
        <View style={styles.headerContainer}>
          <Text style={[styles.sectionTitle, { fontFamily: fontTitle }]}>
            Top categorías de ingresos
          </Text>
          <View
            style={[styles.shapeColor, { backgroundColor: "#4caf50" }]}
          ></View>
        </View>
        {report.topIncomeCategories.length === 0 ? (
          <Text>No hay ingresos</Text>
        ) : (
          report.topIncomeCategories.map((cat, idx) => (
            <View key={idx} style={styles.elementContainer}>
              <Text style={{ fontFamily: fontContent }}>{cat.category}</Text>
              <View style={styles.rightColumn}>
                <Text
                  style={[styles.rightColumnText, { fontFamily: fontContent }]}
                >
                  ${amountFormatter(cat.amount)}
                </Text>
                <Text style={[styles.percentage, { fontFamily: fontContent }]}>
                  {cat.percentage}%
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    rowGap: 20,
  },
  headerContainer: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shapeColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
  },
  sectionContent: {
    gap: 10,
  },
  elementContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rightColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    rowGap: 2,
  },
  rightColumnText: {
    textAlign: "right",
  },
  percentage: {
    color: "#888",
    fontSize: 12,
  },
});
