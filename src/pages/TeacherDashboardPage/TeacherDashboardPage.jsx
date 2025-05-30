import { useAuth } from "../../auth/AuthProvider";
import { useLocation, A, useNavigate } from "@solidjs/router";
import { ScheduleAndGrades } from "../../components/teacher/ScheduleAndGrades/ScheduleAndGrades";
import HomeworkManagement from "../../components/teacher/HomeworkManagement/HomeworkManagement";
import styles from "./TeacherDashboardPage.module.css";
import { createSignal } from "solid-js";
import {
  FiHome,
  FiCalendar,
  FiBook,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "solid-icons/fi";
import { ProfileModal } from "../../components/teacher/ProfileModal/ProfileModal";

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = createSignal(false);

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

  const renderContent = () => {
    const path = location.pathname.split("/").pop();
    switch (path) {
      case "homework":
        return <HomeworkManagement />;
      case "grades":
      case "schedule":
        return <ScheduleAndGrades />;
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
              <FiBarChart2 size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Студенты</h3>
              <div class={styles["stat-value"]}>120</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "75%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>
                Всего студентов в группах
              </div>
            </div>
          </div>

          <div class={styles["stat-card"]}>
            <div class={styles["stat-icon"]}>
              <FiClock size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Посещаемость</h3>
              <div class={styles["stat-value"]}>85%</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "85%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>
                Средняя посещаемость занятий
              </div>
            </div>
          </div>

          <div class={styles["stat-card"]}>
            <div class={styles["stat-icon"]}>
              <FiFileText size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Домашние задания</h3>
              <div class={styles["stat-value"]}>24</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "60%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>Активных заданий</div>
            </div>
          </div>

          <div class={styles["stat-card"]}>
            <div class={styles["stat-icon"]}>
              <FiCalendar size={32} />
            </div>
            <div class={styles["stat-content"]}>
              <h3>Занятия</h3>
              <div class={styles["stat-value"]}>8</div>
              <div class={styles["stat-progress"]}>
                <div
                  class={styles["progress-bar"]}
                  style={{ width: "40%" }}
                ></div>
              </div>
              <div class={styles["stat-description"]}>Занятий сегодня</div>
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
                <h4>Оценки обновлены</h4>
                <p>Выставили оценки по предмету "Математика"</p>
                <div class={styles["activity-time"]}>2 часа назад</div>
              </div>
            </div>

            <div class={styles["activity-item"]}>
              <div class={styles["activity-icon"]}>
                <FiFileText size={24} />
              </div>
              <div class={styles["activity-content"]}>
                <h4>Новое домашнее задание</h4>
                <p>Добавлено задание по предмету "Физика"</p>
                <div class={styles["activity-time"]}>5 часов назад</div>
              </div>
            </div>

            <div class={styles["activity-item"]}>
              <div class={styles["activity-icon"]}>
                <FiAlertCircle size={24} />
              </div>
              <div class={styles["activity-content"]}>
                <h4>Изменение в расписании</h4>
                <p>Перенесено занятие по предмету "Химия"</p>
                <div class={styles["activity-time"]}>Вчера</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header class={styles.header}>
        <div class={styles["header-content"]}>
          <A href="/teacher/dashboard" class={styles.logo}>
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
              href="/teacher/dashboard"
              class={`${styles["nav-item"]} ${
                isActive("dashboard") ? styles.active : ""
              }`}
            >
              <FiHome size={20} />
              <span>Главная</span>
            </A>
            <A
              href="/teacher/schedule"
              class={`${styles["nav-item"]} ${
                isActive("schedule") || isActive("grades") ? styles.active : ""
              }`}
            >
              <FiCalendar size={20} />
              <span>Расписание и оценки</span>
            </A>
            <A
              href="/teacher/homework"
              class={`${styles["nav-item"]} ${
                isActive("homework") ? styles.active : ""
              }`}
            >
              <FiFileText size={20} />
              <span>Домашние задания</span>
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

      <div class={styles["teacher-dashboard"]}>
        <div class={styles["dashboard-content"]}>{renderContent()}</div>
      </div>

      {isProfileModalOpen() && (
        <ProfileModal onClose={handleCloseProfileModal} />
      )}
    </>
  );
}
