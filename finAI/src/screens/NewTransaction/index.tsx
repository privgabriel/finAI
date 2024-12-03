import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { userRegistersById, deleteTransaction } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

const HomeScreen = ({ navigation }) => {
    const { userId, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransactions = async () => {
        if (userId) {
            try {
                setRefreshing(true);
                const response = await userRegistersById(userId);
                setTransactions(response);
            } catch (error) {
                console.error("Erro ao buscar transações:", error);
                Alert.alert("Erro", "Não foi possível carregar as transações do usuário.");
            } finally {
                setRefreshing(false);
                setLoading(false);
            }
        }
    };

    const handleDelete = async (transacaoId) => {
        try {
            await deleteTransaction(transacaoId);
            Alert.alert("Sucesso", "Transação deletada com sucesso!");
            fetchTransactions(); // Atualiza a lista após deletar
        } catch (error) {
            console.error("Erro ao deletar transação:", error);
            Alert.alert("Erro", "Não foi possível deletar a transação.");
        }
    };

    useEffect(() => {
        fetchTransactions();

        const interval = setInterval(fetchTransactions, 5000);
        return () => clearInterval(interval);
    }, [userId]);

    const handleEdit = (item) => {
        navigation.navigate("EditTransaction", { transaction: item });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Bem-vindo à Home!</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#1E88E5" />
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.transacao_id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleEdit(item)}>
                            <View style={styles.transactionCard}>
                                <Text style={styles.transactionCardTitle}>{item.tipo_transacao}</Text>
                                <Text style={styles.transactionCardText}>Categoria: {item.categoria}</Text>
                                <Text style={styles.transactionCardText}>Valor: R$ {item.valor}</Text>
                                <Text style={styles.transactionCardText}>Data: {item.data_transacao}</Text>
                                <Text style={styles.transactionCardText}>Descrição: {item.descricao}</Text>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item.transacao_id)}
                                >
                                    <Text style={styles.deleteButtonText}>Deletar</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshing={refreshing}
                    onRefresh={fetchTransactions}
                    contentContainerStyle={styles.flatListContainer}
                />
            )}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                    logout();
                    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                }}
            >
                <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 16,
    },
    welcomeText: {
        color: "#ffffff",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    transactionCard: {
        backgroundColor: "#1E1E1E",
        padding: 16,
        marginVertical: 10,
        borderRadius: 10,
    },
    transactionCardTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    transactionCardText: {
        color: "#B0BEC5",
        fontSize: 16,
        marginBottom: 4,
    },
    deleteButton: {
        marginTop: 10,
        backgroundColor: "#D32F2F",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "bold",
    },
    logoutButton: {
        marginTop: 20,
        backgroundColor: "#D32F2F",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 10,
    },
    logoutText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
    },
    flatListContainer: {
        paddingBottom: 10,
    },
});

export default HomeScreen;
