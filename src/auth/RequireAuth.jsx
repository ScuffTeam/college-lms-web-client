import { useNavigate } from "@solidjs/router";
import { useAuth } from "./AuthProvider";

export function RequireAuth(props) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading()) {
    return <div>Загрузка...</div>;
  }

  if (!user()) {
    navigate("/login", { replace: true });
    return null;
  }

  if (props.role && user().role !== props.role) {
    navigate("/", { replace: true });
    return null;
  }

  return <>{props.children}</>;
}
