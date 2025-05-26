import { createSignal, onMount } from 'solid-js';
import { apiClient } from '../../api/client';
import styles from './GradesManagement.module.css';

export function GradesManagement() {
    const [groups, setGroups] = createSignal([]);
    const [selectedGroup, setSelectedGroup] = createSignal('');
    const [selectedDate, setSelectedDate] = createSignal('');
    const [students, setStudents] = createSignal([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(null);

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

    const handleGroupChange = async (groupId) => {
        setSelectedGroup(groupId);
        try {
            const studentsData = await apiClient.get(`/groups/${groupId}/students`);
            setStudents(studentsData);
        } catch (error) {
            console.error('Ошибка при загрузке студентов:', error);
            setError('Не удалось загрузить список студентов');
        }
    };

    const handleGradeSubmit = async (studentId, grade) => {
        try {
            await apiClient.post('/grades', {
                studentId,
                grade,
                date: selectedDate(),
                subject: 'Математика',
                teacherId: '1'
            });
            handleGroupChange(selectedGroup());
        } catch (error) {
            console.error('Ошибка при добавлении оценки:', error);
            setError('Не удалось добавить оценку');
        }
    };

    return (
        <div class={styles['grades-management']}>
            <h2>Управление оценками</h2>
            
            {loading() ? (
                <div class={styles.loading}>Загрузка...</div>
            ) : error() ? (
                <div class={styles.error}>{error()}</div>
            ) : (
                <>
                    <div class={styles.controls}>
                        <select 
                            value={selectedGroup()} 
                            onChange={(e) => handleGroupChange(e.target.value)}
                            class={styles.select}
                        >
                            <option value="">Выберите группу</option>
                            {groups().map(group => (
                                <option value={group.id} key={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>

                        <input 
                            type="date" 
                            value={selectedDate()} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            class={styles.dateInput}
                        />
                    </div>

                    {selectedGroup() && (
                        <div class={styles.studentsList}>
                            <h3>Список студентов</h3>
                            {students().map(student => (
                                <div class={styles.studentCard} key={student.id}>
                                    <div class={styles.studentInfo}>
                                        <span class={styles.studentName}>{student.name}</span>
                                        <span class={styles.studentGroup}>{student.group}</span>
                                    </div>
                                    <div class={styles.gradeInput}>
                                        <input 
                                            type="number" 
                                            min="2" 
                                            max="5" 
                                            placeholder="Оценка"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleGradeSubmit(student.id, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 