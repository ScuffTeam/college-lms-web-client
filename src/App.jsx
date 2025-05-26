import { Router, Route, Navigate } from '@solidjs/router';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { useAuth } from './auth/AuthProvider';

function RootRedirect() {
    const { user } = useAuth();
    return <Navigate href={user()?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/login" component={LoginPage} />
        <Route
          path="/teacher/dashboard"
          component={() => (
            <RequireAuth role="teacher">
              <TeacherDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/teacher/homework"
          component={() => (
            <RequireAuth role="teacher">
              <TeacherDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/teacher/grades"
          component={() => (
            <RequireAuth role="teacher">
              <TeacherDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/teacher/schedule"
          component={() => (
            <RequireAuth role="teacher">
              <TeacherDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/student/*"
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
              <RootRedirect />
            </RequireAuth>
          )}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;