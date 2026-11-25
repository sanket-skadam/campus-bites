import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { LandingPage } from './pages/LandingPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MenuPage } from './pages/student/MenuPage';
import { CartPage } from './pages/student/CartPage';
import { MyOrdersPage } from './pages/student/MyOrdersPage';
import { FeedbackPage } from './pages/student/FeedbackPage';

// Canteen Staff Pages
import { CanteenDashboard } from './pages/canteen/CanteenDashboard';
import { KitchenOrders } from './pages/canteen/KitchenOrders';
import { MenuManagement } from './pages/canteen/MenuManagement';
import { InventoryPage } from './pages/canteen/InventoryPage';
import { WasteTracking } from './pages/canteen/WasteTracking';
import { CanteenReviews } from './pages/canteen/CanteenReviews';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Campus Bites · Smart Canteen Pre-Order & Food Waste Management System
      </footer>
    </div>
  );
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'canteen_staff') return <Navigate to="/canteen/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Student & College Staff Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'college_staff']}>
                  <AppLayout>
                    <StudentDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/menu"
              element={
                <ProtectedRoute allowedRoles={['student', 'college_staff']}>
                  <AppLayout>
                    <MenuPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/cart"
              element={
                <ProtectedRoute allowedRoles={['student', 'college_staff']}>
                  <AppLayout>
                    <CartPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/orders"
              element={
                <ProtectedRoute allowedRoles={['student', 'college_staff']}>
                  <AppLayout>
                    <MyOrdersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/feedback"
              element={
                <ProtectedRoute allowedRoles={['student', 'college_staff']}>
                  <AppLayout>
                    <FeedbackPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Canteen Staff Operations Routes */}
            <Route
              path="/canteen/dashboard"
              element={
                <ProtectedRoute allowedRoles={['canteen_staff']}>
                  <AppLayout>
                    <CanteenDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/canteen/kitchen"
              element={
                <ProtectedRoute allowedRoles={['canteen_staff']}>
                  <AppLayout>
                    <KitchenOrders />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/canteen/menu-management"
              element={
                <ProtectedRoute allowedRoles={['canteen_staff']}>
                  <AppLayout>
                    <MenuManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/canteen/inventory"
              element={
                <ProtectedRoute allowedRoles={['canteen_staff']}>
                  <AppLayout>
                    <InventoryPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/canteen/waste"
              element={
                <ProtectedRoute allowedRoles={['canteen_staff']}>
                  <AppLayout>
                    <WasteTracking />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/canteen/reviews"
              element={
                <ProtectedRoute allowedRoles={['canteen_staff']}>
                  <AppLayout>
                    <CanteenReviews />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
