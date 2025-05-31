import { useAuth } from "../../../auth/AuthProvider";
import styles from "./ProfileModal.module.css";
import { createSignal } from "solid-js";
import { FiX, FiEdit2, FiSave, FiUser, FiMail, FiPhone } from "solid-icons/fi";

export function ProfileModal(props) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = createSignal(false);
  const [editedName, setEditedName] = createSignal(user()?.name || "");
  const [editedEmail, setEditedEmail] = createSignal(user()?.email || "");
  const [editedPhone, setEditedPhone] = createSignal(user()?.phone || "");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
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

  return (
    <div class={styles["modal-overlay"]} onClick={props.onClose}>
      <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button class={styles["close-button"]} onClick={props.onClose}>
          <FiX size={24} />
        </button>

        <div class={styles["profile-header"]}>
          <div class={styles["profile-avatar"]}>
            {getInitials(user()?.name)}
          </div>
          <h2>{user()?.name}</h2>
          <p class={styles["profile-role"]}>Администратор</p>
        </div>

        <div class={styles["profile-content"]}>
          <div class={styles["profile-section"]}>
            <h3>Информация о профиле</h3>
            <div class={styles["profile-info"]}>
              <div class={styles["info-item"]}>
                <div class={styles["info-icon"]}>
                  <FiUser size={20} />
                </div>
                {isEditing() ? (
                  <input
                    type="text"
                    value={editedName()}
                    onInput={(e) => setEditedName(e.target.value)}
                    class={styles["edit-input"]}
                  />
                ) : (
                  <div class={styles["info-content"]}>
                    <span class={styles["info-label"]}>Имя</span>
                    <span class={styles["info-value"]}>{user()?.name}</span>
                  </div>
                )}
              </div>

              <div class={styles["info-item"]}>
                <div class={styles["info-icon"]}>
                  <FiMail size={20} />
                </div>
                {isEditing() ? (
                  <input
                    type="email"
                    value={editedEmail()}
                    onInput={(e) => setEditedEmail(e.target.value)}
                    class={styles["edit-input"]}
                  />
                ) : (
                  <div class={styles["info-content"]}>
                    <span class={styles["info-label"]}>Email</span>
                    <span class={styles["info-value"]}>{user()?.email}</span>
                  </div>
                )}
              </div>

              <div class={styles["info-item"]}>
                <div class={styles["info-icon"]}>
                  <FiPhone size={20} />
                </div>
                {isEditing() ? (
                  <input
                    type="tel"
                    value={editedPhone()}
                    onInput={(e) => setEditedPhone(e.target.value)}
                    class={styles["edit-input"]}
                  />
                ) : (
                  <div class={styles["info-content"]}>
                    <span class={styles["info-label"]}>Телефон</span>
                    <span class={styles["info-value"]}>
                      {user()?.phone || "Не указан"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div class={styles["profile-actions"]}>
          {isEditing() ? (
            <button class={styles["save-button"]} onClick={handleSave}>
              <FiSave size={18} />
              <span>Сохранить</span>
            </button>
          ) : (
            <button class={styles["edit-button"]} onClick={handleEdit}>
              <FiEdit2 size={18} />
              <span>Редактировать</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
