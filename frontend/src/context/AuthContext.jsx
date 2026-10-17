import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage or /auth/me
  const loadUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('pawconnect_token');
      const storedUser = localStorage.getItem('pawconnect_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setFavorites(parsed.favorites || []);
        }

        // Fetch fresh profile from backend
        const res = await API.get('/auth/me');
        if (res.data?.data) {
          const freshUser = res.data.data;
          setUser(freshUser);
          const favIds = (freshUser.favorites || []).map((f) =>
            typeof f === 'string' ? f : f._id
          );
          setFavorites(favIds);
          localStorage.setItem('pawconnect_user', JSON.stringify(freshUser));
        }
      }
    } catch (err) {
      console.warn('Session restore failed or expired:', err.message);
      localStorage.removeItem('pawconnect_token');
      localStorage.removeItem('pawconnect_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { data } = response.data;

    localStorage.setItem('pawconnect_token', data.token);
    localStorage.setItem('pawconnect_user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    setFavorites(data.favorites || []);

    return data;
  };

  const register = async (userData) => {
    const response = await API.post('/auth/register', userData);
    const { data } = response.data;

    localStorage.setItem('pawconnect_token', data.token);
    localStorage.setItem('pawconnect_user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    setFavorites(data.favorites || []);

    return data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('pawconnect_token');
    localStorage.removeItem('pawconnect_user');
    setToken(null);
    setUser(null);
    setFavorites([]);
  };

  const updateProfile = async (profileData) => {
    const res = await API.put('/auth/me', profileData);
    if (res.data?.data) {
      const updated = { ...user, ...res.data.data };
      setUser(updated);
      localStorage.setItem('pawconnect_user', JSON.stringify(updated));
      return updated;
    }
  };

  const toggleFavorite = async (petId) => {
    if (!token) return false;

    try {
      const isFav = favorites.includes(petId);
      // Optimistic update
      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== petId) : [...prev, petId]
      );

      const res = await API.post(`/pets/${petId}/favorite`);
      if (res.data?.favorites) {
        setFavorites(res.data.favorites);
      }
      return !isFav;
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      // Rollback
      loadUser();
      return false;
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'Admin';
  const isSeller = user?.role === 'Seller';
  const isRescuer = user?.role === 'Rescuer';
  const isShelterAdmin = user?.role === 'ShelterAdmin';
  const isAdopter = user?.role === 'Adopter' || !user?.role;
  const canListPets = isAdmin || isSeller || isRescuer || isShelterAdmin;
  const isVerified = user?.isVerified === true;

  const value = {
    user,
    token,
    loading,
    favorites,
    login,
    register,
    logout,
    updateProfile,
    toggleFavorite,
    refreshUser: loadUser,
    isAuthenticated,
    isAdmin,
    isSeller,
    isRescuer,
    isShelterAdmin,
    isAdopter,
    canListPets,
    isVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
