import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Core Pages
import HomePage from './pages/HomePage';
import PetDetailPage from './pages/PetDetailPage';
import RescuesTrackerPage from './pages/RescuesTrackerPage';
import ReportRescuePage from './pages/ReportRescuePage';
import TermsEthicsPage from './pages/TermsEthicsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboards
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdopterDashboardPage from './pages/AdopterDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManagePetsPage from './pages/ManagePetsPage';
import ManageRescuesPage from './pages/ManageRescuesPage';
import PetFormPage from './pages/PetFormPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen flex flex-col w-full transition-colors duration-300">
              <Navbar />

              <main className="flex-1 w-full">
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/pets/:id" element={<PetDetailPage />} />
                  <Route path="/rescues" element={<RescuesTrackerPage />} />
                  <Route path="/terms" element={<TermsEthicsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Authenticated User Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Community Emergency Reporting */}
                  <Route
                    path="/report-rescue"
                    element={
                      <ProtectedRoute>
                        <ReportRescuePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Adopter Dashboard & Wishlist */}
                  <Route
                    path="/adopter/dashboard"
                    element={
                      <ProtectedRoute>
                        <AdopterDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-requests"
                    element={<Navigate to="/adopter/dashboard" replace />}
                  />

                  {/* Seller / Rescuer Dashboard & Pet Form */}
                  <Route
                    path="/seller/dashboard"
                    element={
                      <ProtectedRoute roles={['Seller', 'Rescuer', 'ShelterAdmin', 'Admin']}>
                        <SellerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pets/new"
                    element={
                      <ProtectedRoute roles={['Seller', 'Rescuer', 'ShelterAdmin', 'Admin']}>
                        <PetFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pets/:id/edit"
                    element={
                      <ProtectedRoute roles={['Seller', 'Rescuer', 'ShelterAdmin', 'Admin']}>
                        <PetFormPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Platform Admin Console */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute roles={['Admin']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pets"
                    element={
                      <ProtectedRoute roles={['Admin']}>
                        <ManagePetsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pets/new"
                    element={
                      <ProtectedRoute roles={['Admin']}>
                        <PetFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pets/:id/edit"
                    element={
                      <ProtectedRoute roles={['Admin']}>
                        <PetFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/rescues"
                    element={
                      <ProtectedRoute roles={['Admin']}>
                        <ManageRescuesPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Catch-All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
