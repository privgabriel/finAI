import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { getAISuggestions } from "../../services/aiService"; // Certifique-se de que o serviço está correto
import { userRegistersById, createTransaction, deleteTransaction as deleteTransactionService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

const HomeScreen = ({ navigation }) => {
  const { userId, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [aiSuggestions, setAISuggestions] = useState([]); // Sugestões da IA

  const fetchTransactions = async () => {
    if (userId) {
      try {
        setRefreshing(true);
        const response = await userRegistersById(userId);
        setTransactions(response);

        const calculatedBalance = response.reduce((acc, t) => {
          if (t.tipo_transacao.toLowerCase() === "receita") {
            return acc + parseFloat(t.valor);
          } else if (t.tipo_transacao.toLowerCase() === "despesa") {
            return acc - parseFloat(t.valor);
          }
          return acc;
        }, 0);

        setCurrentBalance(calculatedBalance);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
        Alert.alert("Erro", "Não foi possível carregar as transações do usuário.");
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    }
  };

  const deleteTransaction = async () => {
    try {
      await deleteTransactionService(selectedTransaction.transacao_id);
      Alert.alert("Sucesso", "Transação deletada com sucesso!");
      fetchTransactions();
      fetchAISuggestions(); // Atualiza sugestões
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      Alert.alert("Erro", "Não foi possível deletar a transação.");
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const suggestions = await getAISuggestions(userId);
      setAISuggestions(suggestions);
    } catch (error) {
      console.error("Erro ao obter sugestões da IA:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAISuggestions();
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSaveTransaction = async () => {
    try {
      const transactionToSave = {
        usuario_id: userId,
        tipo_transacao: selectedTransaction.tipo_transacao.toLowerCase(),
        categoria: selectedTransaction.categoria,
        valor: parseFloat(selectedTransaction.valor),
        data_transacao: selectedTransaction.data_transacao,
        descricao: selectedTransaction.descricao,
      };

      await createTransaction(transactionToSave);
      Alert.alert("Sucesso", "Transação criada com sucesso!");
      fetchTransactions();
      fetchAISuggestions(); // Atualiza sugestões da IA após nova transação
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      Alert.alert("Erro", "Não foi possível adicionar a transação.");
    }
  };

  const renderAISuggestion = (suggestion, index) => (
    <TouchableOpacity key={index} style={styles.aiSuggestionCard}>
      <Text style={styles.aiSuggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.balanceText}>Saldo Atual: R$ {currentBalance.toFixed(2)}</Text>

      <Text style={styles.suggestionsTitle}>Sugestões da IA</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1E88E5" />
      ) : aiSuggestions.length > 0 ? (
        <ScrollView style={styles.aiSuggestionsContainer}>
          {aiSuggestions.map((suggestion, index) => renderAISuggestion(suggestion, index))}
        </ScrollView>
      ) : (
        <Text style={styles.noSuggestionsText}>Nenhuma sugestão no momento.</Text>
      )}

      <ScrollView>
        {transactions.map((item) => (
          <TouchableOpacity
            key={item.transacao_id}
            style={[
              styles.transactionCard,
              item.tipo_transacao.toLowerCase() === "despesa" && styles.transactionCardExpense,
            ]}
            onPress={() => {
              setIsAdding(false);
              setSelectedTransaction(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.transactionCardTitle}>{item.tipo_transacao}</Text>
            <Text style={styles.transactionCardText}>Categoria: {item.categoria}</Text>
            <Text style={styles.transactionCardText}>Valor: R$ {item.valor}</Text>
            <Text style={styles.transactionCardText}>Data: {item.data_transacao}</Text>
            <Text style={styles.transactionCardText}>Descrição: {item.descricao}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsAdding(true);
          setSelectedTransaction({
            tipo_transacao: "Receita",
            categoria: "",
            valor: "",
            data_transacao: new Date().toISOString().split("T")[0],
            descricao: "",
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Nova Transação</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isAdding ? "Adicionar Nova Transação" : "Deletar Transação"}
            </Text>
            <Picker
              selectedValue={selectedTransaction?.tipo_transacao}
              onValueChange={(value) =>
                setSelectedTransaction((prev) => ({ ...prev, tipo_transacao: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Receita" value="Receita" />
              <Picker.Item label="Despesa" value="Despesa" />
            </Picker>
            {isAdding && (
              <>
                <TextInput
                  style={styles.input}
                  value={selectedTransaction?.categoria}
                  onChangeText={(text) =>
                    setSelectedTransaction((prev) => ({ ...prev, categoria: text }))
                  }
                  placeholder="Categoria"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.input}
                  value={selectedTransaction?.valor?.toString()}
                  onChangeText={(text) =>
                    setSelectedTransaction((prev) => ({
                      ...prev,
                      valor: text === "" ? "" : parseFloat(text),
                    }))
                  }
                  placeholder="Valor"
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    Data: {selectedTransaction?.data_transacao}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(selectedTransaction?.data_transacao)}
                    mode="date"
                    display="default"
                    onChange={(_, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setSelectedTransaction((prev) => ({
                          ...prev,
                          data_transacao: selectedDate.toISOString().split("T")[0],
                        }));
                      }
                    }}
                  />
                )}
                <TextInput
                  style={styles.input}
                  value={selectedTransaction?.descricao}
                  onChangeText={(text) =>
                    setSelectedTransaction((prev) => ({ ...prev, descricao: text }))
                  }
                  placeholder="Descrição"
                  placeholderTextColor="#888"
                />
              </>
            )}
            <View style={styles.buttonGroup}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              {isAdding ? (
                <Button title="Salvar" onPress={handleSaveTransaction} />
              ) : (
                <Button title="Deletar" color="red" onPress={deleteTransaction} />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Contêiner principal
  container: {
    flex: 1,
    backgroundColor: "#181A20", // Fundo escuro
    padding: 20,
  },

  // Texto do saldo
  balanceText: {
    color: "#FFD700", // Cor dourada para o saldo
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20, // Espaçamento entre saldo e título de sugestões
  },

  // Título das sugestões da IA
  suggestionsTitle: {
    color: "#FFFFFF", // Cor branca para o título das sugestões
    fontSize: 20,
    fontWeight: "600", // Peso de fonte semibold
    textAlign: "center",
    marginBottom: 10, // Espaço abaixo do título
  },

  // Contêiner das sugestões da IA
  aiSuggestionsContainer: {
    marginBottom: 20, // Espaçamento abaixo das sugestões
  },

  // Cartão das sugestões
  aiSuggestionCard: {
    backgroundColor: "#242A32", // Fundo escuro para sugestões
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    elevation: 3, // Sombra suave
    marginBottom: 10, // Espaço entre os cartões
  },

  aiSuggestionText: {
    color: "#FFFFFF", // Texto branco nas sugestões
    fontSize: 16,
    textAlign: "center", // Texto centralizado
  },

  // Texto para quando não houver sugestões
  noSuggestionsText: {
    color: "#B0BEC5", // Cor para texto sem sugestões
    fontSize: 16,
    textAlign: "center",
  },

  // Cartões de transações
  transactionCard: {
    backgroundColor: "#242A32", // Fundo escuro para transações
    padding: 20,
    marginVertical: 12,
    borderRadius: 12, // Bordas arredondadas
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6, // Elevação para dar efeito de sombra
    borderLeftWidth: 5,
    borderLeftColor: "#3CBA92", // Cor verde para receitas
  },

  // Cartão de transação do tipo 'Despesa'
  transactionCardExpense: {
    borderLeftColor: "#F45B69", // Cor vermelha para despesas
  },

  // Título da transação
  transactionCardTitle: {
    color: "#FFFFFF", // Cor do título
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8, // Espaçamento entre título e descrição
  },

  // Texto das informações da transação
  transactionCardText: {
    color: "#B0BEC5", // Texto em cinza claro
    fontSize: 16,
    marginBottom: 4,
  },

  // Botão de adicionar nova transação
  addButton: {
    backgroundColor: "#4CAF50", // Cor verde para o botão de adicionar
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30, // Espaço entre transações e botão
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },

  addButtonText: {
    color: "#FFFFFF", // Texto branco para o botão
    fontSize: 18,
    fontWeight: "bold",
  },

  // Botão de logout
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#F45B69", // Vermelho para o botão de logout
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#F45B69",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },

  logoutText: {
    color: "#FFFFFF", // Texto branco no botão de logout
    fontSize: 18,
    fontWeight: "bold",
  },

  // Modal de edição ou deleção de transação
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fundo escuro com transparência
  },

  modalContent: {
    backgroundColor: "#242A32", // Fundo escuro para o modal
    padding: 20,
    borderRadius: 15,
    width: "90%", // Modal ocupa 90% da largura
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },

  modalTitle: {
    color: "#FFFFFF", // Texto branco para o título do modal
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  // Estilos para inputs no modal
  input: {
    backgroundColor: "#2E3540", // Fundo escuro para inputs
    color: "#FFFFFF", // Texto branco nos inputs
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12, // Espaçamento entre os campos
  },

  picker: {
    backgroundColor: "#2E3540", // Fundo escuro para o picker
    color: "#FFFFFF", // Texto branco no picker
    marginBottom: 20, // Espaço abaixo do picker
    borderRadius: 8,
  },

  // Botões do modal
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  // Botão de seletor de data
  datePickerButton: {
    backgroundColor: "#3CBA92", // Cor verde para o botão de data
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  datePickerText: {
    color: "#FFFFFF", // Texto branco para o botão de data
    fontSize: 16,
  },
});

export default HomeScreen;