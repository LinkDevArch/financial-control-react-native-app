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

import type { IncomeCreateDTO } from "../../../src/interfaces/types";
import { updateIncome } from "../../../src/hooks/sendFinancialData";
import { toLocalISOString } from "../../../src/utils";
import ActionMessage from "../../../src/components/ActionMessage";
import { AlertProvider, useAlert } from "../../../src/context/AlertContext";
import { Picker } from "@react-native-picker/picker";

import { useFinancialData } from "../../../src/hooks/useFinancialData";

import { Validator } from "../../../src/utils/validator";

function EditIncomePageInner() {
  const params = useLocalSearchParams();
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

  const { incomeSources, accounts, loading, refreshData } = useFinancialData({
    fetchIncomeSources: true,
    incomeSourcePage: 0,
    incomeSourceSize: 10000,
    incomeSourceDirection: "asc",
    incomeSourceSortBy: "name",

    fetchAccounts: true,
    accountsPage: 0,
    accountsSize: 10000,
    accountsDirection: "asc",
    accountsSortBy: "name",
  });

  // Cargar datos del ingreso desde los parámetros solo una vez
  useEffect(() => {
    // Limpiar alertas al cargar la página
    hideAlert();
    
    if (params.description) setDescription(params.description as string);
    if (params.amount) setAmount(params.amount as string);
    if (params.sourceName) setSourceName(params.sourceName as string);
    if (params.accountName) setAccountName(params.accountName as string);
    if (params.date) {
      try {
        setCreationDate(new Date(params.date as string));
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
  }, []); // Dependency array vacío para ejecutar solo una vez

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
    if (!params.incomeId) {
      showAlert("Error: ID de ingreso no encontrado", "error");
      return;
    }

    if (!validate()) {
      showAlert("Campos invalidos, corrigelos e intenta de nuevo.", "error");
      return;
    }

    const income: IncomeCreateDTO = {
      description: description,
      amount: Number(amount),
      creationDate: toLocalISOString(creationDate),
      sourceName: sourceName,
      accountName: accountName,
    };

    try {
      const result = await updateIncome(parseInt(params.incomeId as string), income);
      
      if (result.success) {
        showAlert("Ingreso actualizado correctamente", "success");
      } else {
        showAlert(result.error?.join("\n") ?? "Error inesperado", "error");
      }
    } catch (error) {
      console.error('Error updating income:', error);
      showAlert("Error al actualizar el ingreso", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior="height"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header title="Editar Ingreso" showBackButton={true} showConfig={false} />
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
            placeholder="Describe tu ingreso"
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
          <Text style={styles.label}>Fuente de ingreso</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sourceName}
              onValueChange={(itemValue) => setSourceName(itemValue)}
              style={[styles.picker, isSourceFocused && styles.inputFocused]}
              onFocus={() => setIsSourceFocused(true)}
              onBlur={() => setIsSourceFocused(false)}
            >
              <Picker.Item label="Selecciona una fuente" value="" />
              {incomeSources?.content?.map((source) => (
                <Picker.Item
                  key={source.id}
                  label={source.name}
                  value={source.name}
                />
              ))}
            </Picker>
          </View>
          {showSourceNameError && (
            <Text style={styles.validationError}>
              La fuente de ingreso debe ser valida
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Cuenta</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={accountName}
              onValueChange={(itemValue) => setAccountName(itemValue)}
              style={[styles.picker, isAccountNameFocused && styles.inputFocused]}
              onFocus={() => setIsAccountNameFocused(true)}
              onBlur={() => setIsAccountNameFocused(false)}
            >
              <Picker.Item label="Selecciona una cuenta" value="" />
              {accounts?.content?.map((account) => (
                <Picker.Item
                  key={account.id}
                  label={account.name}
                  value={account.name}
                />
              ))}
            </Picker>
          </View>
          {showAccountNameError && (
            <Text style={styles.validationError}>
              La cuenta debe ser valida
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <AppButton
            title="Actualizar Ingreso"
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
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setCreationDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={creationDate}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                const updatedDate = new Date(creationDate);
                updatedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                setCreationDate(updatedDate);
              }
            }}
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

export default function EditIncomePage() {
  return (
    <AlertProvider>
      <EditIncomePageInner />
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
