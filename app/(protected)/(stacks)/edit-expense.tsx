import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Header from "../../../src/components/Header";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import AppButton from "../../../src/components/AppButton";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { ExpenseCreateDTO } from "../../../src/interfaces/types";
import { updateExpense } from "../../../src/hooks/sendFinancialData";
import { toLocalISOString } from "../../../src/utils";
import ActionMessage from "../../../src/components/ActionMessage";
import { AlertProvider, useAlert } from "../../../src/context/AlertContext";

import { useFinancialData } from "../../../src/hooks/useFinancialData";

import { Validator } from "../../../src/utils/validator";
import { Picker } from "@react-native-picker/picker";

function EditExpensePageInner() {
  const params = useLocalSearchParams();
  const { alert, showAlert, hideAlert } = useAlert();
  
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isCategoryFocused, setIsCategoryFocused] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [creationDate, setCreationDate] = useState(new Date());
  const [categoryName, setCategoryName] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showDescriptionError, setShowDescriptionError] = useState(false);
  const [showAmountError, setShowAmountError] = useState(false);
  const [showCreationDateError, setShowCreationDateError] = useState(false);
  const [showCategoryNameError, setShowCategoryNameError] = useState(false);

  const { categories, loading, refreshData } = useFinancialData({
    fetchCategories: true,
    categoriesPage: 0,
    categoriesSize: 10000, // Sin limite por ahora, si se necesita paginar, reducir.
    categoriesDirection: "asc",
    categoriesSortBy: "name",
  });

  // Cargar datos del gasto desde los parámetros solo una vez
  useEffect(() => {
    // Limpiar alertas al cargar la página
    hideAlert();
    
    if (params.description) setDescription(params.description as string);
    if (params.amount) setAmount(params.amount as string);
    if (params.categoryName) setCategoryName(params.categoryName as string);
    if (params.date) {
      try {
        setCreationDate(new Date(params.date as string));
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
  }, []); // Dependency array vacío para ejecutar solo una vez

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCreationDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(creationDate);
      updatedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setCreationDate(updatedDate);
    }
  };

  function validate() {
    const validDescription = new Validator(description).notBlank().result();
    setShowDescriptionError(!validDescription);
    const validAmount = new Validator(Number(amount)).isValidAmount().result();
    setShowAmountError(!validAmount);
    const validCategoryName = new Validator(categoryName).notBlank().result();
    setShowCategoryNameError(!validCategoryName);

    return (
      validDescription && validAmount && validCategoryName
    );
  }

  const handleSubmit = async () => {
    if (!params.expenseId) {
      showAlert("Error: ID de gasto no encontrado", "error");
      return;
    }

    if (!validate()) {
      showAlert("Campos invalidos, corrigelos e intenta de nuevo.", "error");
      return;
    }

    const expense: ExpenseCreateDTO = {
      description,
      amount: Number(amount),
      creationDate: toLocalISOString(creationDate),
      categoryName,
    };

    try {
      const result = await updateExpense(parseInt(params.expenseId as string), expense);
      
      if (result.success) {
        showAlert("Gasto actualizado correctamente", "success");
      } else {
        if (typeof result.error === "string" && result.error === "RESOURCE-002") {
          showAlert("Categoría no encontrada", "error");
        } else {
          showAlert(result.error?.join("\n") ?? "Error inesperado", "error");
        }
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      showAlert("Error al actualizar el gasto", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior="height"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header title="Editar Gasto" showBackButton={true} showConfig={false} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {alert.visible && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <ActionMessage
              message={alert.message}
              type={alert.type === "info" ? "success" : alert.type}
              onClose={hideAlert}
            />
          </View>
        )}

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, isDescriptionFocused && styles.inputFocused]}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setIsDescriptionFocused(true)}
            onBlur={() => setIsDescriptionFocused(false)}
            placeholder="Describe tu gasto"
            autoCapitalize="none"
            autoFocus={true}
          />
          {showDescriptionError && (
            <Text style={styles.validationError}>
              La descripcion debe ser valida
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={[styles.input, isAmountFocused && styles.inputFocused]}
            value={amount}
            onChangeText={setAmount}
            onFocus={() => setIsAmountFocused(true)}
            onBlur={() => setIsAmountFocused(false)}
            placeholder="Ingresa el monto"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          {showAmountError && (
            <Text style={styles.validationError}>
              El monto debe ser mayor a 0
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={[styles.input, isDateFocused && styles.inputFocused]}
              value={creationDate.toLocaleDateString()}
              onFocus={() => setIsDateFocused(true)}
              onBlur={() => setIsDateFocused(false)}
              placeholder="Selecciona la fecha"
              editable={false}
            />
          </TouchableOpacity>
          {showCreationDateError && (
            <Text style={styles.validationError}>
              La fecha debe ser valida
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryName}
              onValueChange={(itemValue) => setCategoryName(itemValue)}
              style={[styles.picker, isCategoryFocused && styles.inputFocused]}
              onFocus={() => setIsCategoryFocused(true)}
              onBlur={() => setIsCategoryFocused(false)}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              {categories?.content?.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.name}
                />
              ))}
            </Picker>
          </View>
          {showCategoryNameError && (
            <Text style={styles.validationError}>
              La categoría debe ser valida
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <AppButton
            title="Actualizar Gasto"
            onPress={handleSubmit}
            bgColor="#1d1d1dff"
            pressedColor="#000000ff"
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={creationDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={creationDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1d1d1dff" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function EditExpensePage() {
  return (
    <AlertProvider>
      <EditExpensePageInner />
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#222",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
    fontFamily: "Inter_400Regular",
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: "#000000ff",
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  bottomInput: {
    marginBottom: 70,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  validationError: {
    marginTop: 5,
    fontFamily: "Inter_500Medium",
    color: "#f44336",
  },
  picker: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 16,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
