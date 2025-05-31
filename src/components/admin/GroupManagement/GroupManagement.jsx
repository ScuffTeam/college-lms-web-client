import { createSignal, createEffect } from "solid-js";
import styles from "./GroupManagement.module.css";
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiUserPlus, FiBarChart2, FiSearch, FiFilter } from "solid-icons/fi";

export function GroupManagement() {
  const [groups, setGroups] = createSignal([]);
  const [students, setStudents] = createSignal([]);
  const [teachers, setTeachers] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [isAddModalOpen, setIsAddModalOpen] = createSignal(false);
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = createSignal(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = createSignal(false);
  const [selectedGroup, setSelectedGroup] = createSignal(null);
  const [editedGroup, setEditedGroup] = createSignal(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filters, setFilters] = createSignal({
    curator: ""
  });
  const [isFilterOpen, setIsFilterOpen] = createSignal(false);

  const [newGroup, setNewGroup] = createSignal({
    name: "",
    curatorId: "",
    description: "",
    maxStudents: 30
  });

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/groups", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Ошибка при загрузке групп:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/users?role=student", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Ошибка при загрузке студентов:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/users?role=teacher", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Ошибка при загрузке преподавателей:", error);
    }
  };

  createEffect(() => {
    fetchGroups();
    fetchStudents();
    fetchTeachers();
  });

  const handleAddGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newGroup()),
      });
      
      if (response.ok) {
        setIsAddModalOpen(false);
        setNewGroup({
          name: "",
          curatorId: "",
          description: "",
          maxStudents: 30
        });
        fetchGroups();
      }
    } catch (error) {
      console.error("Ошибка при добавлении группы:", error);
    }
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setEditedGroup({ ...group });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/groups/${selectedGroup().id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editedGroup()),
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedGroup(null);
        setEditedGroup(null);
        fetchGroups();
      }
    } catch (error) {
      console.error("Ошибка при редактировании группы:", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (confirm("Вы уверены, что хотите удалить эту группу?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/groups/${groupId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchGroups();
        }
      } catch (error) {
        console.error("Ошибка при удалении группы:", error);
      }
    }
  };

  const openAssignModal = (group) => {
    setSelectedGroup(group);
    setIsAssignModalOpen(true);
  };

  const handleAssignStudents = async (studentIds) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/groups/${selectedGroup().id}/students`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ students: studentIds }),
      });
      
      if (response.ok) {
        setIsAssignModalOpen(false);
        setSelectedGroup(null);
        fetchGroups();
      }
    } catch (error) {
      console.error("Ошибка при назначении студентов:", error);
    }
  };

  const openPerformanceModal = (group) => {
    setSelectedGroup(group);
    setIsPerformanceModalOpen(true);
  };

  const filteredGroups = () => {
    return groups().filter(group => {
      const matchesSearch = searchQuery() === "" || 
        group.name.toLowerCase().includes(searchQuery().toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery().toLowerCase());
      
      const matchesCurator = filters().curator === "" || group.curatorId === filters().curator;

      return matchesSearch && matchesCurator;
    });
  };

  const getCuratorName = (curatorId) => {
    const curator = teachers().find(t => t.id === curatorId);
    return curator ? curator.name : "Не назначен";
  };

  const getStudentCount = (group) => {
    return group.students ? group.students.length : 0;
  };

  return (
    <div class={styles.container}>
      <div class={styles.header}>
        <h2>Управление группами</h2>
        <button
          class={styles["add-button"]}
          onClick={() => setIsAddModalOpen(true)}
        >
          <FiPlus size={20} />
          <span>Добавить группу</span>
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
            <label>Куратор:</label>
            <select
              value={filters().curator}
              onChange={(e) => setFilters({ ...filters(), curator: e.target.value })}
            >
              <option value="">Все кураторы</option>
              {teachers().map(teacher => (
                <option value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
          </div>
          <button
            class={styles["clear-filters"]}
            onClick={() => setFilters({ curator: "" })}
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {isLoading() && (
        <div class={styles["loading-state"]}>
          Загрузка групп...
        </div>
      )}

      {error() && (
        <div class={styles["error-state"]}>
          Ошибка при загрузке групп: {error()}
        </div>
      )}

      {!isLoading() && !error() && filteredGroups().length === 0 && (
        <div class={styles["empty-state"]}>
          Группы не найдены
        </div>
      )}

      {!isLoading() && !error() && filteredGroups().length > 0 && (
        <div class={styles["groups-grid"]}>
          {filteredGroups().map((group) => (
            <div class={styles["group-card"]}>
              <div class={styles["group-header"]}>
                <div class={styles["group-icon"]}>
                  <FiUsers size={24} />
                </div>
                <div class={styles["group-info"]}>
                  <h3>{group.name}</h3>
                  <p class={styles["group-curator"]}>Куратор: {getCuratorName(group.curatorId)}</p>
                </div>
              </div>
              <div class={styles["group-details"]}>
                <div class={styles["detail-item"]}>
                  <FiUsers size={16} />
                  <span>Студентов: {getStudentCount(group)}/{group.maxStudents}</span>
                </div>
              </div>
              <p class={styles["group-description"]}>{group.description}</p>
              <div class={styles["group-actions"]}>
                <button
                  class={styles["assign-button"]}
                  onClick={() => openAssignModal(group)}
                >
                  <FiUserPlus size={16} />
                  <span>Студенты</span>
                </button>
                <button
                  class={styles["performance-button"]}
                  onClick={() => openPerformanceModal(group)}
                >
                  <FiBarChart2 size={16} />
                  <span>Успеваемость</span>
                </button>
                <button
                  class={styles["edit-button"]}
                  onClick={() => openEditModal(group)}
                >
                  <FiEdit2 size={16} />
                  <span>Редактировать</span>
                </button>
                <button
                  class={styles["delete-button"]}
                  onClick={() => handleDeleteGroup(group.id)}
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
            <h3>Добавить группу</h3>
            <div class={styles["form-group"]}>
              <label>Название</label>
              <input
                type="text"
                value={newGroup().name}
                onInput={(e) =>
                  setNewGroup({ ...newGroup(), name: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Описание</label>
              <textarea
                value={newGroup().description}
                onInput={(e) =>
                  setNewGroup({ ...newGroup(), description: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Куратор</label>
              <select
                value={newGroup().curatorId}
                onChange={(e) =>
                  setNewGroup({ ...newGroup(), curatorId: e.target.value })
                }
              >
                <option value="">Выберите куратора</option>
                {teachers().map(teacher => (
                  <option value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div class={styles["form-group"]}>
              <label>Максимальное количество студентов</label>
              <input
                type="number"
                min="1"
                value={newGroup().maxStudents}
                onInput={(e) =>
                  setNewGroup({ ...newGroup(), maxStudents: parseInt(e.target.value) })
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
              <button class={styles["save-button"]} onClick={handleAddGroup}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen() && editedGroup() && (
        <div class={styles["modal-overlay"]}>
          <div class={styles.modal}>
            <h3>Редактировать группу</h3>
            <div class={styles["form-group"]}>
              <label>Название</label>
              <input
                type="text"
                value={editedGroup().name}
                onInput={(e) =>
                  setEditedGroup({ ...editedGroup(), name: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Описание</label>
              <textarea
                value={editedGroup().description}
                onInput={(e) =>
                  setEditedGroup({ ...editedGroup(), description: e.target.value })
                }
              />
            </div>
            <div class={styles["form-group"]}>
              <label>Куратор</label>
              <select
                value={editedGroup().curatorId}
                onChange={(e) =>
                  setEditedGroup({ ...editedGroup(), curatorId: e.target.value })
                }
              >
                <option value="">Выберите куратора</option>
                {teachers().map(teacher => (
                  <option value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div class={styles["form-group"]}>
              <label>Максимальное количество студентов</label>
              <input
                type="number"
                min="1"
                value={editedGroup().maxStudents}
                onInput={(e) =>
                  setEditedGroup({ ...editedGroup(), maxStudents: parseInt(e.target.value) })
                }
              />
            </div>
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedGroup(null);
                  setEditedGroup(null);
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

      {isAssignModalOpen() && selectedGroup() && (
        <div class={styles["modal-overlay"]}>
          <div class={styles.modal}>
            <h3>Управление студентами группы</h3>
            <div class={styles["students-list"]}>
              {students().map(student => (
                <div class={styles["student-item"]}>
                  <input
                    type="checkbox"
                    checked={selectedGroup().students?.includes(student.id)}
                    onChange={(e) => {
                      const newStudents = e.target.checked
                        ? [...(selectedGroup().students || []), student.id]
                        : (selectedGroup().students || []).filter(id => id !== student.id);
                      handleAssignStudents(newStudents);
                    }}
                  />
                  <span>{student.name}</span>
                </div>
              ))}
            </div>
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedGroup(null);
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {isPerformanceModalOpen() && selectedGroup() && (
        <div class={styles["modal-overlay"]}>
          <div class={styles.modal}>
            <h3>Успеваемость группы</h3>
            <div class={styles["performance-stats"]}>
              <div class={styles["stat-item"]}>
                <h4>Средний балл</h4>
                <div class={styles["stat-value"]}>4.2</div>
              </div>
              <div class={styles["stat-item"]}>
                <h4>Посещаемость</h4>
                <div class={styles["stat-value"]}>92%</div>
              </div>
              <div class={styles["stat-item"]}>
                <h4>Успеваемость</h4>
                <div class={styles["stat-value"]}>85%</div>
              </div>
            </div>
            <div class={styles["students-performance"]}>
              <h4>Успеваемость студентов</h4>
              <div class={styles["performance-list"]}>
                {selectedGroup().students?.map(studentId => {
                  const student = students().find(s => s.id === studentId);
                  return student ? (
                    <div class={styles["student-performance"]}>
                      <span class={styles["student-name"]}>{student.name}</span>
                      <div class={styles["performance-bars"]}>
                        <div class={styles["performance-bar"]} style={{ width: "85%" }}></div>
                        <span>4.5</span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div class={styles["modal-actions"]}>
              <button
                class={styles["cancel-button"]}
                onClick={() => {
                  setIsPerformanceModalOpen(false);
                  setSelectedGroup(null);
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