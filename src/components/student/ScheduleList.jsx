import { createSignal, onMount } from 'solid-js';
import { apiClient } from '../../api/client';
import styles from '../../pages/StudentDashboardPage.module.css';

const DAYS_OF_WEEK = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота'
];

export function ScheduleList() {
  const [schedule, setSchedule] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  onMount(async () => {
    try {
      const data = await apiClient.get('/schedule');
      setSchedule(data);
    } catch (error) {
      console.error('Ошибка при загрузке расписания:', error);
      setError('Не удалось загрузить расписание. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class={styles['schedule-section']}>
      <h3>Расписание</h3>
      {loading() ? (
        <div>
          <div class={styles.loading} style="height: 24px; width: 40%; margin-bottom: 1rem;" />
          <div class={styles.loading} style="height: 120px; width: 100%; margin-bottom: 1rem;" />
          <div class={styles.loading} style="height: 120px; width: 100%;" />
        </div>
      ) : error() ? (
        <p class={styles['error-message']}>{error()}</p>
      ) : (
        <div class={styles['schedule-grid']}>
          {DAYS_OF_WEEK.map((day) => (
            <div class={styles['day-schedule']}>
              <h4>{day}</h4>
              <table class={styles['schedule-table']}>
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>Предмет</th>
                    <th>Аудитория</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule().find(d => d.day === day)?.lessons.map((lesson) => (
                    <tr>
                      <td>{lesson.time}</td>
                      <td>{lesson.subject}</td>
                      <td>{lesson.room}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="3" style="text-align: center; color: #718096;">
                        Нет занятий
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 