import { createSignal } from "solid-js";
import { apiClient } from "../../../api/client";
import styles from "./HomeworkModal.module.css";
import { FiX, FiUpload, FiCalendar, FiFileText, FiBook } from "solid-icons/fi";

export function HomeworkModal(props) {
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [dueDate, setDueDate] = createSignal("");
  const [file, setFile] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title());
      formData.append("description", description());
      formData.append("dueDate", dueDate());
      formData.append("group", props.lesson.group);
      formData.append("subject", props.lesson.subject);
      formData.append("teacherId", "1");
      formData.append("status", "active");
      formData.append("lessonDate", props.lesson.date);
      formData.append("lessonTime", props.lesson.time);

      if (file()) {
        formData.append("file", file());
      }

      await apiClient.post("/homework", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      props.onClose();
      props.onSuccess();
    } catch (error) {
      console.error("Ошибка при создании домашнего задания:", error);
      setError(
        "Не удалось создать домашнее задание. Пожалуйста, попробуйте еще раз."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div class={styles.modalOverlay}>
      <div class={styles.modal}>
        <div class={styles.modalHeader}>
          <h2>Добавить домашнее задание</h2>
          <button onClick={props.onClose} class={styles.closeButton}>
            <FiX size={24} />
          </button>
        </div>

        <div class={styles.lessonInfo}>
          <div class={styles.lessonDetail}>
            <FiBook size={18} />
            <span>{props.lesson.subject}</span>
          </div>
          <div class={styles.lessonDetail}>
            <FiCalendar size={18} />
            <span>{props.lesson.group}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} class={styles.form}>
          <div class={styles.formGroup}>
            <label for="title">Название задания</label>
            <input
              id="title"
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.target.value)}
              required
              placeholder="Введите название задания"
            />
          </div>

          <div class={styles.formGroup}>
            <label for="description">Описание задания</label>
            <textarea
              id="description"
              value={description()}
              onInput={(e) => setDescription(e.target.value)}
              required
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
              onInput={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div class={styles.formGroup}>
            <label for="file" class={styles.fileLabel}>
              <FiUpload size={20} />
              <span>Прикрепить файл</span>
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              class={styles.fileInput}
            />
            {file() && (
              <div class={styles.fileInfo}>
                <FiFileText size={16} />
                <span>{file().name}</span>
              </div>
            )}
          </div>

          {error() && <div class={styles.error}>{error()}</div>}

          <div class={styles.formActions}>
            <button
              type="button"
              onClick={props.onClose}
              class={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="submit"
              class={styles.submitButton}
              disabled={loading()}
            >
              {loading() ? "Создание..." : "Создать задание"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
