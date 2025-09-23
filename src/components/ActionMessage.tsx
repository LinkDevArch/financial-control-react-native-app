import { CircleAlert, CircleCheck, X } from "lucide-react-native";
import { Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRef, useEffect } from "react";

interface Props {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}

export default function ActionMessage({ message, type = "success", onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(-80)).current; // inicia arriba fuera de pantalla
  const fadeAnim = useRef(new Animated.Value(0)).current; // opacidad inicial 0
  const { width } = useWindowDimensions();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -80, // desliza hacia arriba
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // desvanece
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(); // el padre oculta el componente tras la animación
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: type === "success" ? "#4caf50" : "#f44336",
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          position: "absolute",
          top: 0,
          left: width ? width * 0.05 : 0,
          right: width ? width * 0.05 : 0,
          alignSelf: "center",
        },
      ]}
    >
      {type === "success" ? (
        <CircleCheck color="#ffffff" />
      ) : (
        <CircleAlert color="#ffffff" />
      )}
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.xButton} onPress={handleClose}>
        <X size={18} color="#ffffff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 9999,
  },
  message: {
    color: "#ffffff",
    fontFamily: "Inter_500Medium",
    marginLeft: 8,
    flex: 1,
  },
  xButton: {
    padding: 7,
  }
});
