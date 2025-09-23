import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useFonts,
  Inter_700Bold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";
import { amountFormatter } from "../utils";

interface ResumeCardProps {
  icon: React.ReactNode;
  value: number;
  valueType?: "amount" | "percentage";
  title: string;
  percentage?: number;
  variant?: "up" | "down";
}

export default function Card({
  icon,
  value,
  valueType,
  title,
  percentage,
  variant,
}: ResumeCardProps) {
  let [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null; // Mientras cargan las fuentes
  }

  let valueDisplay;
  if (valueType === "amount") {
    valueDisplay = <Text style={styles.value}>${amountFormatter(value)}</Text>;
  } else if (valueType === "percentage") {
    valueDisplay = <Text style={styles.value}>{value}%</Text>;
  } else 
    valueDisplay = <Text style={styles.value}>{value}</Text>;

  return (
    <View style={[styles.container]}>
      <View style={styles.iconContainer}>
        {icon}
        {percentage ? (
          <Text style={styles.percentage}>{percentage}%</Text>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {valueDisplay}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBlock: 7,
    borderRadius: 5,
    backgroundColor: "#ffffffff",
    borderWidth: 1,
    borderColor: "#36353834",
  },
  up: {
    // borderLeftColor: '#4caf50',
  },
  down: {
    // backgroundColor: '#ffeaea',
    // borderLeftColor: '#f44336',
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: "#737373",
    fontFamily: "Inter_400Regular",
  },
  value: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#000000",
  },
  percentage: {
    fontSize: 12,
    color: "#666",
  },
});
