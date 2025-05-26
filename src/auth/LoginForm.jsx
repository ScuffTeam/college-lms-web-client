import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthProvider';

export function LoginForm() {
    const [credentials, setCredentials] = createSignal({
        email: '',
        password: '',
    });
    const [error, setError] = createSignal('');
    const [loading, setLoading] = createSignal(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Отправка формы с данными:', credentials());
            const data = await login(credentials());
            console.log('Успешная авторизация:', data);

            if (data.user.role === 'teacher') {
                navigate('/teacher');
            } else if (data.user.role === 'student') {
                navigate('/student');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Ошибка при отправке формы:', err);
            setError(err.message || 'Ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} class="login-form">
            <h2>Вход в систему</h2>

            {error() && <div class="error">{error()}</div>}

            <div class="form-group">
                <label for="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials().email}
                    onInput={handleChange}
                    required
                />
            </div>

            <div class="form-group">
                <label for="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials().password}
                    onInput={handleChange}
                    required
                />
            </div>

            <button type="submit" disabled={loading()}>
                {loading() ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
}