import { Tabs, Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { enableScreens } from "react-native-screens";
import { View } from "react-native";
import Navbar from "../../src/components/Navbar";

export default function ProtectedLayout() {
  const { authState } = useAuth();
  enableScreens(false);

  if (!authState.authenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tabs principales */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Grupo de stacks organizados */}
        <Stack.Screen 
          name="(stacks)" 
          options={{ 
            headerShown: false,
            presentation: "transparentModal",
          }} 
        />
      </Stack>
    </View>
  );
}
