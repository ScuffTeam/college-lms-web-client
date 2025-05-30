import { createSignal, onMount } from "solid-js";
import { apiClient } from "../../../api/client";
import styles from "./ProfileModal.module.css";
import { FiX, FiUser, FiMail, FiPhone, FiLock, FiSave } from "solid-icons/fi";

export function ProfileModal(props) {
  const [profile, setProfile] = createSignal({
    email: "",
    phone: "",
    avatar: null,
  });
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [success, setSuccess] = createSignal(null);
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [previewUrl, setPreviewUrl] = createSignal(null);
  const [passwords, setPasswords] = createSignal({
    current: "",
    new: "",
    confirm: "",
  });

  onMount(async () => {
    try {
      const data = await apiClient.get("/users/me");
      setProfile(data);
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
      setError("Не удалось загрузить данные профиля");
    } finally {
      setLoading(false);
    }
  });

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (passwords().new && passwords().new !== passwords().confirm) {
        setError("Новые пароли не совпадают");
        return;
      }

      const formData = new FormData();
      formData.append("email", profile().email);
      formData.append("phone", profile().phone);
      if (selectedFile()) {
        formData.append("avatar", selectedFile());
      }
      if (passwords().new) {
        formData.append("currentPassword", passwords().current);
        formData.append("newPassword", passwords().new);
      }

      await apiClient.put("/users/me", formData);
      setSuccess("Профиль успешно обновлен");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      setError("Не удалось обновить профиль");
    }
  };

  return (
    <div class={styles["modalOverlay"]} onClick={props.onClose}>
      <div class={styles["modal"]} onClick={(e) => e.stopPropagation()}>
        <div class={styles["modalHeader"]}>
          <h3>Личный кабинет</h3>
          <button class={styles["closeButton"]} onClick={props.onClose}>
            <FiX size={24} />
          </button>
        </div>
        <div class={styles["modalContent"]}>
          {loading() ? (
            <div class={styles["loading"]}>Загрузка...</div>
          ) : (
            <form onSubmit={handleSubmit} class={styles["profile-form"]}>
              <div class={styles["avatar-section"]}>
                <div class={styles["avatar-preview"]}>
                  {previewUrl() ? (
                    <img src={previewUrl()} alt="Preview" />
                  ) : profile().avatar ? (
                    <img src={profile().avatar} alt="Avatar" />
                  ) : (
                    <FiUser size={48} />
                  )}
                </div>
              </div>

              <div class={styles["form-group"]}>
                <label>
                  <FiMail size={20} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={profile().email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Введите email"
                />
              </div>

              <div class={styles["form-group"]}>
                <label>
                  <FiPhone size={20} />
                  <span>Телефон</span>
                </label>
                <input
                  type="tel"
                  value={profile().phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Введите номер телефона"
                />
              </div>

              <div class={styles["password-section"]}>
                <h4>Изменить пароль</h4>
                <div class={styles["form-group"]}>
                  <label>
                    <FiLock size={20} />
                    <span>Текущий пароль</span>
                  </label>
                  <input
                    type="password"
                    value={passwords().current}
                    onChange={(e) =>
                      handlePasswordChange("current", e.target.value)
                    }
                    placeholder="Введите текущий пароль"
                  />
                </div>

                <div class={styles["form-group"]}>
                  <label>
                    <FiLock size={20} />
                    <span>Новый пароль</span>
                  </label>
                  <input
                    type="password"
                    value={passwords().new}
                    onChange={(e) =>
                      handlePasswordChange("new", e.target.value)
                    }
                    placeholder="Введите новый пароль"
                  />
                </div>

                <div class={styles["form-group"]}>
                  <label>
                    <FiLock size={20} />
                    <span>Подтвердите пароль</span>
                  </label>
                  <input
                    type="password"
                    value={passwords().confirm}
                    onChange={(e) =>
                      handlePasswordChange("confirm", e.target.value)
                    }
                    placeholder="Повторите новый пароль"
                  />
                </div>
              </div>

              {error() && <div class={styles["error-message"]}>{error()}</div>}
              {success() && (
                <div class={styles["success-message"]}>{success()}</div>
              )}

              <button type="submit" class={styles["save-button"]}>
                <FiSave size={20} />
                <span>Сохранить изменения</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
