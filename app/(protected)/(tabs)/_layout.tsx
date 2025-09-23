import { Tabs } from "expo-router";
import { View } from "react-native";
import Navbar from "../../../src/components/Navbar";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
        tabBar={() => <Navbar />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transacciones",
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Reportes",
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "Metas",
          }}
        />
        <Tabs.Screen
          name="debts"
          options={{
            title: "Deudas",
          }}
        />
      </Tabs>
    </View>
  );
}
