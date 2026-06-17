import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import SplashScreen from './components/layout/SplashScreen';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutLogger from './pages/WorkoutLogger';
import WorkoutHistory from './pages/WorkoutHistory';
import UserProfile from './pages/UserProfile';
import GymListing from './pages/GymListing';
import GymDetail from './pages/GymDetail';
import LogMeasurements from './pages/LogMeasurements';
import MeasurementsHistory from './pages/MeasurementsHistory';
import AdminPanel from './pages/AdminPanel';
import { useAuthStore } from './store/authStore';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-dark">
        <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route Wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-dark">
        <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  return isAuthenticated && user?.isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const loading = useAuthStore((state) => state.loading);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-dark">
        <Dumbbell className="h-12 w-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/gyms/:city" element={<GymListing />} />
            <Route path="/gyms/:city/:id" element={<GymDetail />} />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <WorkoutHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/log" 
              element={
                <ProtectedRoute>
                  <WorkoutLogger />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/measurements/log" 
              element={
                <ProtectedRoute>
                  <LogMeasurements />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/measurements/history" 
              element={
                <ProtectedRoute>
                  <MeasurementsHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

