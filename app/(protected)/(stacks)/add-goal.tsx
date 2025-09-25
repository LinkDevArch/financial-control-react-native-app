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

import type { GoalCreateDTO } from "../../../src/interfaces/types";
import { useGoalActions } from "../../../src/hooks/useGoalActions";
import { toLocalISOString } from "../../../src/utils";
import ActionMessage from "../../../src/components/ActionMessage";
import { AlertProvider, useAlert } from "../../../src/context/AlertContext";

import { Validator } from "../../../src/utils/validator";

import { ActivityIndicator } from "react-native";

function AddGoalPageInner() {
  const { alert, showAlert, hideAlert } = useAlert();

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isTargetAmountFocused, setIsTargetAmountFocused] = useState(false);
  const [isStartDateFocused, setIsStartDateFocused] = useState(false);
  const [isTargetDateFocused, setIsTargetDateFocused] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date());

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);

  const [showNameError, setShowNameError] = useState(false);
  const [showDescriptionError, setShowDescriptionError] = useState(false);
  const [showTargetAmountError, setShowTargetAmountError] = useState(false);
  const [showStartDateError, setShowStartDateError] = useState(false);
  const [showTargetDateError, setShowTargetDateError] = useState(false);

  const { addGoal, loading } = useGoalActions();

  function validate() {
    const validName = new Validator(name).notBlank().result();
    setShowNameError(!validName);
    const validDescription = new Validator(description).notBlank().result();
    setShowDescriptionError(!validDescription);
    const validTargetAmount = new Validator(Number(targetAmount)).isValidAmount().result();
    setShowTargetAmountError(!validTargetAmount);
    
    // Validar que la fecha objetivo sea posterior a la fecha de inicio
    const validDateRange = (targetDate > startDate) && (targetDate > new Date());
    setShowTargetDateError(!validDateRange);

    return (
      validName && validDescription && validTargetAmount && validDateRange
    );
  }

  const handleSubmit = async () => {
    const goalData: GoalCreateDTO = {
      name: name,
      description: description,
      targetAmount: Number(targetAmount),
      currentAmount: 0, // Siempre inicia en 0
      startDate: toLocalISOString(startDate).split('T')[0], // Solo la fecha
      targetDate: toLocalISOString(targetDate).split('T')[0], // Solo la fecha
    };

    if (!validate()) {
      showAlert("Campos inválidos, corrígelos e intenta de nuevo.", "error");
      return;
    }

    const result = await addGoal(goalData);
    if (result.success) {
      setName("");
      setDescription("");
      setTargetAmount("");
      setStartDate(new Date());
      setTargetDate(new Date());
      showAlert("Meta añadida correctamente", "success");
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
      <Header title="Añadir Meta" showBackButton={true} showConfig={false} />
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
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, isNameFocused && styles.inputFocused]}
            value={name}
            onChangeText={setName}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            placeholder="Nombre de tu meta"
            autoCapitalize="words"
            autoFocus={true}
          />
          {showNameError && (
            <Text style={styles.validationError}>
              El nombre debe ser válido
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, isDescriptionFocused && styles.inputFocused]}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setIsDescriptionFocused(true)}
            onBlur={() => setIsDescriptionFocused(false)}
            placeholder="Describe tu meta"
            autoCapitalize="sentences"
            multiline={true}
            numberOfLines={3}
          />
          {showDescriptionError && (
            <Text style={styles.validationError}>
              La descripción debe ser válida
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Monto Objetivo</Text>
          <TextInput
            style={[styles.input, isTargetAmountFocused && styles.inputFocused]}
            value={targetAmount}
            onChangeText={setTargetAmount}
            onFocus={() => setIsTargetAmountFocused(true)}
            onBlur={() => setIsTargetAmountFocused(false)}
            placeholder="Ingresa el monto objetivo"
            autoCapitalize="none"
            keyboardType="numeric"
          />
          {showTargetAmountError && (
            <Text style={styles.validationError}>
              El monto debe ser mayor a 0
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Fecha de Inicio</Text>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
            <TextInput
              style={[styles.input, isStartDateFocused && styles.inputFocused]}
              value={startDate.toLocaleDateString()}
              editable={false}
              pointerEvents="none"
              placeholder="Selecciona la fecha de inicio"
            />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowStartDatePicker(false);
                if (date) {
                  setStartDate(date);
                }
              }}
            />
          )}
          {showStartDateError && (
            <Text style={styles.validationError}>
              Selecciona una fecha de inicio válida
            </Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Fecha Objetivo</Text>
          <TouchableOpacity onPress={() => setShowTargetDatePicker(true)}>
            <TextInput
              style={[styles.input, isTargetDateFocused && styles.inputFocused]}
              value={targetDate.toLocaleDateString()}
              editable={false}
              pointerEvents="none"
              placeholder="Selecciona la fecha objetivo"
            />
          </TouchableOpacity>
          {showTargetDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowTargetDatePicker(false);
                if (date) {
                  setTargetDate(date);
                }
              }}
            />
          )}
          {showTargetDateError && (
            <Text style={styles.validationError}>
              La fecha objetivo debe ser posterior a la fecha de inicio y futura al dia de hoy.
            </Text>
          )}
        </View>

        <View style={styles.bottomInput}>
          <AppButton
            title={loading ? "" : "Añadir Meta"}
            onPress={handleSubmit}
            icon={
              loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : undefined
            }
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AddGoalPage() {
  return (
    <AlertProvider>
      <AddGoalPageInner />
    </AlertProvider>
  );
}

export default AddGoalPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
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
});