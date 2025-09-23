import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { onLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Error", "Rellena todos los campos");
    }
    const res = await onLogin(email, password);
    if (res.error) {
      return Alert.alert("Error", res.message!);
    }
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1}}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
  link: { marginTop: 10, textAlign: "center", color: "#1565C0" },
});
