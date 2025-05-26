import { useAuth } from '../auth/AuthProvider';
import { Route, useLocation } from '@solidjs/router';
import { StudentNav } from '../components/student/StudentNav';
import { ScheduleList } from '../components/student/ScheduleList';
import { GradesList } from '../components/student/GradesList';
import { HomeworkList } from '../components/student/HomeworkList';
import styles from './StudentDashboardPage.module.css';

export function StudentDashboardPage() {
    const { user } = useAuth();
    const location = useLocation();

    const renderContent = () => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case 'homework':
                return <HomeworkList />;
            case 'grades':
                return <GradesList />;
            case 'dashboard':
            default:
                return <ScheduleList />;
        }
    };

    return (
        <div class={styles['student-dashboard']}>
            <h1>Панель управления студента</h1>
            <div class={styles['welcome-message']}>
                Добро пожаловать, {user()?.name}!
            </div>

            <StudentNav />

            <div class={styles['dashboard-content']}>
                {renderContent()}
            </div>
        </div>
    );
}