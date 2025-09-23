import { PlusCircle } from "lucide-react-native";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface Props {
  title: string;
  icon?: React.ReactNode;
  bgColor?: string;
  pressedColor?: string;
  row?: boolean;
  column?: boolean;
  onPress?: () => void;
}

export default function AppButton({
  title,
  icon,
  bgColor = "#1d1d1dff",
  pressedColor = "#000000ff",
  row,
  column,
  onPress,
}: Props) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      console.log(`There's no function to button ${title}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor },
        pressed && styles.buttonPressed,
        pressed && { backgroundColor: pressedColor },
      ]}
    >
      <View
        style={[
          styles.buttonContent,
          row && { flexDirection: "row" },
          column && { flexDirection: "column" },
        ]}
      >
        <Text style={styles.buttonText}>{title}</Text>
        {icon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }], // Efecto de "hundimiento"
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_500Medium",
  },
});
