import { createContext, createSignal, useContext, onMount } from 'solid-js';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider(props) {
    const [user, setUser] = createSignal(null);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(null);

    const login = async (credentials) => {
        try {
            setError(null);
            const data = await apiLogin(credentials);
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            setUser(data.user);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await apiLogout();
            localStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const checkAuth = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const data = await getCurrentUser();
            setUser(data);
        } catch (error) {
            console.error('Ошибка при проверке авторизации:', error);
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    onMount(() => {
        checkAuth();
    });

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: () => !!user(),
        isTeacher: () => user()?.role === 'teacher',
        isStudent: () => user()?.role === 'student',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading() ? props.children : <div>Загрузка...</div>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}