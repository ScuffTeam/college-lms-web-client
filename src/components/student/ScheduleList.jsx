import { createSignal, onMount, createEffect } from 'solid-js';
import { apiClient } from '../../api/client';
import styles from '../../pages/StudentDashboardPage.module.css';
import { 
    FiCalendar, 
    FiGrid, 
    FiList, 
    FiChevronLeft, 
    FiChevronRight,
    FiClock,
    FiX
} from 'solid-icons/fi';

const DAYS_OF_WEEK = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
];

const VIEW_MODES = {
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day',
    LIST: 'list'
};

export function ScheduleList() {
    const [schedule, setSchedule] = createSignal([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(null);
    const [viewMode, setViewMode] = createSignal(VIEW_MODES.WEEK);
    const [currentDate, setCurrentDate] = createSignal(new Date());
    const [selectedDate, setSelectedDate] = createSignal(null);
    const [isModalOpen, setIsModalOpen] = createSignal(false);

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

    const isStudyDay = (date) => {
        const day = date.getDay();
        return day !== 0; // 0 - воскресенье
    };

    const openDayModal = (date) => {
        if (isStudyDay(date)) {
            setSelectedDate(date);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    const getWeekDays = (date) => {
        const days = [];
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            days.push(currentDate);
        }
        return days;
    };

    const getMonthDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Добавляем дни предыдущего месяца
        const firstDayOfWeek = firstDay.getDay() || 7;
        for (let i = firstDayOfWeek - 1; i > 0; i--) {
            const prevDate = new Date(year, month, 1 - i);
            days.push(prevDate);
        }

        // Добавляем дни текущего месяца
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        // Добавляем дни следующего месяца
        const remainingDays = 42 - days.length; // 6 строк по 7 дней
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    };

    const getDayName = (date) => {
        return date.toLocaleDateString('ru-RU', { weekday: 'long' });
    };

    const getDayNumber = (date) => {
        return date.getDate();
    };

    const getMonthYear = (date) => {
        return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    };

    const goToPrevious = () => {
        const newDate = new Date(currentDate());
        if (viewMode() === VIEW_MODES.MONTH) {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - (viewMode() === VIEW_MODES.WEEK ? 7 : 1));
        }
        setCurrentDate(newDate);
    };

    const goToNext = () => {
        const newDate = new Date(currentDate());
        if (viewMode() === VIEW_MODES.MONTH) {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + (viewMode() === VIEW_MODES.WEEK ? 7 : 1));
        }
        setCurrentDate(newDate);
    };

    const getLessonsForDate = (date) => {
        const dayName = getDayName(date);
        return schedule().find(d => d.day === dayName)?.lessons || [];
    };

    const renderMonthView = () => {
        const days = getMonthDays(currentDate());
        return (
            <div class={styles.calendarGrid}>
                {DAYS_OF_WEEK.map(day => (
                    <div class={styles.dayHeader} key={day}>
                        {day.substring(0, 2).toUpperCase()}
                    </div>
                ))}
                {days.map(date => {
                    const lessons = getLessonsForDate(date);
                    const isCurrentMonth = date.getMonth() === currentDate().getMonth();
                    const isStudy = isStudyDay(date);
                    return (
                        <div 
                            class={`${styles.calendarDay} 
                                ${!isCurrentMonth ? styles.otherMonth : ''} 
                                ${lessons.length > 0 ? styles.hasLessons : ''}
                                ${!isStudy ? styles.nonStudyDay : ''}`}
                            key={date.toDateString()}
                            onClick={() => openDayModal(date)}
                        >
                            <div class={styles.dayNumber}>{getDayNumber(date)}</div>
                            {lessons.length > 0 && (
                                <div class={styles.lessonCount}>{lessons.length} занятий</div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        const days = getWeekDays(currentDate());
        return (
            <div class={styles.scheduleGrid}>
                {days.map(date => {
                    const lessons = getLessonsForDate(date);
                    return (
                        <div class={styles['day-schedule']} key={date.toDateString()}>
                            <h4>{getDayName(date)}</h4>
                            <div class={styles.date}>{date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                            <table class={styles['schedule-table']}>
                                <thead>
                                    <tr>
                                        <th>Время</th>
                                        <th>Предмет</th>
                                        <th>Аудитория</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lessons.length > 0 ? (
                                        lessons.map((lesson, index) => (
                                            <tr key={index}>
                                                <td>{lesson.time}</td>
                                                <td>{lesson.subject}</td>
                                                <td>{lesson.room}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style="text-align: center; color: #718096;">
                                                Нет занятий
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const lessons = getLessonsForDate(currentDate());
        return (
            <div class={styles['day-schedule']}>
                <h4>{getDayName(currentDate())}</h4>
                <div class={styles.date}>{currentDate().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <table class={styles['schedule-table']}>
                    <thead>
                        <tr>
                            <th>Время</th>
                            <th>Предмет</th>
                            <th>Аудитория</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.length > 0 ? (
                            lessons.map((lesson, index) => (
                                <tr key={index}>
                                    <td>{lesson.time}</td>
                                    <td>{lesson.subject}</td>
                                    <td>{lesson.room}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style="text-align: center; color: #718096;">
                                    Нет занятий
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderListView = () => {
        return (
            <div class={styles.scheduleGrid}>
                {DAYS_OF_WEEK.map((day) => (
                    <div class={styles['day-schedule']} key={day}>
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
                                {schedule().find(d => d.day === day)?.lessons.map((lesson, index) => (
                                    <tr key={index}>
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
        );
    };

    return (
        <div class={styles['schedule-section']}>
            <div class={styles.scheduleControls}>
                <div class={styles.viewModeButtons}>
                    <button 
                        class={`${styles.viewModeButton} ${viewMode() === VIEW_MODES.MONTH ? styles.active : ''}`}
                        onClick={() => setViewMode(VIEW_MODES.MONTH)}
                    >
                        <FiCalendar size={20} />
                        <span>Месяц</span>
                    </button>
                    <button 
                        class={`${styles.viewModeButton} ${viewMode() === VIEW_MODES.WEEK ? styles.active : ''}`}
                        onClick={() => setViewMode(VIEW_MODES.WEEK)}
                    >
                        <FiGrid size={20} />
                        <span>Неделя</span>
                    </button>
                    <button 
                        class={`${styles.viewModeButton} ${viewMode() === VIEW_MODES.DAY ? styles.active : ''}`}
                        onClick={() => setViewMode(VIEW_MODES.DAY)}
                    >
                        <FiClock size={20} />
                        <span>День</span>
                    </button>
                    <button 
                        class={`${styles.viewModeButton} ${viewMode() === VIEW_MODES.LIST ? styles.active : ''}`}
                        onClick={() => setViewMode(VIEW_MODES.LIST)}
                    >
                        <FiList size={20} />
                        <span>Список</span>
                    </button>
                </div>

                <div class={styles.dateNavigation}>
                    <button class={styles.navButton} onClick={goToPrevious}>
                        <FiChevronLeft size={24} />
                    </button>
                    <div class={styles.currentDate}>
                        {viewMode() === VIEW_MODES.MONTH ? (
                            getMonthYear(currentDate())
                        ) : viewMode() === VIEW_MODES.WEEK ? (
                            `${getMonthYear(getWeekDays(currentDate())[0])} - ${getMonthYear(getWeekDays(currentDate())[6])}`
                        ) : (
                            getMonthYear(currentDate())
                        )}
                    </div>
                    <button class={styles.navButton} onClick={goToNext}>
                        <FiChevronRight size={24} />
                    </button>
                </div>
            </div>

            {loading() ? (
                <div>
                    <div class={styles.loading} style="height: 24px; width: 40%; margin-bottom: 1rem;" />
                    <div class={styles.loading} style="height: 120px; width: 100%; margin-bottom: 1rem;" />
                    <div class={styles.loading} style="height: 120px; width: 100%;" />
                </div>
            ) : error() ? (
                <p class={styles['error-message']}>{error()}</p>
            ) : (
                <>
                    {viewMode() === VIEW_MODES.MONTH && renderMonthView()}
                    {viewMode() === VIEW_MODES.WEEK && renderWeekView()}
                    {viewMode() === VIEW_MODES.DAY && renderDayView()}
                    {viewMode() === VIEW_MODES.LIST && renderListView()}
                </>
            )}

            {isModalOpen() && selectedDate() && (
                <div class={styles.modalOverlay} onClick={closeModal}>
                    <div class={styles.modal} onClick={e => e.stopPropagation()}>
                        <div class={styles.modalHeader}>
                            <h3>{getDayName(selectedDate())}</h3>
                            <div class={styles.modalDate}>
                                {selectedDate().toLocaleDateString('ru-RU', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </div>
                            <button class={styles.closeButton} onClick={closeModal}>
                                <FiX size={24} />
                            </button>
                        </div>
                        <div class={styles.modalContent}>
                            <table class={styles['schedule-table']}>
                                <thead>
                                    <tr>
                                        <th>Время</th>
                                        <th>Предмет</th>
                                        <th>Аудитория</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getLessonsForDate(selectedDate()).length > 0 ? (
                                        getLessonsForDate(selectedDate()).map((lesson, index) => (
                                            <tr key={index}>
                                                <td>{lesson.time}</td>
                                                <td>{lesson.subject}</td>
                                                <td>{lesson.room}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style="text-align: center; color: #718096;">
                                                Нет занятий
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 