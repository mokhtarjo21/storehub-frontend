import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { UserConfigProvider } from "./contexts/UserConfigContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import MyActivity from "./components/Profile/MyActivity";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import CompanyDashboard from "./pages/Company/CompanyDashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Dashboard from "./pages/Orders";
import AdminCompaniesPage from "./pages/Admin/AdminCompany";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import SmartRegister from "./pages/Auth/SmartRegister";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import EmailVerification from "./pages/Auth/EmailVerification";
import Adminpanel from "./pages/Admin/AdminPanel";
import AffiliateDashboard from "./pages/Affiliate/AffiliateDashboard";
import ProductDetail from "./pages/ProductDetail";
import OrderDetail from "./pages/OrderDetail";
import AccountSuspended from "./pages/AccountSuspended";
import AccountUnderReview from "./pages/AccountUnderReview";
import ScrollToTop from "./components/ScrollToTop";
import Checkout from "./pages/checkout";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <UserConfigProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  <Route path="/suspended" element={<AccountSuspended />} />
                  <Route
                    path="/under-review"
                    element={<AccountUnderReview />}
                  />
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Products />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:slug" element={<ProductDetail />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="smart-register" element={<SmartRegister />} />
                    <Route
                      path="forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route
                      path="verify-email"
                      element={<EmailVerification />}
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders/:orderNumber"
                      element={
                        <ProtectedRoute>
                          <OrderDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders/:orderNumber"
                      element={
                        <ProtectedRoute>
                          <OrderDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="activity/:id"
                      element={
                        <ProtectedRoute requiredRole="super_admin">
                          <MyActivity />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="company"
                      element={
                        <ProtectedRoute requiredRole="company_admin">
                          <CompanyDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="affiliate"
                      element={
                        <ProtectedRoute requiredRole="affiliate">
                          <AffiliateDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/companies"
                      element={
                        <ProtectedRoute requiredRole="super_admin">
                          <AdminCompaniesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/users"
                      element={
                        <ProtectedRoute requiredRole="super_admin">
                          <AdminUsersPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="admin"
                      element={
                        <ProtectedRoute requiredRole="super_admin">
                          <Adminpanel />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
              </Router>
            </UserConfigProvider>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
