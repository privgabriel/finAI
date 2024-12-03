import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true); // Estado de carregamento inicial

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const storedUserId = await AsyncStorage.getItem("userId");

                if (token && storedUserId) {
                    setIsAuthenticated(true);
                    setUserId(Number(storedUserId)); // Garante que userId é numérico
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                Alert.alert("Erro", "Erro ao recuperar estado de autenticação.");
                console.error("Erro ao recuperar estado de autenticação:", error);
            } finally {
                setLoading(false); // Finaliza o carregamento
            }
        };

        checkAuthentication();
    }, []);

    const login = async (token, id) => {
        try {
            if (!token || !id) throw new Error("Token ou ID do usuário inválidos.");
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("userId", id.toString());
            setIsAuthenticated(true);
            setUserId(id);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível realizar o login.");
            console.error("Erro ao salvar credenciais de login:", error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("userId");
            setIsAuthenticated(false);
            setUserId(null);
        } catch (error) {
            Alert.alert("Erro", "Erro ao realizar logout.");
            console.error("Erro ao remover credenciais de logout:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        ); // Exibe um loader enquanto verifica a autenticação
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, userId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212", // Fundo escuro enquanto carrega
    },
});
