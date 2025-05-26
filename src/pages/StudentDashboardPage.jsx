import { useAuth } from '../auth/AuthProvider';

export function StudentDashboardPage() {
    const { user } = useAuth();

    return (
        <div class="student-dashboard">
            <h1>Панель управления студента</h1>
            <div class="welcome-message">
                Добро пожаловать, {user()?.name}!
            </div>

            <div class="dashboard-content">
                <section class="grades-overview">
                    <h2>Текущие оценки</h2>
                    {/* Здесь будет таблица с оценками */}
                </section>

                <section class="upcoming-tasks">
                    <h2>Предстоящие задания</h2>
                    {/* Здесь будет список заданий */}
                </section>

                <section class="recent-activity">
                    <h2>Последние обновления</h2>
                    {/* Здесь будет список последних обновлений */}
                </section>
            </div>
        </div>
    );
}