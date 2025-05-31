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

const daysOfWeek = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота"
];

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

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Доступ запрещен. Требуется роль администратора." });
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

apiRouter.get("/schedule/teacher", authenticateToken, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log("Получен запрос на расписание с параметрами:", { startDate, endDate });
    const baseSchedule = router.db.get("schedule").value();
    console.log("Базовое расписание из БД:", baseSchedule);

    const weekSchedule = daysOfWeek.map(day => {
      const dayTemplate = baseSchedule.find(s => s.day === day);
      
      if (!dayTemplate) {
        return {
          day,
          lessons: []
        };
      }

      const templateDate = new Date(dayTemplate.date);
      const requestStartDate = new Date(startDate);
      const requestEndDate = new Date(endDate);

      console.log("Проверка дат:", {
        day,
        templateDate: templateDate.toISOString(),
        requestStartDate: requestStartDate.toISOString(),
        requestEndDate: requestEndDate.toISOString()
      });

      if (templateDate >= requestStartDate && templateDate <= requestEndDate) {
        return {
          day,
          lessons: dayTemplate.lessons
        };
      }
      return {
        day,
        lessons: []
      };
    });

    console.log("Сформированное расписание на неделю:", weekSchedule);
    res.json(weekSchedule);
  } catch (error) {
    console.error("Ошибка при получении расписания:", error);
    res.status(500).json({ error: "Не удалось получить расписание" });
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

apiRouter.get("/homework/teacher", authenticateToken, (req, res) => {
  try {
    console.log("Получение домашних заданий для преподавателя:", req.user);
    const homework = router.db.get("homework").value();
    const teacherHomework = homework.filter(hw => hw.teacherId === req.user.id);
    console.log("Найденные домашние задания:", teacherHomework);
    res.json(teacherHomework);
  } catch (error) {
    console.error("Ошибка при получении домашних заданий:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/homeworkStatus/teacher", authenticateToken, (req, res) => {
  try {
    console.log("Получение статусов домашних заданий для преподавателя:", req.user);
    const homework = router.db.get("homework").value();
    const teacherHomework = homework.filter(hw => hw.teacherId === req.user.id);
    const homeworkIds = teacherHomework.map(hw => hw.id);
    
    const homeworkStatus = router.db
      .get("homeworkStatus")
      .filter(status => homeworkIds.includes(status.homeworkId))
      .value();

    console.log("Найденные статусы домашних заданий:", homeworkStatus);
    res.json(homeworkStatus);
  } catch (error) {
    console.error("Ошибка при получении статусов домашних заданий:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/groups", authenticateToken, (req, res) => {
  try {
    console.log("Получение списка групп:", req.user);
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

apiRouter.post("/homework/:homeworkId/grade", authenticateToken, (req, res) => {
  try {
    const { homeworkId } = req.params;
    const { studentId, grade, comment } = req.body;

    const homeworkStatus = router.db
      .get("homeworkStatus")
      .find({ homeworkId: parseInt(homeworkId), studentId: parseInt(studentId) })
      .value();

    if (!homeworkStatus) {
      return res.status(404).json({ message: "Работа не найдена" });
    }

    const updatedStatus = {
      ...homeworkStatus,
      grade,
      teacherComment: comment,
      gradedAt: new Date().toISOString()
    };

    router.db
      .get("homeworkStatus")
      .find({ id: homeworkStatus.id })
      .assign(updatedStatus)
      .write();

    res.json(updatedStatus);
  } catch (error) {
    console.error("Ошибка при выставлении оценки:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/homework/:homeworkId/file", authenticateToken, (req, res) => {
  try {
    const { homeworkId } = req.params;
    const homework = router.db
      .get("homework")
      .find({ id: parseInt(homeworkId) })
      .value();

    if (!homework || !homework.file) {
      return res.status(404).json({ message: "Файл не найден" });
    }

    res.json({ fileUrl: homework.file });
  } catch (error) {
    console.error("Ошибка при получении файла:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

apiRouter.get("/homework/:homeworkId/submission/:studentId/file", authenticateToken, (req, res) => {
  try {
    const { homeworkId, studentId } = req.params;
    const submission = router.db
      .get("homeworkStatus")
      .find({ 
        homeworkId: parseInt(homeworkId), 
        studentId: parseInt(studentId) 
      })
      .value();

    if (!submission || !submission.file) {
      return res.status(404).json({ message: "Файл не найден" });
    }

    res.json({ fileUrl: submission.file });
  } catch (error) {
    console.error("Ошибка при получении файла:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
  }
});

app.get("/api/export/xlsx", authenticateToken, async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
    res.send("Excel file content");
  } catch (error) {
    console.error("Ошибка при экспорте в Excel:", error);
    res.status(500).json({ error: "Ошибка при экспорте данных" });
  }
});

app.get("/api/export/pdf", authenticateToken, async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    res.send("PDF file content");
  } catch (error) {
    console.error("Ошибка при экспорте в PDF:", error);
    res.status(500).json({ error: "Ошибка при экспорте данных" });
  }
});

app.get("/api/rooms", authenticateToken, async (req, res) => {
  try {
    const rooms = router.db.get("rooms").value() || [];
    res.json(rooms);
  } catch (error) {
    console.error("Ошибка при получении аудиторий:", error);
    res.status(500).json({ error: "Ошибка при получении аудиторий" });
  }
});

app.put("/api/rooms", authenticateToken, async (req, res) => {
  try {
    const { id, isAvailable } = req.body;
    const room = router.db.get("rooms").find({ id }).value();
    
    if (!room) {
      return res.status(404).json({ error: "Аудитория не найдена" });
    }

    router.db.get("rooms")
      .find({ id })
      .assign({ isAvailable })
      .write();

    res.json({ message: "Статус аудитории обновлен" });
  } catch (error) {
    console.error("Ошибка при обновлении аудитории:", error);
    res.status(500).json({ error: "Ошибка при обновлении аудитории" });
  }
});

app.get("/api/schedule", authenticateToken, async (req, res) => {
  try {
    const { groupId, date } = req.query;
    let schedule = router.db.get("schedule").value() || [];
    
    if (groupId) {
      schedule = schedule.filter(s => s.groupId === parseInt(groupId));
    }
    
    if (date) {
      schedule = schedule.filter(s => s.date === date);
    }
    
    res.json(schedule);
  } catch (error) {
    console.error("Ошибка при получении расписания:", error);
    res.status(500).json({ error: "Ошибка при получении расписания" });
  }
});

app.post("/api/schedule", authenticateToken, async (req, res) => {
  try {
    const { groupId, teacherId, roomId, date, timeSlot, subject } = req.body;
    
    const conflicts = router.db.get("schedule")
      .filter(s => 
        (s.roomId === roomId || s.teacherId === teacherId) && 
        s.date === date && 
        s.timeSlot === timeSlot
      )
      .value();
    
    if (conflicts.length > 0) {
      return res.status(400).json({ 
        error: "Конфликт расписания",
        conflicts
      });
    }
    
    const newSchedule = {
      id: Date.now(),
      groupId,
      teacherId,
      roomId,
      date,
      timeSlot,
      subject
    };
    
    router.db.get("schedule")
      .push(newSchedule)
      .write();
    
    res.json({ message: "Расписание создано", schedule: newSchedule });
  } catch (error) {
    console.error("Ошибка при создании расписания:", error);
    res.status(500).json({ error: "Ошибка при создании расписания" });
  }
});

app.get("/api/substitutions", authenticateToken, async (req, res) => {
  try {
    const substitutions = router.db.get("substitutions").value() || [];
    res.json(substitutions);
  } catch (error) {
    console.error("Ошибка при получении замен:", error);
    res.status(500).json({ error: "Ошибка при получении замен" });
  }
});

app.post("/api/substitutions", authenticateToken, async (req, res) => {
  try {
    const { groupId, teacherId, date, reason } = req.body;
    
    const newSubstitution = {
      id: Date.now(),
      groupId,
      teacherId,
      date,
      reason,
      status: "pending"
    };
    
    router.db.get("substitutions")
      .push(newSubstitution)
      .write();
    
    res.json({ message: "Замена создана", substitution: newSubstitution });
  } catch (error) {
    console.error("Ошибка при создании замены:", error);
    res.status(500).json({ error: "Ошибка при создании замены" });
  }
});

app.get("/api/conflicts", authenticateToken, async (req, res) => {
  try {
    const conflicts = router.db.get("conflicts").value() || [];
    res.json(conflicts);
  } catch (error) {
    console.error("Ошибка при получении конфликтов:", error);
    res.status(500).json({ error: "Ошибка при получении конфликтов" });
  }
});

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
  console.log("- GET /api/schedule/teacher");
  console.log("- GET /api/homework/teacher");
  console.log("- GET /api/homeworkStatus/teacher");
  console.log("- POST /api/homework/:homeworkId/grade");
  console.log("- GET /api/homework/:homeworkId/file");
  console.log("- GET /api/homework/:homeworkId/submission/:studentId/file");
  console.log("- GET /api/export/xlsx");
  console.log("- GET /api/export/pdf");
  console.log("- GET /api/rooms");
  console.log("- PUT /api/rooms");
  console.log("- GET /api/schedule");
  console.log("- POST /api/schedule");
  console.log("- GET /api/substitutions");
  console.log("- POST /api/substitutions");
  console.log("- GET /api/conflicts");
});
