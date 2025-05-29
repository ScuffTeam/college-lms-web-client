import { createSignal, onMount } from 'solid-js';
import { apiClient } from '../../api/client';
import styles from '../../pages/StudentDashboardPage.module.css';
import { FiBook, FiCalendar, FiClock, FiCheck, FiAlertCircle, FiX, FiUpload, FiDownload, FiFileText } from 'solid-icons/fi';

export function HomeworkList() {
    const [homework, setHomework] = createSignal([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal(null);
    const [selectedHomework, setSelectedHomework] = createSignal(null);
    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [selectedFile, setSelectedFile] = createSignal(null);
    const [uploadStatus, setUploadStatus] = createSignal(null);
    const [comment, setComment] = createSignal('');

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#48bb78';
            case 'pending':
                return '#ecc94b';
            case 'overdue':
                return '#fc8181';
            default:
                return '#a0aec0';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <FiCheck size={20} />;
            case 'pending':
                return <FiClock size={20} />;
            case 'overdue':
                return <FiAlertCircle size={20} />;
            default:
                return <FiBook size={20} />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const openHomeworkModal = (homework) => {
        setSelectedHomework(homework);
        setIsModalOpen(true);
        setSelectedFile(null);
        setUploadStatus(null);
        setComment('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedHomework(null);
        setSelectedFile(null);
        setUploadStatus(null);
        setComment('');
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setUploadStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile()) return;

        try {
            setUploadStatus('uploading');
            // Здесь будет логика загрузки файла или пельменей в 4 утра
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUploadStatus('success');
            setTimeout(() => {
                closeModal();
            }, 1500);
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            setUploadStatus('error');
        }
    };

    const handleDownload = async () => {
        if (!selectedHomework()) return;

        try {
            // Заглушка подушка чекушка
            console.log('Скачивание файла:', selectedHomework().title);
            
            const link = document.createElement('a');
            link.href = '#';
            link.download = `${selectedHomework().subject}_${selectedHomework().title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadStatus(null);
    };

    const renderHomeworkItem = (item) => {
        const status = item.status;
        const color = getStatusColor(status);
        const icon = getStatusIcon(status);

        return (
            <div 
                class={`${styles['homework-item']} ${styles[status]}`}
                onClick={() => openHomeworkModal(item)}
            >
                <div class={styles['homework-header']}>
                    <div class={styles['homework-info']}>
                        <div class={styles['subject-icon']} style={{ color }}>
                            {icon}
                        </div>
                        <div>
                            <h4>{item.subject}</h4>
                            <div class={styles['homework-type']}>{item.title}</div>
                        </div>
                    </div>
                    <div class={styles['homework-status']} style={{ color }}>
                        {status === 'completed' ? 'Выполнено' : 
                         status === 'pending' ? 'В процессе' : 
                         status === 'overdue' ? 'Просрочено' : 'Новое'}
                    </div>
                </div>
                <div class={styles['homework-content']}>
                    {item.description}
                </div>
                <div class={styles['homework-footer']}>
                    <div class={styles['due-date']}>
                        <FiCalendar size={16} />
                        <span>Сдать до: {formatDate(item.dueDate)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div class={styles['homework-section']}>
            <div class={styles['section-header']}>
                <h3>Домашние задания</h3>
                <div class={styles['homework-summary']}>
                    <div class={styles['summary-item']}>
                        <FiCheck size={20} color="#48bb78" />
                        <span>Выполнено: {homework().filter(h => h.status === 'completed').length}</span>
                    </div>
                    <div class={styles['summary-item']}>
                        <FiClock size={20} color="#ecc94b" />
                        <span>В процессе: {homework().filter(h => h.status === 'pending').length}</span>
                    </div>
                    <div class={styles['summary-item']}>
                        <FiAlertCircle size={20} color="#fc8181" />
                        <span>Просрочено: {homework().filter(h => h.status === 'overdue').length}</span>
                    </div>
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
                <div class={styles['homework-list']}>
                    {homework().map(hw => renderHomeworkItem(hw))}
                </div>
            )}

            {isModalOpen() && selectedHomework() && (
                <div class={styles['modalOverlay']} onClick={closeModal}>
                    <div class={styles['modal']} onClick={e => e.stopPropagation()}>
                        <div class={styles['modalHeader']}>
                            <div>
                                <h3>{selectedHomework().subject}</h3>
                                <div class={styles['modalDate']}>
                                    Сдать до: {formatDate(selectedHomework().dueDate)}
                                </div>
                            </div>
                            <button class={styles['closeButton']} onClick={closeModal}>
                                <FiX size={24} />
                            </button>
                        </div>
                        <div class={styles['modalContent']}>
                            <h4>{selectedHomework().title}</h4>
                            <p>{selectedHomework().description}</p>
                            <div class={styles['homework-actions']}>
                                <button class={styles['download-button']} onClick={handleDownload}>
                                    <FiDownload size={20} />
                                    <span>Скачать задание</span>
                                </button>
                            </div>
                            <div class={styles['file-upload']}>
                                <input
                                    type="file"
                                    id="homework-upload"
                                    onChange={handleFileSelect}
                                    class={styles['file-input']}
                                />
                                <label for="homework-upload" class={styles['file-upload-label']}>
                                    <FiUpload size={24} />
                                    <span>Выберите файл для загрузки</span>
                                </label>
                                {selectedFile() && (
                                    <div class={styles['uploaded-files']}>
                                        <div class={styles['uploaded-file']}>
                                            <div class={styles['file-info']}>
                                                <FiFileText size={20} />
                                                <span class={styles['uploaded-file-name']}>{selectedFile().name}</span>
                                            </div>
                                            <button class={styles['remove-file']} onClick={handleRemoveFile}>
                                                <FiX size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div class={styles['comment-section']}>
                                <textarea
                                    class={styles['comment-input']}
                                    placeholder="Добавьте комментарий к домашнему заданию..."
                                    value={comment()}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                            {uploadStatus() && (
                                <div class={uploadStatus().type === 'success' ? styles['upload-success'] : styles['upload-error']}>
                                    {uploadStatus().message}
                                </div>
                            )}
                            <div class={styles['modal-actions']}>
                                <button class={styles['cancel-button']} onClick={closeModal}>
                                    Отменить
                                </button>
                                <button 
                                    class={styles['upload-button']} 
                                    onClick={handleUpload}
                                    disabled={!selectedFile() && !comment()}
                                >
                                    <FiUpload size={20} />
                                    <span>Отправить</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 