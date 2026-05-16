import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface RoleGuardProps {
    roles: string[];
    children: React.ReactElement;
    redirectTo?: string;
}

export const RoleGuard = ({ roles, children, redirectTo = '/' }: RoleGuardProps) => {
    const user = useSelector((state: RootState) => state.auth.user);
    if (!user || !roles.includes(user.role)) {
        return <Navigate to={redirectTo} replace />;
    }
    return children;
};
