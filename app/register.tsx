import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = () => {
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    router.push({
      pathname: "/profile",
      params: { message: "Successfully registered and logged in" },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Register</Text>

        {/* Email Input với Label */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email address"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input với Label */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Confirm Password Input với Label */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="Enter your password again"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  form: {
    width: "100%",
    maxWidth: 360,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#6A0DAD", // Màu tím cho tiêu đề
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#6A0DAD", // Màu tím cho label
  },
  input: {
    borderWidth: 2,
    borderColor: "#6A0DAD", // Viền màu tím
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#000", // Chữ trong input màu đen
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#170547", // Nút màu tím
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#6A0DAD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
});