import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../../auth/AuthProvider';
import styles from './LoginForm.module.css';

export function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = createSignal(null);
    const [loading, setLoading] = createSignal(false);
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email(), password());
            navigate('/student/dashboard');
        } catch (error) {
            console.error('LoginForm: Ошибка при отправке формы:', error);
            setError('Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} class={styles.form}>
            <h2>Вход в систему</h2>
            
            {error() && (
                <div class={styles.error}>
                    {error()}
                </div>
            )}

            <div class={styles.formGroup}>
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email()}
                    onInput={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Введите ваш email"
                    class={styles.input}
                />
            </div>

            <div class={styles.formGroup}>
                <label for="password">Пароль</label>
                <input
                    type="password"
                    id="password"
                    value={password()}
                    onInput={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Введите ваш пароль"
                    class={styles.input}
                />
            </div>

            <button 
                type="submit" 
                class={styles.submitButton}
                disabled={loading()}
            >
                {loading() ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
} 