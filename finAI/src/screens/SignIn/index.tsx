import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/userService";

const LoginScreen = ({ navigation }) => { // Recebe navigation corretamente
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            await loginUser({ email, senha }, login);
            Alert.alert("Sucesso", "Login realizado com sucesso!");
            navigation.navigate("Home"); // Redireciona para a tela Home
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            Alert.alert("Erro", "Email ou senha inválidos.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#888"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate("Register")} // Navega para Register
            >
                <Text style={styles.registerText}>Não tem uma conta? Registre-se</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212", // Fundo escuro para modo dark
        padding: 16,
    },
    title: {
        fontSize: 28,
        color: "#ffffff", // Texto branco para contraste
        marginBottom: 20,
        fontWeight: "bold",
    },
    input: {
        height: 50,
        backgroundColor: "#1F1F1F", // Fundo do input no modo dark
        color: "#ffffff", // Texto branco no input
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        width: "90%",
    },
    button: {
        backgroundColor: "#1E88E5", // Azul escuro para destacar o botão
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: "center",
        width: "90%",
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    registerButton: {
        marginTop: 12,
    },
    registerText: {
        color: "#1E88E5", // Azul para destacar o texto de registro
        fontSize: 14,
    },
});

export default LoginScreen;
