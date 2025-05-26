import { createSignal } from 'solid-js';
import { useAuth } from './AuthProvider';
import { useNavigate } from '@solidjs/router';
import styles from './LoginForm.module.css';

export function LoginForm() {
    const [credentials, setCredentials] = createSignal({
        email: '',
        password: ''
    });
    const [error, setError] = createSignal(null);
    const [loading, setLoading] = createSignal(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const user = await login(credentials());
            if (user && user.role === 'teacher') {
                navigate('/teacher/dashboard');
            } else if (user && user.role === 'student') {
                navigate('/student/dashboard');
            } else {
                navigate('/'); 
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            setError(error.message || 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    };
    
    const quickLogin = async (email, password) => {
         setCredentials({ email, password });
         setTimeout(() => {
             const form = document.getElementById('login-form');
             if (form) {
                 form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
             }
         }, 0);
     };

    return (
        <div class={styles.loginContainer}>
            <form id="login-form" onSubmit={handleSubmit} class={styles.loginForm}>
                <h2>Вход</h2>
                <div class={styles.formGroup}>
                    <label for="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={credentials().email}
                        onInput={handleInput}
                        class={styles.input}
                        required
                        placeholder="Введите email"
                    />
                </div>
                <div class={styles.formGroup}>
                    <label for="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials().password}
                        onInput={handleInput}
                        class={styles.input}
                        required
                        placeholder="Введите пароль"
                    />
                </div>

                {error() && (
                    <div class={styles.errorMessage}>
                        {error()}
                    </div>
                )}

                <button type="submit" class={styles.submitButton} disabled={loading()}>
                    {loading() ? 'Загрузка...' : 'Войти'}
                </button>
            </form>

            <div class={styles.quickLoginButtons}>
                <button 
                    class={styles.quickLoginButton}
                    onClick={() => quickLogin('student@example.com', 'student123')}
                 >
                    Быстрый вход (Студент)
                </button>
                 <button 
                    class={styles.quickLoginButton}
                    onClick={() => quickLogin('teacher@example.com', 'password123')}
                 >
                    Быстрый вход (Преподаватель)
                </button>
            </div>
        </div>
    );
}