import { createSignal, onMount, For, Show, createEffect } from "solid-js";
import { apiClient } from "../../../api/client";
import styles from "./ScheduleManagement.module.css";

export function ScheduleManagement() {
  const [groups, setGroups] = createSignal([]);
  const [selectedGroup, setSelectedGroup] = createSignal("");
  const [allSchedule, setAllSchedule] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  const [currentWeekStart, setCurrentWeekStart] = createSignal(new Date());

  const [selectedDaySchedule, setSelectedDaySchedule] = createSignal(null);
  const [showModal, setShowModal] = createSignal(false);

  const daysOfWeek = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье",
  ];

  onMount(async () => {
    try {
      const groupsData = await apiClient.get("/groups");
      setGroups(groupsData);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке групп:", error);
      setError("Не удалось загрузить группы");
      setLoading(false);
    }
  });

  createEffect(async () => {
    const groupId = selectedGroup();
    if (groupId) {
      setLoading(true);
      setError(null);
      setAllSchedule([]);
      try {
        const scheduleData = await apiClient.get(`/schedule/${groupId}`);
        const formattedSchedule = {};
        scheduleData.forEach((dayEntry) => {
          if (daysOfWeek.includes(dayEntry.day)) {
            formattedSchedule[dayEntry.day] = dayEntry.lessons;
          }
        });
        setAllSchedule(formattedSchedule);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке расписания:", error);
        setError("Не удалось загрузить расписание");
        setLoading(false);
        setAllSchedule([]);
      }
    } else {
      setAllSchedule([]);
      setError(null);
    }
  });

  const getWeekDays = (startOfWeek) => {
    const days = [];
    const start = new Date(startOfWeek);
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

  const currentWeekDays = () => getWeekDays(currentWeekStart());

  const getDayName = (date) => {
    const options = { weekday: "long" };
    return date.toLocaleDateString("ru-RU", options);
  };

  const getDayNumber = (date) => {
    return date.getDate();
  };

  const getMonthYear = (date) => {
    const options = { month: "long", year: "numeric" };
    return date.toLocaleDateString("ru-RU", options);
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart());
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart());
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const openModal = (date) => {
    const dayName = getDayName(date);
    const lessons = allSchedule()[dayName] || [];
    setSelectedDaySchedule({ date, lessons });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDaySchedule(null);
  };

  const getLessonsForDate = (date) => {
    const dayName = getDayName(date);
    return allSchedule()[dayName] || [];
  };

  return (
    <div class={styles["schedule-management"]}>
      <h2>Расписание занятий</h2>

      {/* Селектор группы */}
      <div class={styles.controls}>
        <label for="group">Группа:</label>
        <select
          id="group"
          value={selectedGroup()}
          onChange={(e) => setSelectedGroup(e.target.value)}
          class={styles.select}
        >
          <option value="">Выберите группу</option>
          <For each={groups()}>
            {(group) => (
              <option value={group.id} key={group.id}>
                {group.name}
              </option>
            )}
          </For>
        </select>
      </div>

      {loading() ? (
        <div class={styles.loading}>Загрузка...</div>
      ) : error() ? (
        <div class={styles["error-message"]}>{error()}</div>
      ) : (
        <Show when={selectedGroup()}>
          {/* Навигация по неделям */}
          <div class={styles.weekNavigation}>
            <button onClick={goToPreviousWeek} class={styles.navButton}>
              &lt;
            </button>
            <div class={styles.currentMonthYear}>
              {getMonthYear(currentWeekDays()[0])} -{" "}
              {getMonthYear(currentWeekDays()[6])}
            </div>
            <button onClick={goToNextWeek} class={styles.navButton}>
              &gt;
            </button>
          </div>

          {/* Отображение календаря */}
          <div class={styles.calendarGrid}>
            <For each={daysOfWeek}>
              {(day) => (
                <div class={styles.dayHeader} key={day}>
                  {day.substring(0, 2).toUpperCase()}
                </div>
              )}
            </For>

            <For each={currentWeekDays()}>
              {(date) => {
                const lessons = getLessonsForDate(date);
                const hasLessons = lessons.length > 0;
                return (
                  <div
                    class={`${styles.calendarDay} ${
                      hasLessons ? styles.hasLessons : ""
                    }`}
                    onClick={() => openModal(date)}
                    key={date.toDateString()}
                  >
                    <div class={styles.dayNumber}>{getDayNumber(date)}</div>
                    <div class={styles.dayNameShort}>
                      {getDayName(date).substring(0, 2).toUpperCase()}
                    </div>
                    {hasLessons && <div class={styles.lessonIndicator}></div>}
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      )}

      {/* Модальное окно */}
      <Show when={showModal() && selectedDaySchedule()}>
        <div class={styles.modalBackdrop} onClick={closeModal}>
          <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>
              Расписание на{" "}
              {selectedDaySchedule().date.toLocaleDateString("ru-RU", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <Show
              when={selectedDaySchedule().lessons.length > 0}
              fallback={
                <p class={styles.emptySlot}>На этот день уроков нет.</p>
              }
            >
              <ul class={styles.lessonList}>
                <For each={selectedDaySchedule().lessons}>
                  {(lesson, index) => (
                    <li class={styles.lessonItem} key={lesson.id || index()}>
                      <span class={styles.lessonTime}>{lesson.time}:</span>{" "}
                      {lesson.subject}
                    </li>
                  )}
                </For>
              </ul>
            </Show>
            <button onClick={closeModal} class={styles.closeButton}>
              Закрыть
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
