import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { deleteTransaction } from "../../services/userService";

const TransactionDetailsScreen = ({ route, navigation }) => {
    const { transaction, onTransactionDeleted } = route.params; // Recebe a transação e a função de atualização

    const handleDeleteTransaction = async () => {
        try {
            await deleteTransaction(transaction.transacao_id);
            Alert.alert("Sucesso", "Transação deletada com sucesso!");
            if (onTransactionDeleted) {
                onTransactionDeleted(); // Chama a função para atualizar a lista de transações
            }
            navigation.goBack(); // Volta para a tela anterior após a exclusão
        } catch (error) {
            console.error("Erro ao deletar transação:", error);
            Alert.alert("Erro", "Não foi possível deletar a transação.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Detalhes da Transação</Text>

            <View style={styles.detailCard}>
                <Text style={styles.label}>Tipo de Transação:</Text>
                <Text style={styles.value}>{transaction.tipo_transacao}</Text>

                <Text style={styles.label}>Categoria:</Text>
                <Text style={styles.value}>{transaction.categoria}</Text>

                <Text style={styles.label}>Valor:</Text>
                <Text style={styles.value}>R$ {transaction.valor}</Text>

                <Text style={styles.label}>Data:</Text>
                <Text style={styles.value}>{transaction.data_transacao}</Text>

                <Text style={styles.label}>Descrição:</Text>
                <Text style={styles.value}>{transaction.descricao}</Text>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTransaction}>
                <Text style={styles.deleteButtonText}>Deletar Transação</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#181A20", // Fundo elegante escuro
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#E0E0E0", // Texto claro para contraste
        textAlign: "center",
        marginBottom: 20,
    },
    detailCard: {
        backgroundColor: "#242A32", // Fundo suave para o card
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    label: {
        color: "#B0BEC5",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    value: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 12,
    },
    deleteButton: {
        backgroundColor: "#F45B69",
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#F45B69",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    deleteButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    cancelButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    cancelButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default TransactionDetailsScreen;
