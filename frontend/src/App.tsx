import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import MyEvents from './pages/MyEvents';
import CreateEvent from './pages/CreateEvent';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
      <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
