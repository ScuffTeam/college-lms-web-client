import { createSignal, createEffect } from "solid-js";
import styles from "./CourseManagement.module.css";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBook,
  FiCalendar,
  FiClock,
  FiUsers,
  FiSearch,
  FiFilter,
} from "solid-icons/fi";

export function CourseManagement() {
  const [courses, setCourses] = createSignal([]);
  const [teachers, setTeachers] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [isAddModalOpen, setIsAddModalOpen] = createSignal(false);
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = createSignal(false);
  const [selectedCourse, setSelectedCourse] = createSignal(null);
  const [editedCourse, setEditedCourse] = createSignal(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filters, setFilters] = createSignal({
    semester: "",
    teacher: "",
  });
  const [isFilterOpen, setIsFilterOpen] = createSignal(false);

  const [newCourse, setNewCourse] = createSignal({
    name: "",
    description: "",
    semester: "",
    teacherId: "",
    schedule: [],
    maxStudents: 30,
    credits: 3,
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/courses");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Ошибка при загрузке курсов:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/users?role=teacher"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Ошибка при загрузке преподавателей:", error);
    }
  };

  createEffect(() => {
    fetchCourses();
    fetchTeachers();
  });

  const handleAddCourse = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCourse()),
      });

      if (response.ok) {
        setIsAddModalOpen(false);
        setNewCourse({
          name: "",
          description: "",
          semester: "",
          teacherId: "",
          schedule: [],
          maxStudents: 30,
          credits: 3,
        });
        fetchCourses();
      }
    } catch (error) {
      console.error("Ошибка при добавлении курса:", error);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setEditedCourse({ ...course });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/${selectedCourse().id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedCourse()),
        }
      );

      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedCourse(null);
        setEditedCourse(null);
        fetchCourses();
      }
    } catch (error) {
      console.error("Ошибка при редактировании курса:", error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (confirm("Вы уверены, что хотите удалить этот курс?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/courses/${courseId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchCourses();
        }
      } catch (error) {
        console.error("Ошибка при удалении курса:", error);
      }
    }
  };

  const openScheduleModal = (course) => {
    setSelectedCourse(course);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (schedule) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/${selectedCourse().id}/schedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ schedule }),
        }
      );

      if (response.ok) {
        setIsScheduleModalOpen(false);
        setSelectedCourse(null);
        fetchCourses();
      }
    } catch (error) {
      console.error("Ошибка при сохранении расписания:", error);
    }
  };

  const filteredCourses = () => {
    return courses().filter((course) => {
      const matchesSearch =
        searchQuery() === "" ||
        course.name.toLowerCase().includes(searchQuery().toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery().toLowerCase());

      const matchesSemester =
        filters().semester === "" || course.semester === filters().semester;
      const matchesTeacher =
        filters().teacher === "" || course.teacherId === filters().teacher;

      return matchesSearch && matchesSemester && matchesTeacher;
    });
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers().find((t) => t.id === teacherId);
    return teacher ? teacher.name : "Не назначен";
  };

  return (
    <div class={styles.container}>
      <div class={styles.header}>
        <h2>Управление курсами</h2>
        <button
          class={styles["add-button"]}
          onClick={() => setIsAddModalOpen(true)}
        >
          <FiPlus size={20} />
          <span>Добавить курс</span>
        </button>
      </div>

      <div class={styles["search-filters"]}>
        <div class={styles["search-box"]}>
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          class={styles["filter-button"]}
          onClick={() => setIsFilterOpen(!isFilterOpen())}
        >
          <FiFilter size={20} />
          <span>Фильтры</span>
        </button>
      </div>

      {isFilterOpen() && (
        <div class={styles["filters-panel"]}>
          <div class={styles["filter-group"]}>
            <label>Семестр:</label>
            <select
              value={filters().semester}
              onChange={(e) =>
                setFilters({ ...filters(), semester: e.target.value })
              }
            >
              <option value="">Все семестры</option>
              <option value="1">1 семестр</option>
              <option value="2">2 семестр</option>
              <option value="3">3 семестр</option>
              <option value="4">4 семестр</option>
            </select>
          </div>
          <div class={styles["filter-group"]}>
            <label>Преподаватель:</label>
            <select
              value={filters().teacher}
              onChange={(e) =>
                setFilters({ ...filters(), teacher: e.target.value })
              }
            >
              <option value="">Все преподаватели</option>
              {teachers().map((teacher) => (
                <option value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          <button
            class={styles["clear-filters"]}
            onClick={() => setFilters({ semester: "", teacher: "" })}
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {isLoading() && (
        <div class={styles["loading-state"]}>Загрузка курсов...</div>
      )}

      {error() && (
        <div class={styles["error-state"]}>
          Ошибка при загрузке курсов: {error()}
        </div>
      )}

      {!isLoading() && !error() && filteredCourses().length === 0 && (
        <div class={styles["empty-state"]}>Курсы не найдены</div>
      )}

      {!isLoading() && !error() && filteredCourses().length > 0 && (
        <div class={styles["courses-grid"]}>
          {filteredCourses().map((course) => (
            <div class={styles["course-card"]}>
              <div class={styles["course-header"]}>
                <div class={styles["course-icon"]}>
                  <FiBook size={24} />
                </div>
                <div class={styles["course-info"]}>
                  <h3>{course.name}</h3>
                  <p class={styles["course-semester"]}>
                    Семестр {course.semester}
                  </p>
                </div>
              </div>
              <div class={styles["course-details"]}>
                <div class={styles["detail-item"]}>
                  <FiUsers size={16} />
                  <span>Преподаватель: {getTeacherName(course.teacherId)}</span>
                </div>
                <div class={styles["detail-item"]}>
                  <FiClock size={16} />
                  <span>Кредиты: {course.credits}</span>
                </div>
                <div class={styles["detail-item"]}>
                  <FiUsers size={16} />
                  <span>Макс. студентов: {course.maxStudents}</span>
                </div>
              </div>
              <p class={styles["course-description"]}>{course.description}</p>
              <div class={styles["course-actions"]}>
                <button
                  class={styles["schedule-button"]}
                  onClick={() => openScheduleModal(course)}
                >
                  <FiCalendar size={16} />
                  <span>Расписание</span>
                </button>
                <button
                  class={styles["edit-button"]}
                  onClick={() => openEditModal(course)}
                >
                  <FiEdit2 size={16} />
                  <span>Редактировать</span>
                </button>
                <button
                  class={styles["delete-button"]}
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <FiTrash2 size={16} />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen() && (
        <div class={styles["modal-overlay"]}>
          <div class={styles.modal}>
            <h3>Добавить курс</h3>
            <div class={styles["form-group"]}>
              <label>Название</label>
              <input
                type="text"
                value={newCourse().name}
                onInput={(e) =>
                  setNewCourse({ ...newCourse(), name: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Описание</label>
              <textarea
                value={newCourse().description}
                onInput={(e) =>
                  setNewCourse({ ...newCourse(), description: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Семестр</label>
              <select
                value={newCourse().semester}
                onChange={(e) =>
                  setNewCourse({ ...newCourse(), semester: e.target.value })
                }
              >
                <option value="1">1 семестр</option>
                <option value="2">2 семестр</option>
                <option value="3">3 семестр</option>
                <option value="4">4 семестр</option>
              </select>
            </div>
            <div class={styles["form-group"]}>
              <label>Преподаватель</label>
              <select
                value={newCourse().teacherId}
                onChange={(e) =>
                  setNewCourse({ ...newCourse(), teacherId: e.target.value })
                }
              >
                <option value="">Выберите преподавателя</option>
                {teachers().map((teacher) => (
                  <option value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div class={styles["form-group"]}>
              <label>Кредиты</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newCourse().credits}
                onInput={(e) =>
                  setNewCourse({
                    ...newCourse(),
                    credits: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Максимальное количество студентов</label>
              <input
                type="number"
                min="1"
                value={newCourse().maxStudents}
                onInput={(e) =>
                  setNewCourse({
                    ...newCourse(),
                    maxStudents: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => setIsAddModalOpen(false)}
              >
                Отмена
              </button>
              <button class={styles["save-button"]} onClick={handleAddCourse}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen() && editedCourse() && (
        <div class={styles["modal-overlay"]}>
          <div class={styles.modal}>
            <h3>Редактировать курс</h3>
            <div class={styles["form-group"]}>
              <label>Название</label>
              <input
                type="text"
                value={editedCourse().name}
                onInput={(e) =>
                  setEditedCourse({ ...editedCourse(), name: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Описание</label>
              <textarea
                value={editedCourse().description}
                onInput={(e) =>
                  setEditedCourse({
                    ...editedCourse(),
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Семестр</label>
              <select
                value={editedCourse().semester}
                onChange={(e) =>
                  setEditedCourse({
                    ...editedCourse(),
                    semester: e.target.value,
                  })
                }
              >
                <option value="1">1 семестр</option>
                <option value="2">2 семестр</option>
                <option value="3">3 семестр</option>
                <option value="4">4 семестр</option>
              </select>
            </div>
            <div class={styles["form-group"]}>
              <label>Преподаватель</label>
              <select
                value={editedCourse().teacherId}
                onChange={(e) =>
                  setEditedCourse({
                    ...editedCourse(),
                    teacherId: e.target.value,
                  })
                }
              >
                <option value="">Выберите преподавателя</option>
                {teachers().map((teacher) => (
                  <option value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div class={styles["form-group"]}>
              <label>Кредиты</label>
              <input
                type="number"
                min="1"
                max="10"
                value={editedCourse().credits}
                onInput={(e) =>
                  setEditedCourse({
                    ...editedCourse(),
                    credits: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Максимальное количество студентов</label>
              <input
                type="number"
                min="1"
                value={editedCourse().maxStudents}
                onInput={(e) =>
                  setEditedCourse({
                    ...editedCourse(),
                    maxStudents: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCourse(null);
                  setEditedCourse(null);
                }}
              >
                Отмена
              </button>
              <button class={styles["save-button"]} onClick={handleSaveEdit}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {isScheduleModalOpen() && selectedCourse() && (
        <div class={styles["modal-overlay"]}>
          <div class={styles.modal}>
            <h3>Расписание занятий</h3>
            <div class={styles["schedule-grid"]}>
              {["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"].map(
                (day) => (
                  <div class={styles["schedule-day"]}>
                    <h4>{day}</h4>
                    <div class={styles["time-slots"]}>
                      {[
                        "9:00",
                        "10:30",
                        "12:00",
                        "13:30",
                        "15:00",
                        "16:30",
                      ].map((time) => (
                        <div class={styles["time-slot"]}>
                          <input
                            type="checkbox"
                            checked={selectedCourse().schedule.some(
                              (s) => s.day === day && s.time === time
                            )}
                            onChange={(e) => {
                              const newSchedule = e.target.checked
                                ? [...selectedCourse().schedule, { day, time }]
                                : selectedCourse().schedule.filter(
                                    (s) => !(s.day === day && s.time === time)
                                  );
                              handleSaveSchedule(newSchedule);
                            }}
                          />
                          <span>{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setSelectedCourse(null);
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
