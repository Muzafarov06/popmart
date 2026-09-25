// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#FFF8EE] flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}