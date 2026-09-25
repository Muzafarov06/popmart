// src/app/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import LoginScreen from '@/components/auth/LoginScreen';
import Home from '@/pages/Home';
import Unbox from '@/pages/Unbox';
import Collection from '@/pages/Collection';
import CollectionsList from '@/pages/CollectionsList';
import Leaderboard from '@/pages/Leaderboard';
import Profile from '@/pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8EE]">
        <div className="text-zinc-400 text-sm uppercase tracking-[0.2em]">Загрузка...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />

      {/* Полноэкранные сцены без Layout */}
      <Route
        path="/unbox/:collectionId"
        element={
          <ProtectedRoute>
            <Unbox />
          </ProtectedRoute>
        }
      />

      {/* Внутри MainLayout — с хедером */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<CollectionsList />} />
        <Route path="/collection/:collectionId" element={<Collection />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile/:login" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}