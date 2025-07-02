import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { HomePage } from "../pages/HomePage";
import { ProductListPage } from "../pages/ProductListPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { OrderPage } from "../pages/OrderPage";
import { PaymentPage } from "../pages/PaymentPage";
import { LoginPage } from "../pages/LoginPage";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import PasswordResetPage from "../pages/PasswordResetPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import MetricsDashboard from "../pages/MetricsDashboard";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) {
    return <div>Yükleniyor...</div>; // Yükleme ekranı
  }

  if (!isAuthenticated) {
    navigate("/login"); // Kimlik doğrulanmamışsa doğrudan yönlendir
    return null; // Hiçbir şey render etme
  }

  return children; // Kimlik doğrulanmışsa çocukları render et
};

function AppRoutes() {
  return (
    <Routes>
      {/* Login rotası */}
      <Route path="/login" element={<LoginPage />} />
      {/* Kök rota için login'e yönlendir */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Diğer tüm sayfalar MainLayout altında */}
      <Route path="/app" element={<MainLayout />}>
        <Route
          index
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="products"
          element={
            <PrivateRoute>
              <ProductListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="product/:id"
          element={
            <PrivateRoute>
              <ProductDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="orders"
          element={
            <PrivateRoute>
              <OrderPage />
            </PrivateRoute>
          }
        />
        <Route
          path="payments"
          element={
            <PrivateRoute>
              <PaymentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="metrics"
          element={
            <PrivateRoute>
              <MetricsDashboard />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Email verification routes */}
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<PasswordResetPage />} />
    </Routes>
  );
}

export default AppRoutes;
