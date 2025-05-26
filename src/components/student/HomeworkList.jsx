import { createSignal, onMount } from 'solid-js';
import { apiClient } from '../../api/client';
import styles from './HomeworkList.module.css';

export function HomeworkList() {
    const [homework, setHomework] = createSignal([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(null);

    onMount(async () => {
        try {
            const data = await apiClient.get('/homework');
            setHomework(data);
        } catch (error) {
            console.error('Ошибка при загрузке домашних заданий:', error);
            setError('Не удалось загрузить домашние задания. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    });

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Выполнено';
            case 'pending':
                return 'В процессе';
            case 'submitted':
                return 'Отправлено';
            default:
                return 'Не определено';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return styles.statusCompleted;
            case 'submitted':
                return styles.statusSubmitted;
            case 'pending':
                return styles.statusPending;
            default:
                return styles.statusUnknown;
        }
    };

    return (
        <div class={styles['homework-section']}>
            <h3>Домашние задания</h3>
            {loading() ? (
                <div>
                    <div class={styles.loading} style="height: 24px; width: 40%; margin-bottom: 1rem;" />
                    <div class={styles.loading} style="height: 120px; width: 100%; margin-bottom: 1rem;" />
                    <div class={styles.loading} style="height: 120px; width: 100%;" />
                </div>
            ) : error() ? (
                <p class={styles['error-message']}>{error()}</p>
            ) : homework().length === 0 ? (
                <div class={styles.noHomework}>Нет домашних заданий</div>
            ) : (
                <div class={styles.homeworkGrid}>
                    {homework().map((hw) => (
                        <div class={styles.homeworkCard} key={hw.id}>
                            <div class={styles.homeworkHeader}>
                                <h4>{hw.subject}</h4>
                                <span class={styles.group}>{hw.group}</span>
                            </div>
                            <div class={styles.homeworkContent}>
                                <h5 class={styles.title}>{hw.title}</h5>
                                <p class={styles.description}>{hw.description}</p>
                                <div class={styles.details}>
                                    <span class={styles.dueDate}>
                                        Срок сдачи: {new Date(hw.dueDate).toLocaleDateString('ru-RU')}
                                    </span>
                                    <span class={`${styles.status} ${getStatusClass(hw.status)}`}>
                                        {getStatusText(hw.status)}
                                    </span>
                                </div>
                                {hw.submittedAt && (
                                    <div class={styles.submissionInfo}>
                                        Отправлено: {new Date(hw.submittedAt).toLocaleDateString('ru-RU')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 