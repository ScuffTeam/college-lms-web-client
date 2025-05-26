import { Router, Route } from '@solidjs/router';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/login" component={LoginPage} />
        <Route
          path="/teacher"
          component={() => (
            <RequireAuth role="teacher">
              <TeacherDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/student"
          component={() => (
            <RequireAuth role="student">
              <StudentDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/"
          component={() => (
            <RequireAuth>
              <div>Главная страница</div>
            </RequireAuth>
          )}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;