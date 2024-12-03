import axios from 'axios';

const API_BASE_URL = "http://34.39.145.249:8080"; // URL do seu backend

export const getAISuggestions = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fin-ai/${userId}`);
    console.log('Sugestões da IA:', response.data);  // Verifique se as sugestões estão corretas
    return response.data; // Retorna as sugestões da IA
  } catch (error) {
    console.error('Erro ao obter sugestões da IA:', error);
    throw new Error('Não foi possível obter sugestões da IA. Tente novamente mais tarde.');
  }
};
