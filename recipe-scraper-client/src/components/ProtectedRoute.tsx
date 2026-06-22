import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-text-muted text-sm">Loading...</p>
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
