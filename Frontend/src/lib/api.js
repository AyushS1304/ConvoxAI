import axios from 'axios';
import { supabase } from './supabase';
// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Add request interceptor to include auth token
apiClient.interceptors.request.use(async (config) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    }
    catch (error) {
        console.error('Error getting session:', error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Add response interceptor to handle errors (no automatic redirect)
apiClient.interceptors.response.use((response) => response, async (error) => {
    // Log the error but don't redirect - let components handle their own errors
    if (error.response?.status === 401) {
        console.warn('API returned 401 - user may need to re-authenticate');
    }
    return Promise.reject(error);
});
/**
 * Health check endpoint
 */
export async function checkHealth() {
    try {
        const response = await apiClient.get('/');
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Test LLM model endpoint
 */
export async function testModel(request) {
    try {
        const response = await apiClient.post('/models', request);
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Summarize audio file endpoint
 */
export async function summarizeAudio(file) {
    try {
        const formData = new FormData();
        formData.append('audio_file', file);
        const response = await apiClient.post('/summarize', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Handle API errors and convert to user-friendly messages
 */
function handleApiError(error) {
    if (axios.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response) {
            // Server responded with error
            const errorData = axiosError.response.data;
            const message = errorData?.error || axiosError.message || 'An error occurred';
            return new Error(message);
        }
        else if (axiosError.request) {
            // Request made but no response
            return new Error('Unable to connect to the server. Please ensure the backend is running.');
        }
    }
    // Generic error
    return new Error('An unexpected error occurred');
}
/**
 * Save a chat conversation
 */
export async function saveConversation(title, messages) {
    try {
        const response = await apiClient.post('/chat/save', { title, messages });
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Add messages to an existing conversation
 */
export async function addMessagesToConversation(conversationId, messages) {
    try {
        await apiClient.post(`/chat/${conversationId}/messages`, { messages });
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Get conversation history
 */
export async function getConversationHistory(limit = 50) {
    try {
        const response = await apiClient.get('/chat/history', { params: { limit } });
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Get a specific conversation
 */
export async function getConversation(conversationId) {
    try {
        const response = await apiClient.get(`/chat/${conversationId}`);
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId) {
    try {
        await apiClient.delete(`/chat/${conversationId}`);
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Upload audio file to storage
 */
export async function uploadAudioFile(file) {
    try {
        const formData = new FormData();
        formData.append('audio_file', file);
        const response = await apiClient.post('/storage/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Get user's audio files
 */
export async function getUserAudioFiles() {
    try {
        const response = await apiClient.get('/storage/files');
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Get signed URL for audio file playback
 */
export async function getSignedAudioUrl(fileId) {
    try {
        const response = await apiClient.get(`/storage/file/${fileId}`);
        return response.data.url;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Delete audio file
 */
export async function deleteAudioFile(fileId) {
    try {
        await apiClient.delete(`/storage/file/${fileId}`);
    }
    catch (error) {
        throw handleApiError(error);
    }
}
export async function updateFileSummary(fileId, summaryData) {
    try {
        await apiClient.put(`/storage/file/${fileId}/summary`, summaryData);
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Query the AI chatbot with conversation context
 */
export async function queryChatbot(question, chatHistory, modelChoice = 'gemini', selectedCallId) {
    try {
        const response = await apiClient.post('/chat/query', {
            question,
            chat_history: chatHistory,
            model_choice: modelChoice,
            selected_call_id: selectedCallId,
        });
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
/**
 * Get transcript from audio file
 */
export async function getTranscript(file) {
    try {
        const formData = new FormData();
        formData.append('audio_file', file);
        const response = await apiClient.post('/transcript', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // The transcript endpoint returns the transcript text directly
        return response.data;
    }
    catch (error) {
        throw handleApiError(error);
    }
}
export { API_BASE_URL };
