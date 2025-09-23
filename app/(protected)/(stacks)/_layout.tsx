import { Stack } from "expo-router";

export default function StacksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Modales específicos de la sección protegida */}
      <Stack.Screen 
        name="add-expense" 
        options={{ 
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-income" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-goal" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-debt" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="view-more-expenses" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="view-more-incomes" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-expense" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-income" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-goal" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="debt-details" 
        options={{ 
          presentation: "fullScreenModal", 
          animation: "slide_from_right",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-debt" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      
      {/* Gestión de categorías */}
      <Stack.Screen 
        name="categories" 
        options={{ 
          presentation: "fullScreenModal", 
          animation: "slide_from_right",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-category" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-category" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      
      {/* Gestión de fuentes de ingreso */}
      <Stack.Screen 
        name="income-sources" 
        options={{ 
          presentation: "fullScreenModal", 
          animation: "slide_from_right",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-income-source" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-income-source" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      
      {/* Gestión de cuentas */}
      <Stack.Screen 
        name="accounts" 
        options={{ 
          presentation: "fullScreenModal", 
          animation: "slide_from_right",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-account" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="edit-account" 
        options={{ 
          presentation: "modal", 
          animation: "slide_from_bottom",
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
