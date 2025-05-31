import { useAuth } from "../../auth/AuthProvider";
import { useLocation, A, useNavigate } from "@solidjs/router";
import styles from "./AdminDashboardPage.module.css";
import { createSignal, createEffect, Show } from "solid-js";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
  FiBookOpen,
  FiDownload,
  FiMapPin,
  FiRefreshCw,
  FiAlertTriangle,
  FiStar,
  FiBell,
  FiDatabase,
} from "solid-icons/fi";
import { ProfileModal } from "../../components/admin/ProfileModal/ProfileModal";
import { UserManagement } from "../../components/admin/UserManagement/UserManagement";
import { CourseManagement } from "../../components/admin/CourseManagement/CourseManagement";
import { GroupManagement } from "../../components/admin/GroupManagement/GroupManagement";

export function AdminDashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = createSignal(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = createSignal(false);
  const [selectedAnalyticsType, setSelectedAnalyticsType] = createSignal(null);
  const [isExporting, setIsExporting] = createSignal(false);
  const [scheduleData, setScheduleData] = createSignal({
    groups: [],
    rooms: [],
    teachers: [],
    schedule: [],
    substitutions: [],
    conflicts: []
  });

  const [selectedDate, setSelectedDate] = createSignal(new Date());
  const [selectedGroup, setSelectedGroup] = createSignal(null);
  const [selectedRoom, setSelectedRoom] = createSignal(null);
  const [selectedTeacher, setSelectedTeacher] = createSignal(null);

  const timeSlots = [
    "8:30-10:00",
    "10:10-11:40",
    "12:00-13:30",
    "13:40-15:10",
    "15:20-16:50",
    "17:00-18:30"
  ];

  const [selectedTimeSlot, setSelectedTimeSlot] = createSignal(null);
  const [selectedSubject, setSelectedSubject] = createSignal(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen());
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleAnalyticsClick = (type) => {
    setSelectedAnalyticsType(type);
    setIsAnalyticsModalOpen(true);
  };

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:3000/api/export/${format}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при экспорте данных");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Ошибка при экспорте:", error);
      alert("Произошла ошибка при экспорте данных");
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    const path = location.pathname.split("/").pop();
    switch (path) {
      case "users":
        return <UserManagement />;
      case "courses":
        return <CourseManagement />;
      case "groups":
        return <GroupManagement />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  function DashboardOverview() {
    return (
      <div class={styles["dashboard-overview"]}>
        <div class={styles["stats-grid"]}>
          <div class={styles["stat-card"]}>
            <div class={styles["stat-icon"]}>
              <FiUsers size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Пользователи</h3>
              <div class={styles["stat-value"]}>250</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "75%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>
                Всего пользователей в системе
              </div>
            </div>
          </div>

          <div class={styles["stat-card"]}>
            <div class={styles["stat-icon"]}>
              <FiBook size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Курсы</h3>
              <div class={styles["stat-value"]}>15</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "85%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>
                Активных курсов
              </div>
            </div>
          </div>

          <div class={styles["stat-card"]}>
            <div class={styles["stat-icon"]}>
              <FiBarChart2 size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Активность</h3>
              <div class={styles["stat-value"]}>89%</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "89%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>
                Средняя активность пользователей
              </div>
            </div>
          </div>

          <div class={styles["stat-card"]}>
            <div class={styles["stat-icon"]}>
              <FiSettings size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Система</h3>
              <div class={styles["stat-value"]}>100%</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "100%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>
                Стабильность работы
              </div>
            </div>
          </div>
        </div>

        <div class={styles["analytics-section"]}>
          <h2>Аналитика и отчеты</h2>
          <div class={styles["analytics-grid"]}>
            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiTrendingUp size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Общая статистика успеваемости</h3>
                <div class={styles["analytics-stats"]}>
                  <div class={styles["analytics-stat"]}>
                    <span>Средний балл</span>
                    <strong>4.2</strong>
                  </div>
                  <div class={styles["analytics-stat"]}>
                    <span>Успеваемость</span>
                    <strong>85%</strong>
                  </div>
                  <div class={styles["analytics-stat"]}>
                    <span>Качество знаний</span>
                    <strong>78%</strong>
                  </div>
                </div>
                <button 
                  class={styles["analytics-button"]}
                  onClick={() => handleAnalyticsClick("performance")}
                >
                  Подробнее
                </button>
              </div>
            </div>

            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiCalendar size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Отчеты по посещаемости</h3>
                <div class={styles["analytics-stats"]}>
                  <div class={styles["analytics-stat"]}>
                    <span>Средняя посещаемость</span>
                    <strong>92%</strong>
                  </div>
                  <div class={styles["analytics-stat"]}>
                    <span>Пропуски</span>
                    <strong>8%</strong>
                  </div>
                  <div class={styles["analytics-stat"]}>
                    <span>По уважительной причине</span>
                    <strong>5%</strong>
                  </div>
                </div>
                <button 
                  class={styles["analytics-button"]}
                  onClick={() => handleAnalyticsClick("attendance")}
                >
                  Подробнее
                </button>
              </div>
            </div>

            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiBookOpen size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Анализ успеваемости по предметам</h3>
                <div class={styles["subject-stats"]}>
                  <div class={styles["subject-stat"]}>
                    <span>Математика</span>
                    <div class={styles["progress-bar"]}>
                      <div style={{ width: "85%" }}></div>
                    </div>
                    <strong>4.5</strong>
                  </div>
                  <div class={styles["subject-stat"]}>
                    <span>Физика</span>
                    <div class={styles["progress-bar"]}>
                      <div style={{ width: "78%" }}></div>
                    </div>
                    <strong>4.2</strong>
                  </div>
                  <div class={styles["subject-stat"]}>
                    <span>Информатика</span>
                    <div class={styles["progress-bar"]}>
                      <div style={{ width: "92%" }}></div>
                    </div>
                    <strong>4.8</strong>
                  </div>
                </div>
                <button 
                  class={styles["analytics-button"]}
                  onClick={() => handleAnalyticsClick("subjects")}
                >
                  Подробнее
                </button>
              </div>
            </div>

            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiDownload size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Экспорт данных</h3>
                <div class={styles["export-options"]}>
                  <button 
                    class={styles["export-button"]}
                    onClick={() => handleExport("xlsx")}
                    disabled={isExporting()}
                  >
                    <FiDownload size={16} />
                    <span>Экспорт в Excel</span>
                  </button>
                  <button 
                    class={styles["export-button"]}
                    onClick={() => handleExport("pdf")}
                    disabled={isExporting()}
                  >
                    <FiDownload size={16} />
                    <span>Экспорт в PDF</span>
                  </button>
                </div>
                <div class={styles["export-info"]}>
                  <p>Последний экспорт: {new Date().toLocaleDateString()}</p>
                  <p>Доступные отчеты:</p>
                  <ul>
                    <li>Общая успеваемость</li>
                    <li>Посещаемость</li>
                    <li>Успеваемость по предметам</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class={styles["analytics-section"]}>
          <h2>Управление расписанием</h2>
          <div class={styles["analytics-grid"]}>
            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiCalendar size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Создание расписания</h3>
                <div class={styles["schedule-stats"]}>
                  <div class={styles["schedule-stat"]}>
                    <span>Активных групп</span>
                    <strong>12</strong>
                  </div>
                  <div class={styles["schedule-stat"]}>
                    <span>Занятий в неделю</span>
                    <strong>48</strong>
                  </div>
                  <div class={styles["schedule-stat"]}>
                    <span>Преподавателей</span>
                    <strong>8</strong>
                  </div>
                </div>
                <button 
                  class={styles["analytics-button"]}
                  onClick={() => handleAnalyticsClick("schedule")}
                >
                  Создать расписание
                </button>
              </div>
            </div>

            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiMapPin size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Управление аудиториями</h3>
                <div class={styles["room-stats"]}>
                  <div class={styles["room-stat"]}>
                    <span>Всего аудиторий</span>
                    <strong>15</strong>
                  </div>
                  <div class={styles["room-stat"]}>
                    <span>Занятых</span>
                    <strong>12</strong>
                  </div>
                  <div class={styles["room-stat"]}>
                    <span>Свободных</span>
                    <strong>3</strong>
                  </div>
                </div>
                <button 
                  class={styles["analytics-button"]}
                  onClick={() => handleAnalyticsClick("rooms")}
                >
                  Управлять аудиториями
                </button>
              </div>
            </div>

            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiRefreshCw size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Управление заменами</h3>
                <div class={styles["substitution-stats"]}>
                  <div class={styles["substitution-stat"]}>
                    <span>Замен на неделю</span>
                    <strong>5</strong>
                  </div>
                  <div class={styles["substitution-stat"]}>
                    <span>Ожидают подтверждения</span>
                    <strong>2</strong>
                  </div>
                  <div class={styles["substitution-stat"]}>
                    <span>Выполнено замен</span>
                    <strong>3</strong>
                  </div>
                </div>
                <button 
                  class={styles["analytics-button"]}
                  onClick={() => handleAnalyticsClick("substitutions")}
                >
                  Управлять заменами
                </button>
              </div>
            </div>

            <div class={styles["analytics-card"]}>
              <div class={styles["analytics-icon"]}>
                <FiAlertTriangle size={24} />
              </div>
              <div class={styles["analytics-content"]}>
                <h3>Конфликты расписания</h3>
                <div class={styles["conflict-stats"]}>
                  <div class={styles["conflict-stat"]}>
                    <span>Активных конфликтов</span>
                    <strong>2</strong>
                  </div>
                  <div class={styles["conflict-stat"]}>
                    <span>По аудиториям</span>
                    <strong>1</strong>
                  </div>
                  <div class={styles["conflict-stat"]}>
                    <span>По преподавателям</span>
                    <strong>1</strong>
                  </div>
                </div>
                <button 
                  class={styles["analytics-button"]}
                  onClick={() => handleAnalyticsClick("conflicts")}
                >
                  Просмотреть конфликты
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class={styles["recent-activity"]}>
          <h2>Последние действия</h2>
          <div class={styles["activity-list"]}>
            <div class={styles["activity-item"]}>
              <div class={styles["activity-icon"]}>
                <FiCheckCircle size={24} />
              </div>
              <div class={styles["activity-content"]}>
                <h4>Новый пользователь</h4>
                <p>Зарегистрирован новый преподаватель</p>
                <div class={styles["activity-time"]}>2 часа назад</div>
              </div>
            </div>

            <div class={styles["activity-item"]}>
              <div class={styles["activity-icon"]}>
                <FiBook size={24} />
              </div>
              <div class={styles["activity-content"]}>
                <h4>Новый курс</h4>
                <p>Добавлен новый курс "Математический анализ"</p>
                <div class={styles["activity-time"]}>5 часов назад</div>
              </div>
            </div>

            <div class={styles["activity-item"]}>
              <div class={styles["activity-icon"]}>
                <FiAlertCircle size={24} />
              </div>
              <div class={styles["activity-content"]}>
                <h4>Обновление системы</h4>
                <p>Выполнено обновление до версии 2.1.0</p>
                <div class={styles["activity-time"]}>Вчера</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Загрузка данных при открытии модального окна
  createEffect(() => {
    if (isAnalyticsModalOpen()) {
      fetchScheduleData();
    }
  });

  const fetchScheduleData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [groupsRes, roomsRes, teachersRes, scheduleRes, substitutionsRes, conflictsRes] = await Promise.all([
        fetch("http://localhost:3000/api/groups", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/users?role=teacher", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/schedule", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/substitutions", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:3000/api/conflicts", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [groups, rooms, teachers, schedule, substitutions, conflicts] = await Promise.all([
        groupsRes.json(),
        roomsRes.json(),
        teachersRes.json(),
        scheduleRes.json(),
        substitutionsRes.json(),
        conflictsRes.json()
      ]);

      setScheduleData({
        groups,
        rooms,
        teachers,
        schedule,
        substitutions,
        conflicts
      });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };

  const handleCreateSchedule = async (scheduleData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании расписания");
      }

      await fetchScheduleData();
      setIsAnalyticsModalOpen(false);
    } catch (error) {
      console.error("Ошибка при создании расписания:", error);
    }
  };

  const handleManageRooms = async (roomData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/rooms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении аудитории");
      }

      await fetchScheduleData();
    } catch (error) {
      console.error("Ошибка при обновлении аудитории:", error);
    }
  };

  const handleManageSubstitutions = async (substitutionData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/substitutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(substitutionData)
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании замены");
      }

      await fetchScheduleData();
    } catch (error) {
      console.error("Ошибка при создании замены:", error);
    }
  };

  const renderModalContent = () => {
    switch (selectedAnalyticsType()) {
      case "schedule":
        return (
          <div class={styles["schedule-modal"]}>
            <div class={styles["schedule-filters"]}>
              <div class={styles["filter-group"]}>
                <label>Группа:</label>
                <select 
                  value={selectedGroup()?.id} 
                  onChange={(e) => setSelectedGroup(scheduleData().groups.find(g => g.id === parseInt(e.target.value)))}
                >
                  <option value="">Выберите группу</option>
                  {scheduleData().groups.map(group => (
                    <option value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div class={styles["filter-group"]}>
                <label>Преподаватель:</label>
                <select 
                  value={selectedTeacher()?.id}
                  onChange={(e) => setSelectedTeacher(scheduleData().teachers.find(t => t.id === parseInt(e.target.value)))}
                >
                  <option value="">Выберите преподавателя</option>
                  {scheduleData().teachers.map(teacher => (
                    <option value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div class={styles["filter-group"]}>
                <label>Предмет:</label>
                <select 
                  value={selectedSubject()}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Выберите предмет</option>
                  {selectedGroup()?.subjects?.map(subject => (
                    <option value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div class={styles["filter-group"]}>
                <label>Аудитория:</label>
                <select 
                  value={selectedRoom()?.id}
                  onChange={(e) => setSelectedRoom(scheduleData().rooms.find(r => r.id === parseInt(e.target.value)))}
                >
                  <option value="">Выберите аудиторию</option>
                  {scheduleData().rooms
                    .filter(room => room.isAvailable)
                    .map(room => (
                      <option value={room.id}>{room.name} (вместимость: {room.capacity})</option>
                    ))}
                </select>
              </div>
              <div class={styles["filter-group"]}>
                <label>Дата:</label>
                <input 
                  type="date" 
                  value={selectedDate().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
            </div>

            <div class={styles["schedule-grid"]}>
              {timeSlots.map(slot => (
                <div 
                  class={`${styles["time-slot"]} ${selectedTimeSlot() === slot ? styles.selected : ''}`}
                  onClick={() => setSelectedTimeSlot(slot)}
                >
                  <div class={styles["time-slot-header"]}>{slot}</div>
                  {scheduleData().schedule
                    .filter(s => s.timeSlot === slot && s.date === selectedDate().toISOString().split('T')[0])
                    .map(schedule => (
                      <div class={styles["schedule-item"]}>
                        <div>Группа: {scheduleData().groups.find(g => g.id === schedule.groupId)?.name}</div>
                        <div>Предмет: {schedule.subject}</div>
                        <div>Аудитория: {scheduleData().rooms.find(r => r.id === schedule.roomId)?.name}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            <button 
              class={styles["schedule-save"]}
              disabled={!selectedGroup() || !selectedTeacher() || !selectedRoom() || !selectedSubject() || !selectedTimeSlot()}
              onClick={() => handleCreateSchedule({
                groupId: selectedGroup()?.id,
                teacherId: selectedTeacher()?.id,
                roomId: selectedRoom()?.id,
                subject: selectedSubject(),
                date: selectedDate().toISOString().split('T')[0],
                timeSlot: selectedTimeSlot()
              })}
            >
              Сохранить расписание
            </button>
          </div>
        );

      case "rooms":
        return (
          <div class={styles["rooms-modal"]}>
            <div class={styles["rooms-list"]}>
              {scheduleData().rooms.map(room => (
                <div class={styles["room-item"]}>
                  <h4>{room.name}</h4>
                  <p>Вместимость: {room.capacity}</p>
                  <p>Статус: {room.isAvailable ? "Свободна" : "Занята"}</p>
                  <button 
                    onClick={() => handleManageRooms({
                      id: room.id,
                      isAvailable: !room.isAvailable
                    })}
                  >
                    {room.isAvailable ? "Занять" : "Освободить"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "substitutions":
        return (
          <div class={styles["substitutions-modal"]}>
            <div class={styles["substitution-form"]}>
              <div class={styles["form-group"]}>
                <label>Группа:</label>
                <select 
                  value={selectedGroup()?.id}
                  onChange={(e) => setSelectedGroup(scheduleData().groups.find(g => g.id === parseInt(e.target.value)))}
                >
                  <option value="">Выберите группу</option>
                  {scheduleData().groups.map(group => (
                    <option value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div class={styles["form-group"]}>
                <label>Преподаватель:</label>
                <select 
                  value={selectedTeacher()?.id}
                  onChange={(e) => setSelectedTeacher(scheduleData().teachers.find(t => t.id === parseInt(e.target.value)))}
                >
                  <option value="">Выберите преподавателя</option>
                  {scheduleData().teachers.map(teacher => (
                    <option value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div class={styles["form-group"]}>
                <label>Дата:</label>
                <input 
                  type="date" 
                  value={selectedDate().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
              <button 
                onClick={() => handleManageSubstitutions({
                  groupId: selectedGroup()?.id,
                  teacherId: selectedTeacher()?.id,
                  date: selectedDate()
                })}
              >
                Создать замену
              </button>
            </div>
            <div class={styles["substitutions-list"]}>
              {scheduleData().substitutions.map(substitution => (
                <div class={styles["substitution-item"]}>
                  <h4>Замена для группы {substitution.groupName}</h4>
                  <p>Преподаватель: {substitution.teacherName}</p>
                  <p>Дата: {new Date(substitution.date).toLocaleDateString()}</p>
                  <p>Статус: {substitution.status}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "conflicts":
        return (
          <div class={styles["conflicts-modal"]}>
            <div class={styles["conflicts-list"]}>
              {scheduleData().conflicts.map(conflict => (
                <div class={styles["conflict-item"]}>
                  <h4>{conflict.type === "room" ? "Конфликт аудитории" : "Конфликт преподавателя"}</h4>
                  <p>{conflict.description}</p>
                  <p>Дата: {new Date(conflict.date).toLocaleDateString()}</p>
                  <p>Статус: {conflict.status}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <header class={styles.header}>
        <div class={styles["header-content"]}>
          <A href="/admin/dashboard" class={styles.logo}>
            <div class={styles["logo-icon"]}>LMS</div>
            <span>Learning Management System</span>
          </A>

          <button
            class={styles["mobile-menu-button"]}
            onClick={toggleMobileMenu}
          >
            <FiMenu size={24} />
          </button>

          <nav
            class={`${styles["nav-menu"]} ${
              isMobileMenuOpen() ? styles.active : ""
            }`}
          >
            <A
              href="/admin/dashboard"
              class={`${styles["nav-item"]} ${
                isActive("dashboard") ? styles.active : ""
              }`}
            >
              <FiHome size={20} />
              <span>Главная</span>
            </A>
            <A
              href="/admin/users"
              class={`${styles["nav-item"]} ${
                isActive("users") ? styles.active : ""
              }`}
            >
              <FiUsers size={20} />
              <span>Пользователи</span>
            </A>
            <A
              href="/admin/courses"
              class={`${styles["nav-item"]} ${
                isActive("courses") ? styles.active : ""
              }`}
            >
              <FiBook size={20} />
              <span>Курсы</span>
            </A>
            <A
              href="/admin/groups"
              class={`${styles["nav-item"]} ${
                isActive("groups") ? styles.active : ""
              }`}
            >
              <FiUsers size={20} />
              <span>Группы</span>
            </A>
            <A
              href="/admin/settings"
              class={`${styles["nav-item"]} ${
                isActive("settings") ? styles.active : ""
              }`}
            >
              <FiSettings size={20} />
              <span>Настройки</span>
            </A>
          </nav>

          <div
            class={`${styles["user-menu"]} ${
              isMobileMenuOpen() ? styles.active : ""
            }`}
          >
            <div class={styles["user-info"]} onClick={handleProfileClick}>
              <div class={styles["user-avatar"]}>
                {getInitials(user()?.name)}
              </div>
              <span class={styles["user-name"]}>{user()?.name}</span>
            </div>
            <button class={styles["logout-button"]} onClick={handleLogout}>
              <FiLogOut size={18} />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div class={styles["admin-dashboard"]}>
        <div class={styles["dashboard-content"]}>{renderContent()}</div>
      </div>

      {isProfileModalOpen() && (
        <ProfileModal onClose={handleCloseProfileModal} />
      )}

      {isAnalyticsModalOpen() && (
        <div class={styles.modal}>
          <div class={styles["modal-content"]}>
            <h2>
              {selectedAnalyticsType() === "performance" && "Общая статистика успеваемости"}
              {selectedAnalyticsType() === "attendance" && "Отчеты по посещаемости"}
              {selectedAnalyticsType() === "subjects" && "Анализ успеваемости по предметам"}
              {selectedAnalyticsType() === "schedule" && "Создание расписания"}
              {selectedAnalyticsType() === "rooms" && "Управление аудиториями"}
              {selectedAnalyticsType() === "substitutions" && "Управление заменами"}
              {selectedAnalyticsType() === "conflicts" && "Конфликты расписания"}
            </h2>
            {renderModalContent()}
            <button 
              class={styles["modal-close"]}
              onClick={() => setIsAnalyticsModalOpen(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsPage() {
  const [selectedSetting, setSelectedSetting] = createSignal(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const settings = [
    {
      id: "grades",
      title: "Настройка системы оценок",
      icon: FiStar,
      description: "Настройка шкалы оценок, весов и критериев оценивания",
      color: "#3498db"
    },
    {
      id: "roles",
      title: "Управление ролями и правами",
      icon: FiUsers,
      description: "Настройка ролей пользователей и их прав доступа",
      color: "#2ecc71"
    },
    {
      id: "notifications",
      title: "Настройка уведомлений",
      icon: FiBell,
      description: "Управление системой уведомлений и оповещений",
      color: "#f1c40f"
    },
    {
      id: "backup",
      title: "Резервное копирование данных",
      icon: FiDatabase,
      description: "Настройка автоматического резервного копирования",
      color: "#e74c3c"
    }
  ];

  const handleSettingClick = (setting) => {
    setSelectedSetting(setting);
    setIsModalOpen(true);
  };

  const renderModalContent = () => {
    switch (selectedSetting()?.id) {
      case "grades":
        return (
          <div class={styles["settings-modal"]}>
            <div class={styles["settings-section"]}>
              <h3>Шкала оценок</h3>
              <div class={styles["grades-scale"]}>
                <div class={styles["grade-item"]}>
                  <span>Отлично</span>
                  <input type="number" min="1" max="5" value="5" />
                </div>
                <div class={styles["grade-item"]}>
                  <span>Хорошо</span>
                  <input type="number" min="1" max="5" value="4" />
                </div>
                <div class={styles["grade-item"]}>
                  <span>Удовлетворительно</span>
                  <input type="number" min="1" max="5" value="3" />
                </div>
                <div class={styles["grade-item"]}>
                  <span>Неудовлетворительно</span>
                  <input type="number" min="1" max="5" value="2" />
                </div>
              </div>
            </div>

            <div class={styles["settings-section"]}>
              <h3>Веса оценок</h3>
              <div class={styles["grade-weights"]}>
                <div class={styles["weight-item"]}>
                  <span>Экзамен</span>
                  <input type="number" min="0" max="100" value="40" />
                </div>
                <div class={styles["weight-item"]}>
                  <span>Зачет</span>
                  <input type="number" min="0" max="100" value="30" />
                </div>
                <div class={styles["weight-item"]}>
                  <span>Контрольная работа</span>
                  <input type="number" min="0" max="100" value="20" />
                </div>
                <div class={styles["weight-item"]}>
                  <span>Домашняя работа</span>
                  <input type="number" min="0" max="100" value="10" />
                </div>
              </div>
            </div>

            <button class={styles["settings-save"]}>Сохранить настройки</button>
          </div>
        );

      case "roles":
        return (
          <div class={styles["settings-modal"]}>
            <div class={styles["settings-section"]}>
              <h3>Роли пользователей</h3>
              <div class={styles["roles-list"]}>
                <div class={styles["role-item"]}>
                  <div class={styles["role-header"]}>
                    <h4>Администратор</h4>
                    <span class={styles["role-badge"]}>Системная роль</span>
                  </div>
                  <div class={styles["role-permissions"]}>
                    <label>
                      <input type="checkbox" checked />
                      Полный доступ к системе
                    </label>
                  </div>
                </div>

                <div class={styles["role-item"]}>
                  <div class={styles["role-header"]}>
                    <h4>Преподаватель</h4>
                    <span class={styles["role-badge"]}>Пользовательская роль</span>
                  </div>
                  <div class={styles["role-permissions"]}>
                    <label>
                      <input type="checkbox" checked />
                      Управление курсами
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Выставление оценок
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Просмотр статистики
                    </label>
                  </div>
                </div>

                <div class={styles["role-item"]}>
                  <div class={styles["role-header"]}>
                    <h4>Студент</h4>
                    <span class={styles["role-badge"]}>Пользовательская роль</span>
                  </div>
                  <div class={styles["role-permissions"]}>
                    <label>
                      <input type="checkbox" checked />
                      Просмотр курсов
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Сдача заданий
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Просмотр оценок
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button class={styles["settings-save"]}>Сохранить настройки</button>
          </div>
        );

      case "notifications":
        return (
          <div class={styles["settings-modal"]}>
            <div class={styles["settings-section"]}>
              <h3>Настройка уведомлений</h3>
              <div class={styles["notifications-settings"]}>
                <div class={styles["notification-group"]}>
                  <h4>Email уведомления</h4>
                  <div class={styles["notification-options"]}>
                    <label>
                      <input type="checkbox" checked />
                      Новые оценки
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Напоминания о дедлайнах
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Изменения в расписании
                    </label>
                  </div>
                </div>

                <div class={styles["notification-group"]}>
                  <h4>Системные уведомления</h4>
                  <div class={styles["notification-options"]}>
                    <label>
                      <input type="checkbox" checked />
                      Новые сообщения
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Обновления курсов
                    </label>
                    <label>
                      <input type="checkbox" checked />
                      Системные оповещения
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button class={styles["settings-save"]}>Сохранить настройки</button>
          </div>
        );

      case "backup":
        return (
          <div class={styles["settings-modal"]}>
            <div class={styles["settings-section"]}>
              <h3>Настройка резервного копирования</h3>
              <div class={styles["backup-settings"]}>
                <div class={styles["backup-option"]}>
                  <h4>Расписание копирования</h4>
                  <select>
                    <option>Ежедневно</option>
                    <option>Еженедельно</option>
                    <option>Ежемесячно</option>
                  </select>
                </div>

                <div class={styles["backup-option"]}>
                  <h4>Время копирования</h4>
                  <input type="time" value="03:00" />
                </div>

                <div class={styles["backup-option"]}>
                  <h4>Хранение копий</h4>
                  <select>
                    <option>7 дней</option>
                    <option>30 дней</option>
                    <option>90 дней</option>
                  </select>
                </div>

                <div class={styles["backup-actions"]}>
                  <button class={styles["backup-button"]}>
                    Создать резервную копию сейчас
                  </button>
                  <button class={styles["backup-button"]}>
                    Восстановить из копии
                  </button>
                </div>
              </div>
            </div>

            <div class={styles["settings-section"]}>
              <h3>Последние копии</h3>
              <div class={styles["backup-list"]}>
                <div class={styles["backup-item"]}>
                  <div class={styles["backup-info"]}>
                    <span>backup_2024_03_20_03_00.zip</span>
                    <span>20.03.2024 03:00</span>
                  </div>
                  <div class={styles["backup-size"]}>245 MB</div>
                </div>
                <div class={styles["backup-item"]}>
                  <div class={styles["backup-info"]}>
                    <span>backup_2024_03_19_03_00.zip</span>
                    <span>19.03.2024 03:00</span>
                  </div>
                  <div class={styles["backup-size"]}>242 MB</div>
                </div>
              </div>
            </div>

            <button class={styles["settings-save"]}>Сохранить настройки</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div class={styles["settings-page"]}>
      <h2>Системные настройки</h2>
      <div class={styles["settings-grid"]}>
        {settings.map(setting => (
          <div 
            class={styles["settings-card"]}
            onClick={() => handleSettingClick(setting)}
          >
            <div 
              class={styles["settings-icon"]}
              style={{ background: `${setting.color}20`, color: setting.color }}
            >
              <setting.icon size={32} />
            </div>
            <div class={styles["settings-content"]}>
              <h3>{setting.title}</h3>
              <p>{setting.description}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen() && (
        <div class={styles.modal}>
          <div class={styles["modal-content"]}>
            <h2>{selectedSetting()?.title}</h2>
            {renderModalContent()}
            <button 
              class={styles["modal-close"]}
              onClick={() => setIsModalOpen(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 