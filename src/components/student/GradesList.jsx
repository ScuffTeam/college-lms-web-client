import { createSignal, onMount } from 'solid-js';
import { apiClient } from '../../api/client';
import styles from './GradesList.module.css';

const DAYS_OF_WEEK = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота'
];

export function GradesList() {
  const [grades, setGrades] = createSignal([]);
  const [schedule, setSchedule] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  onMount(async () => {
    try {
      const [gradesData, scheduleData] = await Promise.all([
        apiClient.get('/grades'),
        apiClient.get('/schedule')
      ]);
      setGrades(gradesData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  });

  const getGradesForSubject = (subject) => {
    return grades().filter(grade => grade.subject === subject);
  };

  const getDaySchedule = (day) => {
    return schedule().find(d => d.day === day)?.lessons || [];
  };

  return (
    <div class={styles['grades-section']}>
      <h3>Расписание и оценки</h3>
      {loading() ? (
        <div>
          <div class={styles.loading} style="height: 24px; width: 40%; margin-bottom: 1rem;" />
          <div class={styles.loading} style="height: 120px; width: 100%; margin-bottom: 1rem;" />
          <div class={styles.loading} style="height: 120px; width: 100%;" />
        </div>
      ) : error() ? (
        <p class={styles['error-message']}>{error()}</p>
      ) : (
        <div class={styles.scheduleGrid}>
          {DAYS_OF_WEEK.map((day) => {
            const dayLessons = getDaySchedule(day);
            return (
              <div class={styles.daySchedule} key={day}>
                <h4>{day}</h4>
                <div class={styles.lessonsList}>
                  {dayLessons.length > 0 ? (
                    dayLessons.map((lesson) => {
                      const lessonGrades = getGradesForSubject(lesson.subject);
                      return (
                        <div class={styles.lessonCard} key={lesson.subject}>
                          <div class={styles.lessonHeader}>
                            <span class={styles.time}>{lesson.time}</span>
                            <span class={styles.room}>{lesson.room}</span>
                          </div>
                          <h5>{lesson.subject}</h5>
                          <div class={styles.gradesList}>
                            {lessonGrades.length > 0 ? (
                              lessonGrades.map((grade) => (
                                <div class={styles.gradeItem} key={grade.id}>
                                  <span class={styles.gradeValue}>{grade.grade}</span>
                                  <span class={styles.gradeDate}>
                                    {new Date(grade.date).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span class={styles.noGrades}>Нет оценок</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div class={styles.noLessons}>
                      Нет занятий
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 