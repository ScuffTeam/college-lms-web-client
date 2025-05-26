import { createSignal, onMount } from 'solid-js';
import { apiClient } from '../../api/client';
import styles from './HomeworkManagement.module.css';

export function HomeworkManagement() {
    const [groups, setGroups] = createSignal([]);
    const [selectedGroup, setSelectedGroup] = createSignal('');
    const [title, setTitle] = createSignal('');
    const [description, setDescription] = createSignal('');
    const [dueDate, setDueDate] = createSignal('');
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(null);
    const [success, setSuccess] = createSignal(null);

    onMount(async () => {
        try {
            const groupsData = await apiClient.get('/groups');
            setGroups(groupsData);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при загрузке групп:', error);
            setError('Не удалось загрузить группы');
            setLoading(false);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedGroup() || !title() || !description() || !dueDate()) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            await apiClient.post('/homework', {
                title: title(),
                description: description(),
                dueDate: dueDate(),
                group: selectedGroup(),
                status: 'active',
                teacherId: '1'
            });

            setSuccess('Домашнее задание успешно создано');
            setTitle('');
            setDescription('');
            setDueDate('');
            setSelectedGroup('');
        } catch (error) {
            console.error('Ошибка при создании домашнего задания:', error);
            setError('Не удалось создать домашнее задание');
        }
    };

    return (
        <div class={styles['homework-management']}>
            <h2>Управление домашними заданиями</h2>
            
            {loading() ? (
                <div class={styles.loading}>Загрузка...</div>
            ) : error() ? (
                <div class={styles.error}>{error()}</div>
            ) : (
                <form onSubmit={handleSubmit} class={styles.form}>
                    <div class={styles.formGroup}>
                        <label for="group">Группа</label>
                        <select 
                            id="group"
                            value={selectedGroup()} 
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            class={styles.select}
                        >
                            <option value="">Выберите группу</option>
                            {groups().map(group => (
                                <option value={group.id} key={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div class={styles.formGroup}>
                        <label for="title">Название задания</label>
                        <input 
                            id="title"
                            type="text" 
                            value={title()} 
                            onChange={(e) => setTitle(e.target.value)}
                            class={styles.input}
                            placeholder="Введите название задания"
                        />
                    </div>

                    <div class={styles.formGroup}>
                        <label for="description">Описание задания</label>
                        <textarea 
                            id="description"
                            value={description()} 
                            onChange={(e) => setDescription(e.target.value)}
                            class={styles.textarea}
                            placeholder="Введите описание задания"
                            rows="4"
                        />
                    </div>

                    <div class={styles.formGroup}>
                        <label for="dueDate">Срок сдачи</label>
                        <input 
                            id="dueDate"
                            type="date" 
                            value={dueDate()} 
                            onChange={(e) => setDueDate(e.target.value)}
                            class={styles.input}
                        />
                    </div>

                    <button type="submit" class={styles.submitButton}>
                        Создать задание
                    </button>

                    {success() && (
                        <div class={styles.success}>{success()}</div>
                    )}
                </form>
            )}
        </div>
    );
} 