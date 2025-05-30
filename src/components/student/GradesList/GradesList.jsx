import { createSignal, onMount } from "solid-js";
import { apiClient } from "../../../api/client";
import styles from "./GradesList.module.css";
import { FiBook, FiAward, FiTrendingUp, FiCalendar } from "solid-icons/fi";

export function GradesList() {
  const [grades, setGrades] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  onMount(async () => {
    try {
      const data = await apiClient.get("/grades");
      setGrades(data);
    } catch (error) {
      console.error("Ошибка при загрузке оценок:", error);
      setError("Не удалось загрузить оценки. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  });

  const calculateAverage = (grades) => {
    if (!grades || !Array.isArray(grades) || grades.length === 0) return 0;
    const validGrades = grades.filter(
      (grade) => grade && typeof grade.value === "number"
    );
    if (validGrades.length === 0) return 0;
    const sum = validGrades.reduce((acc, grade) => acc + grade.value, 0);
    return (sum / validGrades.length).toFixed(1);
  };

  const getGradeColor = (grade) => {
    if (grade >= 4.5) return "#48bb78";
    if (grade >= 3.5) return "#3498db";
    if (grade >= 2.5) return "#ecc94b";
    return "#fc8181";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const groupGradesByDate = () => {
    const allGrades = grades().flatMap((subject) =>
      subject.grades.map((grade) => ({
        ...grade,
        subject: subject.subject,
      }))
    );

    return allGrades.reduce((acc, grade) => {
      const date = grade.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(grade);
      return acc;
    }, {});
  };

  const renderDayGrades = (date, dayGrades) => {
    return (
      <div class={styles["day-grades"]}>
        <div class={styles["day-header"]}>
          <FiCalendar size={20} color="#3498db" />
          <h4>{formatDate(date)}</h4>
        </div>
        <div class={styles["day-grades-list"]}>
          {dayGrades.map((grade, index) => (
            <div class={styles["grade-item"]} key={index}>
              <div class={styles["grade-subject"]}>
                <FiBook size={16} color={getGradeColor(grade.value)} />
                <span>{grade.subject}</span>
              </div>
              <div class={styles["grade-info"]}>
                <div class={styles["grade-type"]}>{grade.type}</div>
                <div
                  class={styles["grade-value"]}
                  style={{ color: getGradeColor(grade.value) }}
                >
                  {grade.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSubjectGrades = (subject) => {
    const subjectGrades = grades().find((g) => g?.subject === subject);
    if (!subjectGrades || !Array.isArray(subjectGrades.grades)) return null;

    const average = calculateAverage(subjectGrades.grades);
    const color = getGradeColor(average);

    return (
      <div class={styles["subject-grades"]}>
        <div class={styles["subject-header"]}>
          <div class={styles["subject-info"]}>
            <FiBook size={24} color={color} />
            <h4>{subject}</h4>
          </div>
          <div class={styles["average-grade"]} style={{ color }}>
            <FiAward size={20} />
            <span>{average}</span>
          </div>
        </div>
        <div class={styles["grades-list"]}>
          {subjectGrades.grades.map((grade, index) => (
            <div class={styles["grade-item"]} key={index}>
              <div
                class={styles["grade-value"]}
                style={{ color: getGradeColor(grade?.value || 0) }}
              >
                {grade?.value || "Н/Д"}
              </div>
              <div class={styles["grade-info"]}>
                <div class={styles["grade-type"]}>
                  {grade?.type || "Не указано"}
                </div>
                <div class={styles["grade-date"]}>
                  {grade?.date ? formatDate(grade.date) : "Не указано"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div class={styles["grades-section"]}>
      <div class={styles["section-header"]}>
        <h3>Оценки</h3>
        <div class={styles["grades-summary"]}>
          <div class={styles["summary-item"]}>
            <FiTrendingUp size={20} color="#3498db" />
            <span>
              Средний балл:{" "}
              {calculateAverage(grades().flatMap((g) => g?.grades || []))}
            </span>
          </div>
        </div>
      </div>

      {loading() ? (
        <div>
          <div
            class={styles.loading}
            style="height: 24px; width: 40%; margin-bottom: 1rem;"
          />
          <div
            class={styles.loading}
            style="height: 120px; width: 100%; margin-bottom: 1rem;"
          />
          <div class={styles.loading} style="height: 120px; width: 100%;" />
        </div>
      ) : error() ? (
        <p class={styles["error-message"]}>{error()}</p>
      ) : (
        <>
          <div class={styles["grades-by-date"]}>
            {Object.entries(groupGradesByDate())
              .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
              .map(([date, dayGrades]) => renderDayGrades(date, dayGrades))}
          </div>
          <div class={styles["all-grades-section"]}>
            <h3>Все оценки по предметам</h3>
            <div class={styles["grades-grid"]}>
              {grades().map(
                (grade) => grade?.subject && renderSubjectGrades(grade.subject)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
