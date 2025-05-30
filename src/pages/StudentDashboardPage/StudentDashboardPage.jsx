import { useAuth } from "../../auth/AuthProvider";
import { useLocation, A, useNavigate } from "@solidjs/router";
import { ScheduleList } from "../../components/student/ScheduleList/ScheduleList";
import { GradesList } from "../../components/student/GradesList/GradesList";
import { HomeworkList } from "../../components/student/HomeworkList/HomeworkList";
import styles from "./StudentDashboardPage.module.css";
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
import { ProfileModal } from "../../components/student/ProfileModal/ProfileModal";

export function StudentDashboardPage() {
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
        return <HomeworkList />;
      case "grades":
        return <GradesList />;
      case "schedule":
        return <ScheduleList />;
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

  return (
    <>
      <header class={styles.header}>
        <div class={styles["header-content"]}>
          <A href="/student" class={styles.logo}>
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
              href="/student"
              class={`${styles["nav-item"]} ${
                isActive("student") &&
                !isActive("schedule") &&
                !isActive("grades") &&
                !isActive("homework")
                  ? styles.active
                  : ""
              }`}
            >
              <FiHome size={20} />
              <span>Главная</span>
            </A>
            <A
              href="/student/schedule"
              class={`${styles["nav-item"]} ${
                isActive("schedule") ? styles.active : ""
              }`}
            >
              <FiCalendar size={20} />
              <span>Расписание</span>
            </A>
            <A
              href="/student/grades"
              class={`${styles["nav-item"]} ${
                isActive("grades") ? styles.active : ""
              }`}
            >
              <FiBook size={20} />
              <span>Оценки</span>
            </A>
            <A
              href="/student/homework"
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

      <div class={styles["student-dashboard"]}>
        <div class={styles["dashboard-content"]}>{renderContent()}</div>
      </div>

      {isProfileModalOpen() && (
        <ProfileModal onClose={handleCloseProfileModal} />
      )}
    </>
  );
}

function DashboardOverview() {
  const stats = {
    averageGrade: 4.5,
    attendance: 85,
    completedHomework: 12,
    totalHomework: 15,
    upcomingDeadlines: 3,
  };

  return (
    <div class={styles["dashboard-overview"]}>
      <div class={styles["stats-grid"]}>
        <div class={styles["stat-card"]}>
          <div class={styles["stat-icon"]}>
            <FiBarChart2 size={32} />
          </div>
          <div class={styles["stat-content"]}>
            <h3>Средний балл</h3>
            <div class={styles["stat-value"]}>{stats.averageGrade}</div>
            <div class={styles["stat-progress"]}>
              <div
                class={styles["progress-bar"]}
                style={{ width: `${(stats.averageGrade / 5) * 100}%` }}
              />
            </div>
            <div class={styles["stat-description"]}>из 5.0 возможных</div>
          </div>
        </div>

        <div class={styles["stat-card"]}>
          <div class={styles["stat-icon"]}>
            <FiClock size={32} />
          </div>
          <div class={styles["stat-content"]}>
            <h3>Посещаемость</h3>
            <div class={styles["stat-value"]}>{stats.attendance}%</div>
            <div class={styles["stat-progress"]}>
              <div
                class={styles["progress-bar"]}
                style={{ width: `${stats.attendance}%` }}
              />
            </div>
            <div class={styles["stat-description"]}>за последний месяц</div>
          </div>
        </div>

        <div class={styles["stat-card"]}>
          <div class={styles["stat-icon"]}>
            <FiCheckCircle size={32} />
          </div>
          <div class={styles["stat-content"]}>
            <h3>Домашние задания</h3>
            <div class={styles["stat-value"]}>
              {stats.completedHomework}/{stats.totalHomework}
            </div>
            <div class={styles["stat-progress"]}>
              <div
                class={styles["progress-bar"]}
                style={{
                  width: `${
                    (stats.completedHomework / stats.totalHomework) * 100
                  }%`,
                }}
              />
            </div>
            <div class={styles["stat-description"]}>выполнено заданий</div>
          </div>
        </div>

        <div class={styles["stat-card"]}>
          <div class={styles["stat-icon"]}>
            <FiAlertCircle size={32} />
          </div>
          <div class={styles["stat-content"]}>
            <h3>Сроки сдачи</h3>
            <div class={styles["stat-value"]}>{stats.upcomingDeadlines}</div>
            <div class={styles["stat-description"]}>предстоящих дедлайнов</div>
          </div>
        </div>
      </div>

      <div class={styles["recent-activity"]}>
        <h2>Последняя активность</h2>
        <div class={styles["activity-list"]}>
          <div class={styles["activity-item"]}>
            <div class={styles["activity-icon"]}>
              <FiBook size={24} />
            </div>
            <div class={styles["activity-content"]}>
              <h4>Математика</h4>
              <p>Получена оценка 5 за контрольную работу</p>
              <span class={styles["activity-time"]}>2 часа назад</span>
            </div>
          </div>
          <div class={styles["activity-item"]}>
            <div class={styles["activity-icon"]}>
              <FiFileText size={24} />
            </div>
            <div class={styles["activity-content"]}>
              <h4>Физика</h4>
              <p>Сдано домашнее задание №5</p>
              <span class={styles["activity-time"]}>Вчера</span>
            </div>
          </div>
          <div class={styles["activity-item"]}>
            <div class={styles["activity-icon"]}>
              <FiCalendar size={24} />
            </div>
            <div class={styles["activity-content"]}>
              <h4>Расписание</h4>
              <p>Изменено время занятия по программированию</p>
              <span class={styles["activity-time"]}>2 дня назад</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
