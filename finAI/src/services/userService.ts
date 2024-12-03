import { api } from "./api"; // Certifique-se de que você tenha um arquivo api.js que configura a instância do Axios
import { Alert } from "react-native";

// Função para registrar um novo usuário
export const registerUser = async (userData, login) => {
    try {
        const response = await api.post('/register', userData); // Certifique-se de que esta rota está correta
        const { token, usuario_id } = response.data;

        // Após o registro, faz login automaticamente
        login(token, usuario_id); 

        Alert.alert("Sucesso", "Registro realizado com sucesso!");
        return response.data; // Retorna os dados do usuário, se necessário
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        Alert.alert("Erro", "Não foi possível registrar o usuário.");
        throw error; // Lança o erro para logs ou tratamento adicional
    }
};

export const loginUser = async (credentials, login) => {
    try {
        const response = await api.post('/login_user', {
            email: credentials.email,
            senha: credentials.senha,
        });

        // Verifica se a resposta contém os dados esperados
        const { token, usuario_id } = response.data;

        if (token && usuario_id) {
            await login(token, usuario_id); // Realiza login e armazena os dados no contexto
            Alert.alert("Sucesso", "Login realizado com sucesso!");
        } else {
            throw new Error("Dados de autenticação ausentes na resposta do servidor.");
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);

        // Trata erros de autenticação
        if (error.response && error.response.status === 401) {
            Alert.alert("Erro", "Email ou senha inválidos.");
        } else {
            Alert.alert("Erro", "Erro ao fazer login. Verifique sua conexão ou tente novamente mais tarde.");
        }

        throw error; // Lança o erro para logs ou tratamento adicional
    }
};

export const userRegistersById = async (userId) => {
    try {
        console.log(`Fetching data for user ID: ${userId}`);
        const response = await api.get(`/transacoes/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar transações do usuário:", error);

        if (error.response) {
            if (error.response.status === 404) {
                Alert.alert("Erro", "Transações não encontradas para este usuário.");
            } else {
                Alert.alert("Erro", "Erro ao buscar transações. Tente novamente.");
            }
        } else {
            Alert.alert("Erro", "Erro de rede. Verifique sua conexão.");
        }

        throw error;
    }
};

export const createTransaction = async (transactionData) => {
    try {
        const response = await api.post("/transacoes", transactionData);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar transação:", error);
        throw error;
    }
};

export const deleteTransaction = async (transactionId) => {
    try {
        const response = await api.delete(`/transacoes/${transactionId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao deletar transação:", error);
        throw error;
    }
};

export const updateTransaction = async (transactionId, transactionData) => {
    try {
        const response = await api.put(`/transacoes/${transactionId}`, transactionData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar transação:", error);
        throw error;
    }
};






