import { useNavigate, useLocation } from '@solidjs/router';
import { useAuth } from '../../auth/AuthProvider';
import styles from '../../pages/TeacherDashboardPage.module.css';
import { apiClient } from '../../api/client';

export function TeacherNav() {
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
        <nav class={styles['teacher-nav']}>
            <div class={styles['nav-buttons']}>
                <button
                    class={`${styles['nav-button']} ${location.pathname === '/teacher/schedule' ? styles.active : ''}`}
                    onClick={() => navigate('/teacher/schedule')}
                >
                    Расписание
                </button>
                <button
                    class={`${styles['nav-button']} ${location.pathname === '/teacher/homework' ? styles.active : ''}`}
                    onClick={() => navigate('/teacher/homework')}
                >
                    Домашние задания
                </button>
                <button
                    class={`${styles['nav-button']} ${location.pathname === '/teacher/grades' ? styles.active : ''}`}
                    onClick={() => navigate('/teacher/grades')}
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