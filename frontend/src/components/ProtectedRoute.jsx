import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const isAdmin = user?.role === 'Admin';
    const hasRole =
      isAdmin ||
      roles.includes(user?.role) ||
      (roles.includes('Seller') && (user?.role === 'Rescuer' || user?.role === 'ShelterAdmin')) ||
      (roles.includes('Rescuer') && user?.role === 'Seller');

    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
