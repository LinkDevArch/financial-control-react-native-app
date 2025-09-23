import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../../src/components/Header";
import { useState } from "react";
import AppButton from "../../../src/components/AppButton";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { ExpenseCreateDTO } from "../../../src/interfaces/types";
import { useExpenseActions } from "../../../src/hooks/useExpenseActions";
import { toLocalISOString } from "../../../src/utils";
import ActionMessage from "../../../src/components/ActionMessage";
import { AlertProvider, useAlert } from "../../../src/context/AlertContext";

import { useFinancialData } from "../../../src/hooks/useFinancialData";

import { Validator } from "../../../src/utils/validator";
import { Picker } from "@react-native-picker/picker";

function AddExpensePageInner() {
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

  const { addExpense, loading } = useExpenseActions();
  const { alert, showAlert, hideAlert } = useAlert();

  const { categories, refreshData } = useFinancialData({
    fetchCategories: true,
    categoriesPage: 0,
    categoriesSize: 10000, // Sin limite por ahora, si se necesita paginar, reducir.
    categoriesDirection: "asc",
    categoriesSortBy: "name",
  });

  function validate() {
    const validDescription = new Validator(description).notBlank().result();
    setShowDescriptionError(!validDescription);
    const validAmount = new Validator(Number(amount)).isValidAmount().result();
    setShowAmountError(!validAmount);
    const validCategoryName = new Validator(categoryName).notBlank().result();
    setShowCategoryNameError(!validCategoryName);

    return validDescription && validAmount && validCategoryName;
  }

  const handleSubmit = async () => {
    const expense: ExpenseCreateDTO = {
      description: description,
      amount: Number(amount),
      creationDate: toLocalISOString(creationDate),
      categoryName: categoryName,
    };

    if (!validate()) {
      showAlert("Campos invalidos, corrigelos e intenta de nuevo.", "error");
      return;
    }

    const result = await addExpense(expense);
    if (result.success) {
      setDescription("");
      setAmount("");
      setCreationDate(new Date());
      setCategoryName("");
      showAlert("Gasto añadido correctamente", "success");
    } else {
      if (typeof result.error === "string" && result.error === "RESOURCE-002") {
        showAlert("Categoria no encontrada", "error");
      }
      showAlert(result.error?.join("\n") ?? "Error inesperado", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior="height"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header title="Añadir Gasto" showBackButton={true} showConfig={false} />
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
              value={`${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}`}
              editable={false}
              pointerEvents="none"
              placeholder="Selecciona la fecha y hora"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={creationDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  // Actualiza solo la fecha, mantiene la hora
                  const newDate = new Date(date);
                  newDate.setHours(creationDate.getHours());
                  newDate.setMinutes(creationDate.getMinutes());
                  setCreationDate(newDate);
                  setShowTimePicker(true);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={creationDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, time) => {
                setShowTimePicker(false);
                if (time) {
                  // Actualiza solo la hora, mantiene la fecha
                  const newDate = new Date(creationDate);
                  newDate.setHours(time.getHours());
                  newDate.setMinutes(time.getMinutes());
                  setCreationDate(newDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={categoryName}
              onValueChange={(itemValue) => setCategoryName(itemValue)}
            >
              <Picker.Item label={!(categories?.content.length === 0) ? "Selecciona una categoría" : "No tienes categorias! Crea una!"} value="" />
              {categories?.content?.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
              ))}
            </Picker>
          </View>

          {showCategoryNameError && (
            <Text style={styles.validationError}>Categoria invalida</Text>
          )}
        </View>
        <AppButton title="Añadir" onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AddExpensePage() {
  return (
    <AlertProvider>
      <AddExpensePageInner />
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 25,
    backgroundColor: "#ffffff",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    paddingVertical: 14,
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
});
