import { useNavigate, useLocation } from '@solidjs/router';
import { useAuth } from '../../auth/AuthProvider';
import styles from '../../pages/StudentDashboardPage.module.css';
import { apiClient } from '../../api/client';

export function StudentNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await apiClient.post('/auth/logout');
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    return (
        <nav class={styles['student-nav']}>
            <div class={styles['nav-buttons']}>
                <button
                    class={`${styles['nav-button']} ${location.pathname === '/student/dashboard' ? styles.active : ''}`}
                    onClick={() => navigate('/student/dashboard')}
                >
                    Расписание
                </button>
                <button
                    class={`${styles['nav-button']} ${location.pathname === '/student/homework' ? styles.active : ''}`}
                    onClick={() => navigate('/student/homework')}
                >
                    Домашние задания
                </button>
                <button
                    class={`${styles['nav-button']} ${location.pathname === '/student/grades' ? styles.active : ''}`}
                    onClick={() => navigate('/student/grades')}
                >
                    Оценки
                </button>
            </div>
            <button class={styles['logout-button']} onClick={handleLogout}>
                Выйти
            </button>
        </nav>
    );
} 