import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/userService";

const SignUp = ({ navigation }) => {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const { login } = useAuth();

    const handleRegister = async () => {
        try {
            await registerUser({ nome, email, senha }, login);
            Alert.alert("Sucesso", "Registro realizado com sucesso!");
            navigation.navigate("Login"); // Redireciona para a tela de Login
        } catch (error) {
            Alert.alert("Erro", "Não foi possível registrar o usuário.");
            console.error("Erro ao registrar:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registrar</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
            />
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
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Registrar</Text>
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
});

export default SignUp;
