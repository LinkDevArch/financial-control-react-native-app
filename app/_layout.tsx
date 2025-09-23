import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import {
  useFonts,
  Inter_700Bold,
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { View } from "react-native";

export default function RootLayout() {
  // Cargar fuentes UNA SOLA VEZ a nivel de aplicación
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </View>
    </AuthProvider>
  );
}
