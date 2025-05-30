const API_URL = "http://localhost:3000/api";

const checkServerAvailability = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "OPTIONS",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Ошибка при проверке доступности сервера:", error);
    return false;
  }
};

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorMessage = "Произошла ошибка";
    let errorDetails = null;

    try {
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
        errorDetails = error.details || error.error || null;
      }
    } catch (e) {
      console.error("Ошибка при чтении ответа:", e);
    }

    switch (response.status) {
      case 400:
        errorMessage = "Неверный запрос";
        break;
      case 401:
        errorMessage = "Неверные учетные данные";
        break;
      case 403:
        errorMessage = "Доступ запрещен";
        break;
      case 404:
        errorMessage = "Ресурс не найден";
        break;
      case 500:
        errorMessage = "Внутренняя ошибка сервера";
        if (errorDetails) {
          console.error("Детали ошибки сервера:", errorDetails);
        }
        break;
      default:
        errorMessage = `Ошибка сервера (${response.status})`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = errorDetails;
    throw error;
  }

  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (e) {
      console.error("Ошибка при парсинге JSON:", e);
      throw new Error("Неверный формат ответа от сервера");
    }
  }

  throw new Error("Неверный формат ответа от сервера");
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const login = async (credentials) => {
  try {
    const isServerAvailable = await checkServerAvailability();
    if (!isServerAvailable) {
      throw new Error(
        "Сервер недоступен. Пожалуйста, проверьте подключение к интернету и попробуйте снова."
      );
    }

    if (typeof credentials === "string") {
      credentials = { email: credentials, password: "" };
    }

    console.log("Отправка запроса на авторизацию:", {
      url: `${API_URL}/auth/login`,
      method: "POST",
      credentials: { ...credentials, password: "***" },
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Получен ответ:", response.status);

      console.log(
        "Заголовки ответа:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await handleResponse(response);
      console.log("Данные ответа:", {
        ...data,
        token: data.token ? "***" : null,
      });

      if (!data || !data.user) {
        throw new Error("Неверный формат ответа от сервера");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Превышено время ожидания ответа от сервера");
      }

      if (error.status === 500) {
        console.error("Детали ошибки сервера:", {
          status: error.status,
          details: error.details,
          message: error.message,
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Ошибка при входе:", error);

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Не удалось подключиться к серверу. Пожалуйста, проверьте подключение к интернету."
      );
    }

    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    await handleResponse(response);
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Ошибка при выходе:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Токен не найден");
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    throw error;
  }
};
