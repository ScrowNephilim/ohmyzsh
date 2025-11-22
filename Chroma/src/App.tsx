import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import PersonalitiesPage from '@/pages/PersonalitiesPage';
import EmotionsPage from '@/pages/EmotionsPage';
import RiplayMasterPage from '@/pages/RiplayMasterPage';
import BookshelfPage from '@/pages/BookshelfPage';
import ChromaPage from '@/pages/ChromaPage';
import SettingsPage from '@/pages/SettingsPage';
import HumanizerPage from '@/pages/HumanizerPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/personalities"
          element={
            <ProtectedRoute>
              <PersonalitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emotions"
          element={
            <ProtectedRoute>
              <EmotionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/riplay-master"
          element={
            <ProtectedRoute>
              <RiplayMasterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookshelf"
          element={
            <ProtectedRoute>
              <BookshelfPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chroma"
          element={
            <ProtectedRoute>
              <ChromaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/humanizer"
          element={
            <ProtectedRoute>
              <HumanizerPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
