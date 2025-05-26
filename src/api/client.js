const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response, endpoint) => {
    console.log(`Получен ответ от ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ошибка при запросе к ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    try {
        const data = await response.json();
        console.log(`Успешный ответ от ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`Ошибка при разборе JSON от ${endpoint}:`, error);
        throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
};

export const apiClient = {
    async get(endpoint) {
        try {
            console.log(`Отправка GET запроса к ${endpoint}`, {
                url: `${API_BASE_URL}${endpoint}`,
                headers: getAuthHeaders()
            });

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include'
            });

            return handleResponse(response, endpoint);
        } catch (error) {
            console.error(`Ошибка при выполнении GET запроса к ${endpoint}:`, error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            console.log(`Отправка POST запроса к ${endpoint}:`, {
                url: `${API_BASE_URL}${endpoint}`,
                headers: getAuthHeaders(),
                data
            });

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(data),
            });

            return handleResponse(response, endpoint);
        } catch (error) {
            console.error(`Ошибка при выполнении POST запроса к ${endpoint}:`, error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            console.log(`Отправка PUT запроса к ${endpoint}:`, {
                url: `${API_BASE_URL}${endpoint}`,
                headers: getAuthHeaders(),
                data
            });

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(data),
            });

            return handleResponse(response, endpoint);
        } catch (error) {
            console.error(`Ошибка при выполнении PUT запроса к ${endpoint}:`, error);
            throw error;
        }
    }
}; 