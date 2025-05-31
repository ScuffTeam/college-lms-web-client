import { Router, Route, Navigate } from '@solidjs/router';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage/TeacherDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage/AdminDashboardPage';
import { useAuth } from './auth/AuthProvider';

function RootRedirect() {
    const { user } = useAuth();
    if (user()?.role === 'teacher') {
        return <Navigate href="/teacher/dashboard" />;
    } else if (user()?.role === 'student') {
        return <Navigate href="/student/dashboard" />;
    } else if (user()?.role === 'admin') {
        return <Navigate href="/admin/dashboard" />;
    }
    return <Navigate href="/login" />;
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
          path="/admin/dashboard"
          component={() => (
            <RequireAuth role="admin">
              <AdminDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/admin/users"
          component={() => (
            <RequireAuth role="admin">
              <AdminDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/admin/courses"
          component={() => (
            <RequireAuth role="admin">
              <AdminDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/admin/groups"
          component={() => (
            <RequireAuth role="admin">
              <AdminDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/admin/settings"
          component={() => (
            <RequireAuth role="admin">
              <AdminDashboardPage />
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