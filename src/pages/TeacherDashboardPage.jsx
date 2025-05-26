import { useAuth } from '../auth/AuthProvider';
import { useLocation } from '@solidjs/router';
import { TeacherNav } from '../components/teacher/TeacherNav';
import { GradesManagement } from '../components/teacher/GradesManagement';
import { HomeworkManagement } from '../components/teacher/HomeworkManagement';
import { ScheduleManagement } from '../components/teacher/ScheduleManagement';
import styles from './TeacherDashboardPage.module.css';

export function TeacherDashboardPage() {
    const { user } = useAuth();
    const location = useLocation();

    const renderContent = () => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case 'homework':
                return <HomeworkManagement />;
            case 'grades':
                return <GradesManagement />;
            case 'schedule':
                return <ScheduleManagement />;
            case 'dashboard':
            default:
                return <ScheduleManagement />;
        }
    };

    return (
        <div class={styles['teacher-dashboard']}>
            <h1>Панель управления преподавателя</h1>
            <div class={styles['welcome-message']}>
                Добро пожаловать, {user()?.name}!
            </div>

            <TeacherNav />

            <div class={styles['dashboard-content']}>
                {renderContent()}
            </div>
        </div>
    );
}