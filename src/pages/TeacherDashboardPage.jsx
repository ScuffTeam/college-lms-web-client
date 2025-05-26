import { useAuth } from '../auth/AuthProvider';

export function TeacherDashboardPage() {
    const { user } = useAuth();

    return (
        <div class="teacher-dashboard">
            <h1>Панель управления преподавателя</h1>
            <div class="welcome-message">
                Добро пожаловать, {user()?.name}!
            </div>

            <div class="dashboard-content">
                <section class="quick-actions">
                    <h2>Быстрые действия</h2>
                    <div class="actions-grid">
                        <button>Добавить оценку</button>
                        <button>Создать задание</button>
                        <button>Просмотреть журнал</button>
                    </div>
                </section>

                <section class="recent-activity">
                    <h2>Последние действия</h2>
                    {/* Здесь будет список последних действий */}
                </section>
            </div>
        </div>
    );
}