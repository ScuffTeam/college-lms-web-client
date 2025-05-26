import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthProvider';

export function RequireAuth(props) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Если загрузка, показываем загрузчик
    if (loading()) {
        return <div>Загрузка...</div>;
    }

    // Если пользователь не авторизован, редиректим на страницу входа
    if (!user()) {
        navigate('/login', { replace: true });
        return null;
    }

    // Если есть проверка роли и пользователь не имеет нужной роли
    if (props.role && user().role !== props.role) {
        navigate('/', { replace: true });
        return null;
    }

    // Если все проверки пройдены, рендерим дочерние компоненты
    return <>{props.children}</>;
}