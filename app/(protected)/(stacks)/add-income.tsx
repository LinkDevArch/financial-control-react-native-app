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

import type { IncomeCreateDTO } from "../../../src/interfaces/types";
import { useIncomeActions } from "../../../src/hooks/useIncomeActions";
import { toLocalISOString } from "../../../src/utils";
import ActionMessage from "../../../src/components/ActionMessage";
import { AlertProvider, useAlert } from "../../../src/context/AlertContext";
import { Picker } from "@react-native-picker/picker";

import { useFinancialData } from "../../../src/hooks/useFinancialData";

import { Validator } from "../../../src/utils/validator";

import { ActivityIndicator } from "react-native";

function AddIncomePageInner() {
  const { alert, showAlert, hideAlert } = useAlert();

  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isSourceFocused, setIsSourceFocused] = useState(false);
  const [isAccountNameFocused, setIsAccountNameFocused] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [creationDate, setCreationDate] = useState(new Date());
  const [sourceName, setSourceName] = useState("");
  const [accountName, setAccountName] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showDescriptionError, setShowDescriptionError] = useState(false);
  const [showAmountError, setShowAmountError] = useState(false);
  const [showCreationDateError, setShowCreationDateError] = useState(false);
  const [showSourceNameError, setShowSourceNameError] = useState(false);
  const [showAccountNameError, setShowAccountNameError] = useState(false);

  const { addIncome } = useIncomeActions();

  const { incomeSources, accounts, loading, refreshData } = useFinancialData({
    fetchIncomeSources: true,
    incomeSourcePage: 0,
    incomeSourceSize: 10000, // Sin limite por ahora, si se necesita paginar, reducir.
    incomeSourceDirection: "asc",
    incomeSourceSortBy: "name",

    fetchAccounts: true,
    accountsPage: 0,
    accountsSize: 10000, // Sin limite por ahora, si se necesita paginar, reducir.
    accountsDirection: "asc",
    accountsSortBy: "name",
  });

  function validate() {
    const validDescription = new Validator(description).notBlank().result();
    setShowDescriptionError(!validDescription);
    const validAmount = new Validator(Number(amount)).isValidAmount().result();
    setShowAmountError(!validAmount);
    const validSourceName = new Validator(sourceName).notBlank().result();
    setShowSourceNameError(!validSourceName);
    const validAccountName = new Validator(accountName).notBlank().result();
    setShowAccountNameError(!validAccountName);

    return (
      validDescription && validAmount && validSourceName && validAccountName
    );
  }

  const handleSubmit = async () => {
    const income: IncomeCreateDTO = {
      description: description,
      amount: Number(amount),
      creationDate: toLocalISOString(creationDate),
      sourceName: sourceName,
      accountName: accountName,
    };

    if (!validate()) {
      showAlert("Campos invalidos, corrigelos e intenta de nuevo.", "error");
      return;
    }

    const result = await addIncome(income);
    if (result.success) {
      setDescription("");
      setAmount("");
      setCreationDate(new Date());
      setSourceName("");
      setAccountName("");
      showAlert("Ingreso añadido correctamente", "success");
    } else {
      showAlert(result.error?.join("\n") ?? "Error inesperado", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior="height"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header title="Añadir Ingreso" showBackButton={true} showConfig={false} />
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
          <Text style={styles.label}>Fuente de ingreso</Text>
          <View style={styles.picker}>
            {loading || !incomeSources ? (
              <ActivityIndicator
                size="small"
                color="#000"
                style={{ margin: 10 }}
              />
            ) : (
            <Picker
              selectedValue={sourceName}
              onValueChange={(itemValue) => setSourceName(itemValue)}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              {incomeSources?.content?.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
              ))}
            </Picker> 
          )}
          </View>
          {showSourceNameError && (
            <Text style={styles.validationError}>
              Fuente de ingreso invalida
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tipo de cuenta</Text>
          <View style={styles.picker}>
            {loading || !accounts ? (
              <ActivityIndicator
                size="small"
                color="#000"
                style={{ margin: 10 }}
              />
            ) : (
              <Picker
                selectedValue={accountName}
                onValueChange={(itemValue) => setAccountName(itemValue)}
              >
                <Picker.Item label="Selecciona una cuenta" value="" />
                {accounts?.content?.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                ))}
              </Picker>
            )}
          </View>
          {showAccountNameError && (
            <Text style={styles.validationError}>Tipo de cuenta invalida</Text>
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
      <AddIncomePageInner />
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
