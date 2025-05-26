const API_URL = 'http://localhost:3000/api';

const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            throw new Error(error.message || 'Произошла ошибка');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    throw new Error('Неверный формат ответа от сервера');
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const login = async (credentials) => {
    try {
        console.log('Отправка запроса на авторизацию:', {
            url: `${API_URL}/auth/login`,
            method: 'POST',
            credentials
        });

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        console.log('Получен ответ:', response.status);
        const data = await handleResponse(response);
        console.log('Данные ответа:', data);

        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    } catch (error) {
        console.error('Ошибка при входе:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
        });

        await handleResponse(response);
        localStorage.removeItem('token');
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Токен не найден');
        }

        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
        });

        return handleResponse(response);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        throw error;
    }
};