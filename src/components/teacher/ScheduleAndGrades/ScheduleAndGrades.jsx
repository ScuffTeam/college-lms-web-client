import { createSignal, onMount, For, Show, createEffect } from "solid-js";
import { apiClient } from "../../../api/client";
import styles from "./ScheduleAndGrades.module.css";
import {
  FiCalendar,
  FiClock,
  FiBook,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
} from "solid-icons/fi";
import { HomeworkModal } from "../HomeworkModal/HomeworkModal";

export function ScheduleAndGrades() {
  const [schedule, setSchedule] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [currentWeek, setCurrentWeek] = createSignal(0);
  const [weekDates, setWeekDates] = createSignal([]);
  const [selectedLesson, setSelectedLesson] = createSignal(null);
  const [students, setStudents] = createSignal([]);
  const [viewMode, setViewMode] = createSignal("schedule");
  const [studentGrades, setStudentGrades] = createSignal({});
  const [studentAttendance, setStudentAttendance] = createSignal({});
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = createSignal(false);

  const daysOfWeek = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];

  const timeSlots = [
    "8:30-10:00",
    "10:10-11:40",
    "12:10-13:40",
    "14:00-15:30",
    "15:40-17:10",
    "17:20-18:50",
  ];

  const calculateWeekDates = (weekOffset = 0) => {
    const baseDate = new Date(2025, 5, 1);
    
    const currentDay = baseDate.getDay();
    
    const diff = baseDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    
    const monday = new Date(baseDate.getFullYear(), baseDate.getMonth(), diff);
    
    const targetMonday = new Date(monday);
    targetMonday.setDate(monday.getDate() + weekOffset * 7);

    const dates = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(targetMonday);
      date.setDate(targetMonday.getDate() + i);
      dates.push(date);
    }

    console.log('Рассчитанные даты недели:', dates.map(d => d.toISOString().split('T')[0]));
    return dates;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  const fetchSchedule = async (weekOffset) => {
    setLoading(true);
    setError(null);
    try {
      const dates = calculateWeekDates(weekOffset);
      setWeekDates(dates);

      const startDate = dates[0].toISOString().split("T")[0];
      const endDate = dates[5].toISOString().split("T")[0];

      const scheduleData = await apiClient.get(
        `/schedule/teacher?startDate=${startDate}&endDate=${endDate}`
      );
      setSchedule(scheduleData);
    } catch (error) {
      console.error("Ошибка при загрузке расписания:", error);
      setError("Не удалось загрузить расписание");
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    fetchSchedule(0);
  });

  createEffect(() => {
    const weekOffset = currentWeek();
    fetchSchedule(weekOffset);
  });

  const handleLessonSelect = async (lesson) => {
    setSelectedLesson(lesson);
    setViewMode("grades");
    try {
      const groupsData = await apiClient.get("/groups");

      const group = groupsData.find((g) => g.name === lesson.group);

      if (!group) {
        throw new Error("Группа не найдена");
      }

      console.log("Загрузка студентов для группы:", group.id);

      const studentsData = await apiClient.get(`/groups/${group.id}/students`);
      console.log("Полученные данные студентов:", studentsData);

      if (Array.isArray(studentsData)) {
        setStudents(studentsData);

        const grades = {};
        const attendance = {};
        for (const student of studentsData) {
          try {
            const studentGradesData = await apiClient.get(
              `/grades?studentId=${student.id}&subject=${encodeURIComponent(
                lesson.subject
              )}&teacherId=1`
            );
            if (studentGradesData && studentGradesData.length > 0) {
              const lastGrade = studentGradesData[studentGradesData.length - 1];
              grades[student.id] = lastGrade.grade;
            }

            const attendanceData = await apiClient.get(
              `/attendance?studentId=${student.id}&subject=${encodeURIComponent(
                lesson.subject
              )}&date=${lesson.date}`
            );
            if (attendanceData && attendanceData.length > 0) {
              const lastAttendance = attendanceData[attendanceData.length - 1];
              attendance[student.id] = lastAttendance.isPresent;
            }
          } catch (error) {
            console.warn(
              `Не удалось загрузить данные для студента ${student.id}:`,
              error
            );
          }
        }
        setStudentGrades(grades);
        setStudentAttendance(attendance);
      } else {
        console.error("Неверный формат данных студентов:", studentsData);
        setError("Неверный формат данных студентов");
      }
    } catch (error) {
      console.error("Ошибка при загрузке студентов:", error);
      setError(
        "Не удалось загрузить список студентов. Пожалуйста, попробуйте еще раз."
      );
    }
  };

  const handleGradeSubmit = async (studentId, grade) => {
    if (!selectedLesson()) return;

    try {
      const groupsData = await apiClient.get("/groups");

      const group = groupsData.find((g) => g.name === selectedLesson().group);

      if (!group) {
        throw new Error("Группа не найдена");
      }

      await apiClient.post("/grades", {
        studentId,
        grade: parseInt(grade),
        date: selectedLesson().date,
        subject: selectedLesson().subject,
        teacherId: "1",
        type: "Устный ответ",
        groupId: group.id,
      });

      setStudentGrades((prev) => ({
        ...prev,
        [studentId]: grade,
      }));

      setError(null);
    } catch (error) {
      console.error("Ошибка при добавлении оценки:", error);
      setError("Не удалось добавить оценку. Пожалуйста, попробуйте еще раз.");
    }
  };

  const getLessonForTimeSlot = (day, timeSlot) => {
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return null;

    const date = weekDates()[dayIndex];
    const dateStr = date.toISOString().split('T')[0];

    console.log('Поиск урока:', {
      day,
      timeSlot,
      dateStr,
      schedule: schedule()
    });

    const lesson = schedule().find(lesson => 
      lesson.date === dateStr && 
      lesson.timeSlot === timeSlot
    );

    console.log('Найденный урок:', lesson);
    return lesson;
  };

  const handlePrevWeek = () => {
    setCurrentWeek((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => prev + 1);
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(0);
  };

  const handleBackToSchedule = () => {
    setViewMode("schedule");
    setSelectedLesson(null);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 5:
        return "excellent";
      case 4:
        return "good";
      case 3:
        return "satisfactory";
      case 2:
        return "unsatisfactory";
      default:
        return "";
    }
  };

  const handleAttendanceToggle = async (studentId, isPresent) => {
    if (!selectedLesson()) return;

    try {
      const groupsData = await apiClient.get("/groups");

      const group = groupsData.find((g) => g.name === selectedLesson().group);

      if (!group) {
        throw new Error("Группа не найдена");
      }

      const attendanceData = {
        studentId,
        isPresent,
        date: selectedLesson().date,
        subject: selectedLesson().subject,
        teacherId: "1",
        groupId: group.id,
      };

      await apiClient.post("/attendance", attendanceData);

      setStudentAttendance((prev) => ({
        ...prev,
        [studentId]: isPresent,
      }));

      setError(null);
    } catch (error) {
      console.error("Ошибка при отметке присутствия:", error);
      setError(
        "Не удалось отметить присутствие. Пожалуйста, попробуйте еще раз."
      );
    }
  };

  const handleOpenHomeworkModal = (lesson) => {
    setSelectedLesson(lesson);
    setIsHomeworkModalOpen(true);
  };

  const handleCloseHomeworkModal = () => {
    setIsHomeworkModalOpen(false);
  };

  const handleHomeworkSuccess = () => {
    console.log("Домашнее задание успешно создано");
  };

  return (
    <div class={styles["schedule-and-grades"]}>
      <h2>
        {viewMode() === "schedule"
          ? "Расписание занятий"
          : "Управление оценками"}
      </h2>

      <div class={styles["week-navigation"]}>
        <button onClick={handlePrevWeek} class={styles["nav-button"]}>
          <FiChevronLeft size={20} />
          Предыдущая неделя
        </button>
        <button
          onClick={handleCurrentWeek}
          class={styles["current-week-button"]}
        >
          Текущая неделя
        </button>
        <button onClick={handleNextWeek} class={styles["nav-button"]}>
          Следующая неделя
          <FiChevronRight size={20} />
        </button>
      </div>

      {loading() ? (
        <div class={styles.loading}>Загрузка...</div>
      ) : error() ? (
        <div class={styles["error-message"]}>{error()}</div>
      ) : viewMode() === "schedule" ? (
        <div class={styles["schedule-table-container"]}>
          <table class={styles["schedule-table"]}>
            <thead>
              <tr>
                <th class={styles["time-column"]}>
                  <FiClock size={20} />
                  <span>Время</span>
                </th>
                <For each={daysOfWeek}>
                  {(day, index) => (
                    <th key={day}>
                      <div class={styles["day-header"]}>
                        <FiCalendar size={20} />
                        <span>{day}</span>
                        <span class={styles["date"]}>
                          {formatDate(weekDates()[index()])}
                        </span>
                      </div>
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={timeSlots}>
                {(timeSlot) => (
                  <tr>
                    <td class={styles["time-slot"]}>
                      <FiClock size={16} />
                      <span>{timeSlot}</span>
                    </td>
                    <For each={daysOfWeek}>
                      {(day) => {
                        const lesson = getLessonForTimeSlot(day, timeSlot);
                        return (
                          <td
                            class={`${styles["lesson-cell"]} ${
                              lesson ? styles["has-lesson"] : ""
                            }`}
                            onClick={() => lesson && handleLessonSelect(lesson)}
                          >
                            {lesson ? (
                              <div class={styles["lesson-info"]}>
                                <div class={styles["lesson-subject"]}>
                                  <FiBook size={16} />
                                  <span>{lesson.subject}</span>
                                </div>
                                <div class={styles["lesson-group"]}>
                                  <FiUsers size={16} />
                                  <span>{lesson.group}</span>
                                </div>
                                <div class={styles["lesson-room"]}>
                                  {lesson.room}
                                </div>
                                <button
                                  class={styles["homework-button"]}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenHomeworkModal(lesson);
                                  }}
                                >
                                  <FiFileText size={16} />
                                  <span>ДЗ</span>
                                </button>
                              </div>
                            ) : (
                              <div class={styles["empty-slot"]}>-</div>
                            )}
                          </td>
                        );
                      }}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      ) : (
        <div class={styles["grades-section"]}>
          <div class={styles["grades-header"]}>
            <div class={styles["grades-header-top"]}>
              <button
                onClick={handleBackToSchedule}
                class={styles["back-button"]}
              >
                <FiChevronLeft size={20} />
                Назад к расписанию
              </button>
            </div>
            <div class={styles["grades-header-info"]}>
              <h3>
                {selectedLesson()?.subject} - {selectedLesson()?.group}
              </h3>
              <div class={styles["lesson-details"]}>
                <div class={styles["lesson-detail"]}>
                  <FiClock size={18} />
                  <span>{selectedLesson()?.time}</span>
                </div>
                <div class={styles["lesson-detail"]}>
                  <FiBook size={18} />
                  <span>Аудитория {selectedLesson()?.room}</span>
                </div>
              </div>
            </div>
          </div>

          {error() && <div class={styles["error-message"]}>{error()}</div>}

          <div class={styles["students-list"]}>
            {students().map((student) => (
              <div class={styles["student-card"]} key={student.id}>
                <div class={styles["student-info"]}>
                  <div class={styles["student-avatar"]}>
                    {getInitials(student.name)}
                  </div>
                  <div class={styles["student-details"]}>
                    <span class={styles["student-name"]}>{student.name}</span>
                    <span class={styles["student-group"]}>
                      {selectedLesson()?.group}
                    </span>
                  </div>
                </div>
                <div class={styles["student-controls"]}>
                  <div class={styles["attendance-buttons"]}>
                    <button
                      class={`${styles["attendance-button"]} ${styles.absent} ${
                        studentAttendance()[student.id] === false
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => handleAttendanceToggle(student.id, false)}
                    >
                      Отсутствует
                    </button>
                    <button
                      class={`${styles["attendance-button"]} ${
                        styles.present
                      } ${
                        studentAttendance()[student.id] === true
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => handleAttendanceToggle(student.id, true)}
                    >
                      Присутствует
                    </button>
                  </div>
                  <div class={styles["grade-buttons"]}>
                    {[2, 3, 4, 5].map((grade) => (
                      <button
                        class={`${styles["grade-button"]} ${
                          styles[getGradeColor(grade)]
                        } ${
                          studentGrades()[student.id] === grade
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => handleGradeSubmit(student.id, grade)}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isHomeworkModalOpen() && (
        <HomeworkModal
          lesson={selectedLesson()}
          onClose={handleCloseHomeworkModal}
          onSuccess={handleHomeworkSuccess}
        />
      )}
    </div>
  );
}
