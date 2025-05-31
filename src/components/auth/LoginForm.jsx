import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../../auth/AuthProvider";
import styles from "./LoginForm.module.css";
import { FiUser, FiBook, FiShield } from "solid-icons/fi";

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credentials = {
        email: email(),
        password: password(),
      };

      if (!credentials.email || !credentials.password) {
        throw new Error("Пожалуйста, заполните все поля");
      }

      const response = await login(credentials);

      if (response && response.user) {
        const userRole = response.user.role;
        navigate(`/${userRole}/dashboard`);
      } else {
        throw new Error("Неверный ответ от сервера");
      }
    } catch (error) {
      console.error("LoginForm: Ошибка при отправке формы:", error);
      setError(error.message || "Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError(null);
    setLoading(true);

    try {
      let testCredentials;
      switch (role) {
        case "student":
          testCredentials = {
            email: "student@example.com",
            password: "1",
          };
          break;
        case "teacher":
          testCredentials = {
            email: "teacher@example.com",
            password: "1",
          };
          break;
        case "admin":
          testCredentials = {
            email: "admin@example.com",
            password: "1",
          };
          break;
        default:
          throw new Error("Неизвестная роль");
      }

      const response = await login(testCredentials);

      if (response && response.user) {
        const userRole = response.user.role;
        if (userRole === role) {
          navigate(`/${role}/dashboard`);
        } else {
          throw new Error(`Ожидалась роль ${role}, получена ${userRole}`);
        }
      } else {
        throw new Error("Неверный ответ от сервера");
      }
    } catch (error) {
      console.error("LoginForm: Ошибка при быстром входе:", error);
      let errorMessage = "Ошибка при входе";

      if (error.message.includes("HTTP error")) {
        errorMessage = "Сервер недоступен. Пожалуйста, попробуйте позже.";
      } else if (error.message.includes("Неверный формат ответа")) {
        errorMessage = "Ошибка сервера. Пожалуйста, попробуйте позже.";
      } else if (error.message.includes("Неизвестная роль")) {
        errorMessage = "Ошибка в системе. Пожалуйста, сообщите администратору.";
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class={styles.form}>
      <div class={styles.formContent}>
        <h2>Вход в систему</h2>

        {error() && <div class={styles.error}>{error()}</div>}

        <div class={styles.formGroup}>
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            required
            placeholder="Введите ваш email"
            class={styles.input}
          />
        </div>

        <div class={styles.formGroup}>
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            required
            placeholder="Введите ваш пароль"
            class={styles.input}
          />
        </div>

        <button type="submit" class={styles.submitButton} disabled={loading()}>
          {loading() ? "Вход..." : "Войти"}
        </button>

        <div class={styles.quickLoginButtons}>
          <button
            type="button"
            class={`${styles.quickLoginButton} ${styles.studentButton}`}
            onClick={() => handleQuickLogin("student")}
            disabled={loading()}
          >
            <FiUser size={20} />
            Быстрый вход как студент
          </button>
          <button
            type="button"
            class={`${styles.quickLoginButton} ${styles.teacherButton}`}
            onClick={() => handleQuickLogin("teacher")}
            disabled={loading()}
          >
            <FiBook size={20} />
            Быстрый вход как преподаватель
          </button>
          <button
            type="button"
            class={`${styles.quickLoginButton} ${styles.adminButton}`}
            onClick={() => handleQuickLogin("admin")}
            disabled={loading()}
          >
            <FiShield size={20} />
            Быстрый вход как администратор
          </button>
        </div>
      </div>
    </form>
  );
}
