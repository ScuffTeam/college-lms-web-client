const express = require("express");
const cors = require("cors");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
const app = express();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json());

const JWT_SECRET = "$$$";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Недействительный токен" });
    }
    req.user = user;
    next();
  });
};

const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Доступ запрещен. Требуется роль студента." });
  }
  next();
};

const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res
      .status(403)
      .json({ message: "Доступ запрещен. Требуется роль преподавателя." });
  }
  next();
};

app.get("/", (req, res) => {
  res.json({
    message: "College LMS API Server",
    version: "1.0.0",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        me: "GET /api/auth/me",
      },
      student: {
        grades: "GET /api/grades",
        schedule: "GET /api/schedule",
        homework: "GET /api/homework",
      },
      teacher: {
        groups: "GET /api/groups",
      },
    },
  });
});

const apiRouter = express.Router();

apiRouter.post("/auth/login", (req, res) => {
  try {
    console.log("Получен запрос на авторизацию:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const users = router.db.get("users").value();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Ошибка при авторизации:", error);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.post("/auth/logout", (req, res) => {
  res.json({ message: "Успешный выход" });
});

apiRouter.get("/auth/me", authenticateToken, (req, res) => {
  try {
    const users = router.db.get("users").value();
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/grades", authenticateToken, isStudent, (req, res) => {
  try {
    console.log("Получение оценок для студента:", req.user);
    const grades = router.db.get("grades").value();
    const studentGrades = grades.filter(
      (grade) => grade.studentId === req.user.id
    );
    console.log("Найденные оценки:", studentGrades);
    res.json(studentGrades);
  } catch (error) {
    console.error("Ошибка при получении оценок:", error);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/schedule", authenticateToken, isStudent, (req, res) => {
  try {
    console.log("Получение расписания для студента:", req.user);
    const schedule = router.db.get("schedule").value();
    console.log("Найденное расписание:", schedule);
    res.json(schedule);
  } catch (error) {
    console.error("Ошибка при получении расписания:", error);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/homework", authenticateToken, isStudent, (req, res) => {
  try {
    console.log("Получение домашних заданий для студента:", req.user);

    const student = router.db.get("users").find({ id: req.user.id }).value();

    if (!student) {
      return res.status(404).json({ message: "Студент не найден" });
    }

    const homework = router.db
      .get("homework")
      .filter((hw) => hw.group === student.group && hw.status === "active")
      .value();

    const homeworkStatus = router.db
      .get("homeworkStatus")
      .filter((status) => status.studentId === req.user.id)
      .value();

    const homeworkWithStatus = homework.map((hw) => {
      const status = homeworkStatus.find((s) => s.homeworkId === hw.id);
      return {
        ...hw,
        status: status ? status.status : "pending",
        submittedAt: status ? status.submittedAt : null,
      };
    });

    console.log("Найденные домашние задания:", homeworkWithStatus);
    res.json(homeworkWithStatus);
  } catch (error) {
    console.error("Ошибка при получении домашних заданий:", error);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/groups", authenticateToken, isTeacher, (req, res) => {
  try {
    console.log("Получение списка групп для преподавателя:", req.user);
    const groups = router.db.get("groups").value();
    console.log("Найденные группы:", groups);
    res.json(groups);
  } catch (error) {
    console.error("Ошибка при получении списка групп:", error);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get(
  "/schedule/:groupId",
  authenticateToken,
  isTeacher,
  (req, res) => {
    try {
      console.log("Получение расписания для группы:", req.params.groupId);
      const groupId = parseInt(req.params.groupId);

      const group = router.db.get("groups").find({ id: groupId }).value();

      if (!group) {
        return res.status(404).json({ message: "Группа не найдена" });
      }

      const schedule = router.db
        .get("schedule")
        .filter((s) => s.groupId === groupId)
        .value();

      console.log("Найденное расписание:", schedule);
      res.json(schedule);
    } catch (error) {
      console.error("Ошибка при получении расписания группы:", error);
      res
        .status(500)
        .json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
  }
);

apiRouter.get(
  "/groups/:groupId/students",
  authenticateToken,
  isTeacher,
  (req, res) => {
    try {
      console.log("Получение списка студентов группы:", req.params.groupId);
      const groupId = parseInt(req.params.groupId);

      const group = router.db.get("groups").find({ id: groupId }).value();

      if (!group) {
        return res.status(404).json({ message: "Группа не найдена" });
      }

      const students = router.db
        .get("users")
        .filter(
          (user) => user.role === "student" && group.students.includes(user.id)
        )
        .value();

      console.log("Найденные студенты:", students);
      res.json(students);
    } catch (error) {
      console.error("Ошибка при получении списка студентов:", error);
      res
        .status(500)
        .json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
  }
);

app.use("/api", apiRouter);

app.use("/api", middlewares, router);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Маршрут не найден",
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error("Ошибка сервера:", err);
  res.status(500).json({
    message: "Внутренняя ошибка сервера",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
  console.log("Доступные эндпоинты:");
  console.log("- POST /api/auth/login");
  console.log("- POST /api/auth/logout");
  console.log("- GET /api/auth/me");
  console.log("- GET /api/grades");
  console.log("- GET /api/schedule");
  console.log("- GET /api/homework");
  console.log("- GET /api/groups");
  console.log("- GET /api/schedule/:groupId");
  console.log("- GET /api/groups/:groupId/students");
});
