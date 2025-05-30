import { createSignal, onMount } from "solid-js";
import { apiClient } from "../../../api/client";
import styles from "./HomeworkManagement.module.css";
import {
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiMessageSquare,
  FiStar,
  FiX,
  FiUser,
  FiCheck,
} from "solid-icons/fi";

const HomeworkManagement = () => {
  const [homework, setHomework] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [selectedSubmission, setSelectedSubmission] = createSignal(null);
  const [students, setStudents] = createSignal({});

  onMount(async () => {
    try {
      const [homeworkData, homeworkStatusData, groupsData] = await Promise.all([
        apiClient.get("/homework/teacher"),
        apiClient.get("/homeworkStatus/teacher"),
        apiClient.get("/groups"),
      ]);

      const studentsMap = {};
      for (const group of groupsData) {
        const groupStudents = await apiClient.get(
          `/groups/${group.id}/students`
        );
        studentsMap[group.name] = groupStudents;
      }
      setStudents(studentsMap);

      const groupedHomework = homeworkData.reduce((acc, hw) => {
        const key = `${hw.subject}_${hw.lessonDate}_${hw.lessonTime}`;
        if (!acc[key]) {
          acc[key] = {
            ...hw,
            submissions: [],
          };
        }
        return acc;
      }, {});

      homeworkStatusData.forEach((status) => {
        const hw = homeworkData.find((h) => h.id === status.homeworkId);
        if (hw) {
          const key = `${hw.subject}_${hw.lessonDate}_${hw.lessonTime}`;
          if (groupedHomework[key]) {
            groupedHomework[key].submissions.push(status);
          }
        }
      });

      const finalHomework = Object.values(groupedHomework);
      console.log("Подготовленные данные:", finalHomework);
      setHomework(finalHomework);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке домашних заданий:", error);
      setError("Не удалось загрузить домашние задания");
      setLoading(false);
    }
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleViewSubmission = (submission, homework) => {
    console.log("Открытие работы:", { submission, homework });
    setSelectedSubmission({
      ...submission,
      homework,
      studentComment: submission.studentComment || "",
      grade: submission.grade || null,
      status: submission.status || "pending",
      gradedAt: submission.gradedAt || null,
    });
  };

  const handleCloseSubmission = () => {
    console.log("Закрытие работы");
    setSelectedSubmission(null);
  };

  const handleDownloadHomework = async (homeworkId) => {
    try {
      console.log("Скачивание задания:", homeworkId);
      const response = await apiClient.get(`/homework/${homeworkId}/file`);
      if (response.fileUrl) {
        window.open(response.fileUrl, "_blank");
      }
    } catch (error) {
      console.error("Ошибка при скачивании задания:", error);
      setError("Не удалось скачать задание");
    }
  };

  const handleDownloadSubmission = async (homeworkId, studentId) => {
    try {
      console.log("Скачивание работы студента:", { homeworkId, studentId });
      const response = await apiClient.get(
        `/homework/${homeworkId}/submission/${studentId}/file`
      );
      if (response.fileUrl) {
        window.open(response.fileUrl, "_blank");
      }
    } catch (error) {
      console.error("Ошибка при скачивании работы:", error);
      setError("Не удалось скачать работу");
    }
  };

  const handleGradeSubmission = async (grade) => {
    if (!selectedSubmission()) {
      console.log("Нет выбранной работы для оценки");
      return;
    }

    try {
      console.log("Выставление оценки:", {
        grade,
        submission: selectedSubmission(),
      });
      await apiClient.post(
        `/homework/${selectedSubmission().homework.id}/grade`,
        {
          studentId: selectedSubmission().studentId,
          grade: grade,
          comment: "",
        }
      );

      const updatedHomework = homework().map((hw) => {
        if (hw.id === selectedSubmission().homework.id) {
          const updatedSubmissions = hw.submissions.map((sub) => {
            if (sub.studentId === selectedSubmission().studentId) {
              return {
                ...sub,
                grade: grade,
                gradedAt: new Date().toISOString(),
              };
            }
            return sub;
          });
          return { ...hw, submissions: updatedSubmissions };
        }
        return hw;
      });

      setHomework(updatedHomework);

      const updatedSubmission = {
        ...selectedSubmission(),
        grade: grade,
        gradedAt: new Date().toISOString(),
      };
      setSelectedSubmission(updatedSubmission);
    } catch (error) {
      console.error("Ошибка при выставлении оценки:", error);
      setError("Не удалось выставить оценку");
    }
  };

  const getSubmissionStatus = (status) => {
    switch (status) {
      case "submitted":
        return { icon: FiCheckCircle, color: "#48bb78", text: "Сдано" };
      case "pending":
        return {
          icon: FiAlertCircle,
          color: "#ecc94b",
          text: "Ожидает проверки",
        };
      default:
        return { icon: FiAlertCircle, color: "#fc8181", text: "Не сдано" };
    }
  };

  const getStudentName = (studentId, group) => {
    const groupStudents = students()[group];
    if (!groupStudents) return `Студент #${studentId}`;
    const student = groupStudents.find((s) => s.id === studentId);
    return student ? student.name : `Студент #${studentId}`;
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 2:
        return {
          background: "rgba(252, 129, 129, 0.1)",
          color: "#fc8181",
          border: "rgba(252, 129, 129, 0.2)",
        };
      case 3:
        return {
          background: "rgba(236, 201, 75, 0.1)",
          color: "#ecc94b",
          border: "rgba(236, 201, 75, 0.2)",
        };
      case 4:
        return {
          background: "rgba(72, 187, 120, 0.1)",
          color: "#48bb78",
          border: "rgba(72, 187, 120, 0.2)",
        };
      case 5:
        return {
          background: "rgba(52, 152, 219, 0.1)",
          color: "#3498db",
          border: "rgba(52, 152, 219, 0.2)",
        };
      default:
        return {
          background: "rgba(160, 174, 192, 0.1)",
          color: "#a0aec0",
          border: "rgba(160, 174, 192, 0.2)",
        };
    }
  };

  return (
    <div class={styles["homework-management"]}>
      <h2>Домашние задания</h2>

      {loading() ? (
        <div class={styles.loading}>Загрузка...</div>
      ) : error() ? (
        <div class={styles.error}>{error()}</div>
      ) : (
        <div class={styles["homework-list"]}>
          {homework().map((hw) => (
            <div class={styles["homework-card"]}>
              <div class={styles["homework-header"]}>
                <div class={styles["homework-info"]}>
                  <h3>{hw.title}</h3>
                  <div class={styles["homework-details"]}>
                    <div class={styles["homework-detail"]}>
                      <FiCalendar size={16} />
                      <span>{formatDate(hw.lessonDate)}</span>
                    </div>
                    <div class={styles["homework-detail"]}>
                      <FiClock size={16} />
                      <span>{hw.lessonTime}</span>
                    </div>
                    <div class={styles["homework-detail"]}>
                      <FiFileText size={16} />
                      <span>{hw.subject}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class={styles["homework-description"]}>{hw.description}</div>
              <div class={styles["homework-footer"]}>
                <div class={styles["submission-stats"]}>
                  <span class={styles["stat"]}>
                    Сдано:{" "}
                    {
                      hw.submissions.filter((s) => s.status === "submitted")
                        .length
                    }
                  </span>
                  <span class={styles["stat"]}>
                    Ожидает:{" "}
                    {
                      hw.submissions.filter((s) => s.status === "pending")
                        .length
                    }
                  </span>
                </div>
                <div class={styles["due-date"]}>
                  Срок сдачи: {formatDate(hw.dueDate)}
                </div>
              </div>
              <div class={styles["submissions-list"]}>
                {hw.submissions.map((submission) => (
                  <div class={styles["submission-item"]}>
                    <div class={styles["submission-info"]}>
                      <span class={styles["student-name"]}>
                        {getStudentName(submission.studentId, hw.group)}
                      </span>
                      <div class={styles["submission-status"]}>
                        {(() => {
                          const status = getSubmissionStatus(submission.status);
                          const Icon = status.icon;
                          return (
                            <>
                              <Icon size={16} style={{ color: status.color }} />
                              <span style={{ color: status.color }}>
                                {status.text}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      {submission.grade && (
                        <div
                          class={styles["submission-grade"]}
                          style={{
                            background: getGradeColor(submission.grade)
                              .background,
                            color: getGradeColor(submission.grade).color,
                            borderColor: getGradeColor(submission.grade).border,
                          }}
                        >
                          <FiStar size={16} />
                          <span>Оценка: {submission.grade}</span>
                        </div>
                      )}
                    </div>
                    <button
                      class={styles["view-submissions-button"]}
                      onClick={() => handleViewSubmission(submission, hw)}
                    >
                      Просмотр работы
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSubmission() && selectedSubmission().homework && (
        <div class={styles["submission-modal"]}>
          <div class={styles["modal-content"]}>
            <div class={styles["modal-header"]}>
              <h3>Проверка работы</h3>
              <button
                onClick={handleCloseSubmission}
                class={styles["close-button"]}
              >
                <FiX size={24} />
              </button>
            </div>
            <div class={styles["submission-details"]}>
              <div class={styles["student-info"]}>
                <div class={styles["student-header"]}>
                  <div class={styles["student-avatar"]}>
                    <FiUser size={32} />
                  </div>
                  <div class={styles["student-details"]}>
                    <h4>
                      {getStudentName(
                        selectedSubmission().studentId,
                        selectedSubmission().homework.group
                      )}
                    </h4>
                    <div class={styles["student-group"]}>
                      Группа: {selectedSubmission().homework.group}
                    </div>
                  </div>
                </div>
                {selectedSubmission().studentComment &&
                  selectedSubmission().studentComment.trim() !== "" && (
                    <div class={styles["student-comment"]}>
                      <FiMessageSquare size={16} />
                      <span>
                        Комментарий студента:{" "}
                        {selectedSubmission().studentComment}
                      </span>
                    </div>
                  )}
              </div>

              <div class={styles["homework-text"]}>
                <div class={styles["homework-header"]}>
                  <h4>Задание:</h4>
                  <button
                    class={styles["download-button"]}
                    onClick={() =>
                      handleDownloadHomework(selectedSubmission().homework.id)
                    }
                  >
                    <FiDownload size={16} />
                    <span>Скачать файл задания</span>
                  </button>
                </div>
                <div class={styles["homework-content"]}>
                  {selectedSubmission().homework.description}
                </div>
              </div>

              <div class={styles["file-actions"]}>
                <button
                  class={styles["download-button"]}
                  onClick={() =>
                    handleDownloadSubmission(
                      selectedSubmission().homework.id,
                      selectedSubmission().studentId
                    )
                  }
                >
                  <FiDownload size={16} />
                  <span>Скачать выполненное задание</span>
                </button>
              </div>

              <div class={styles["grade-section"]}>
                <h4>Оценка</h4>
                <div class={styles["grade-buttons"]}>
                  <button
                    class={`${styles["grade-button"]} ${styles["grade-2"]} ${
                      selectedSubmission().grade === 2 ? styles["selected"] : ""
                    }`}
                    onClick={() => handleGradeSubmission(2)}
                  >
                    <span class={styles["grade-number"]}>2</span>
                    <span class={styles["grade-text"]}>
                      Неудовлетворительно
                    </span>
                  </button>
                  <button
                    class={`${styles["grade-button"]} ${styles["grade-3"]} ${
                      selectedSubmission().grade === 3 ? styles["selected"] : ""
                    }`}
                    onClick={() => handleGradeSubmission(3)}
                  >
                    <span class={styles["grade-number"]}>3</span>
                    <span class={styles["grade-text"]}>Удовлетворительно</span>
                  </button>
                  <button
                    class={`${styles["grade-button"]} ${styles["grade-4"]} ${
                      selectedSubmission().grade === 4 ? styles["selected"] : ""
                    }`}
                    onClick={() => handleGradeSubmission(4)}
                  >
                    <span class={styles["grade-number"]}>4</span>
                    <span class={styles["grade-text"]}>Хорошо</span>
                  </button>
                  <button
                    class={`${styles["grade-button"]} ${styles["grade-5"]} ${
                      selectedSubmission().grade === 5 ? styles["selected"] : ""
                    }`}
                    onClick={() => handleGradeSubmission(5)}
                  >
                    <span class={styles["grade-number"]}>5</span>
                    <span class={styles["grade-text"]}>Отлично</span>
                  </button>
                </div>
                <button
                  class={styles["confirm-button"]}
                  onClick={handleCloseSubmission}
                >
                  <FiCheck size={18} />
                  <span>Завершить проверку</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkManagement;
