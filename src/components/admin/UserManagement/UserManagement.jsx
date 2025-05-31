import { createSignal, createEffect } from "solid-js";
import styles from "./UserManagement.module.css";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiMail, FiBook, FiUsers, FiSearch, FiFilter } from "solid-icons/fi";

export function UserManagement() {
  const [users, setUsers] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [isAddModalOpen, setIsAddModalOpen] = createSignal(false);
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
  const [selectedUser, setSelectedUser] = createSignal(null);
  const [editedUser, setEditedUser] = createSignal(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filters, setFilters] = createSignal({
    role: "",
    group: ""
  });
  const [isFilterOpen, setIsFilterOpen] = createSignal(false);
  const [newUser, setNewUser] = createSignal({
    name: "",
    email: "",
    password: "",
    role: "student",
    group: "",
    subjects: []
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Начинаем загрузку пользователей...");
      const response = await fetch("http://localhost:3000/api/users");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Полученные данные:", data);
      setUsers(data);
    } catch (error) {
      console.error("Ошибка при загрузке пользователей:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  createEffect(() => {
    fetchUsers();
  });

  const handleAddUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser()),
      });
      
      if (response.ok) {
        setIsAddModalOpen(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "student",
          group: "",
          subjects: []
        });
        fetchUsers();
      }
    } catch (error) {
      console.error("Ошибка при добавлении пользователя:", error);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${selectedUser().id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser()),
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEditedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Ошибка при редактировании пользователя:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FiUser size={20} />;
      case "teacher":
        return <FiBook size={20} />;
      case "student":
        return <FiUsers size={20} />;
      default:
        return <FiUser size={20} />;
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "teacher":
        return "Преподаватель";
      case "student":
        return "Студент";
      default:
        return role;
    }
  };

  const filteredUsers = () => {
    return users().filter(user => {
      const matchesSearch = searchQuery() === "" || 
        user.name.toLowerCase().includes(searchQuery().toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery().toLowerCase());
      
      const matchesRole = filters().role === "" || user.role === filters().role;
      const matchesGroup = filters().group === "" || user.group === filters().group;

      return matchesSearch && matchesRole && matchesGroup;
    });
  };

  const getUniqueGroups = () => {
    const groups = new Set(users().map(user => user.group).filter(Boolean));
    return Array.from(groups);
  };

  return (
    <div class={styles.container}>
      <div class={styles.header}>
        <h2>Управление пользователями</h2>
        <button
          class={styles["add-button"]}
          onClick={() => setIsAddModalOpen(true)}
        >
          <FiPlus size={20} />
          <span>Добавить пользователя</span>
        </button>
      </div>

      <div class={styles["search-filters"]}>
        <div class={styles["search-box"]}>
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
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
            <label>Роль:</label>
            <select
              value={filters().role}
              onChange={(e) => setFilters({ ...filters(), role: e.target.value })}
            >
              <option value="">Все роли</option>
              <option value="admin">Администратор</option>
              <option value="teacher">Преподаватель</option>
              <option value="student">Студент</option>
            </select>
          </div>
          <div class={styles["filter-group"]}>
            <label>Группа:</label>
            <select
              value={filters().group}
              onChange={(e) => setFilters({ ...filters(), group: e.target.value })}
            >
              <option value="">Все группы</option>
              {getUniqueGroups().map(group => (
                <option value={group}>{group}</option>
              ))}
            </select>
          </div>
          <button
            class={styles["clear-filters"]}
            onClick={() => setFilters({ role: "", group: "" })}
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {isLoading() && (
        <div class={styles["loading-state"]}>
          Загрузка пользователей...
        </div>
      )}

      {error() && (
        <div class={styles["error-state"]}>
          Ошибка при загрузке пользователей: {error()}
        </div>
      )}

      {!isLoading() && !error() && filteredUsers().length === 0 && (
        <div class={styles["empty-state"]}>
          Пользователи не найдены
        </div>
      )}

      {!isLoading() && !error() && filteredUsers().length > 0 && (
        <div class={styles["users-grid"]}>
          {filteredUsers().map((user) => (
            <div class={styles["user-card"]}>
              <div class={styles["user-header"]}>
                <div class={styles["user-avatar"]}>
                  {getRoleIcon(user.role)}
                </div>
                <div class={styles["user-info"]}>
                  <h3>{user.name}</h3>
                  <p class={styles["user-role"]}>{getRoleName(user.role)}</p>
                </div>
              </div>
              <div class={styles["user-details"]}>
                <div class={styles["detail-item"]}>
                  <FiMail size={16} />
                  <span>{user.email}</span>
                </div>
                {user.group && (
                  <div class={styles["detail-item"]}>
                    <FiUsers size={16} />
                    <span>{user.group}</span>
                  </div>
                )}
              </div>
              <div class={styles["user-actions"]}>
                <button
                  class={styles["edit-button"]}
                  onClick={() => openEditModal(user)}
                >
                  <FiEdit2 size={16} />
                  <span>Редактировать</span>
                </button>
                <button
                  class={styles["delete-button"]}
                  onClick={() => handleDeleteUser(user.id)}
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
            <h3>Добавить пользователя</h3>
            <div class={styles["form-group"]}>
              <label>Имя</label>
              <input
                type="text"
                value={newUser().name}
                onInput={(e) =>
                  setNewUser({ ...newUser(), name: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Email</label>
              <input
                type="email"
                value={newUser().email}
                onInput={(e) =>
                  setNewUser({ ...newUser(), email: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Пароль</label>
              <input
                type="password"
                value={newUser().password}
                onInput={(e) =>
                  setNewUser({ ...newUser(), password: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Роль</label>
              <select
                value={newUser().role}
                onChange={(e) =>
                  setNewUser({ ...newUser(), role: e.target.value })
                }
              >
                <option value="student">Студент</option>
                <option value="teacher">Преподаватель</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            {newUser().role === "student" && (
              <div class={styles["form-group"]}>
                <label>Группа</label>
                <input
                  type="text"
                  value={newUser().group}
                  onInput={(e) =>
                    setNewUser({ ...newUser(), group: e.target.value })
                  }
                />
              </div>
            )}
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => setIsAddModalOpen(false)}
              >
                Отмена
              </button>
              <button class={styles["save-button"]} onClick={handleAddUser}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen() && editedUser() && (
        <div class={styles["modal-overlay"]}>
          <div class={styles.modal}>
            <h3>Редактировать пользователя</h3>
            <div class={styles["form-group"]}>
              <label>Имя</label>
              <input
                type="text"
                value={editedUser().name}
                onInput={(e) =>
                  setEditedUser({ ...editedUser(), name: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Email</label>
              <input
                type="email"
                value={editedUser().email}
                onInput={(e) =>
                  setEditedUser({ ...editedUser(), email: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Роль</label>
              <select
                value={editedUser().role}
                onChange={(e) =>
                  setEditedUser({ ...editedUser(), role: e.target.value })
                }
              >
                <option value="student">Студент</option>
                <option value="teacher">Преподаватель</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            {editedUser().role === "student" && (
              <div class={styles["form-group"]}>
                <label>Группа</label>
                <input
                  type="text"
                  value={editedUser().group || ""}
                  onInput={(e) =>
                    setEditedUser({ ...editedUser(), group: e.target.value })
                  }
                />
              </div>
            )}
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                  setEditedUser(null);
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
    </div>
  );
} 