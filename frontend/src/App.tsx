import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import AccountPage from './pages/AccountPage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { Auth0ProviderWithNavigate } from './auth/auth0-provider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { RoleBasedRoute } from './auth/RoleBasedRoute';
import LoginPage from './pages/LoginPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ContactPage from './pages/ContactPage';
import PaymentResultPage from './pages/PaymentResultPage';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Seller pages
import SellerLayout from './components/seller/SellerLayout';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerProductAddPage from './pages/seller/SellerProductAddPage';
import SellerProductEditPage from './pages/seller/SellerProductEditPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerOrderDetailPage from './pages/seller/SellerOrderDetailPage';
import SellerAnalyticsPage from './pages/seller/SellerAnalyticsPage';
import SellerSettingsPage from './pages/seller/SellerSettingsPage';
import SellerRegistrationPage from './pages/seller/SellerRegistrationPage';
import SellerPendingPage from './pages/seller/SellerPendingPage';

// Không thể sử dụng useNavigate ở đây vì nó phải được sử dụng bên trong Router
// Do đó, chúng ta tạo ra Application component riêng biệt
const Application = () => {
  const queryClient = useQueryClient();
  
  return (
    <Auth0ProviderWithNavigate>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="seller/register" element={<SellerRegistrationPage />} />
            <Route path="seller/pending" element={<SellerPendingPage />} />
            <Route path="payment-result" element={<PaymentResultPage />} />
            
            {/* Protected routes - chỉ cần đăng nhập */}
            <Route element={<ProtectedRoute />}>
              <Route path="account" element={<AccountPage />} />
            </Route>

            {/* Role-based routes - yêu cầu role "user" */}
            <Route element={<RoleBasedRoute requiredRole="user" />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="order/:id" element={<OrderDetailPage />} />
              <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            </Route>
            
            {/* Catch all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          
          {/* Admin routes - yêu cầu role "admin" */}
          <Route element={<RoleBasedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>
          
          {/* Seller routes - yêu cầu role "seller" */}
          <Route element={<RoleBasedRoute requiredRole="seller" />}>
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<SellerDashboardPage />} />
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="products/add" element={<SellerProductAddPage />} />
              <Route path="products/edit/:id" element={<SellerProductEditPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="orders/:id" element={<SellerOrderDetailPage />} />
              <Route path="analytics" element={<SellerAnalyticsPage />} />
              <Route path="settings" element={<SellerSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </Auth0ProviderWithNavigate>
  );
};

function App() {
  return (
    <Router>
      <Application />
    </Router>
  );
}

export default App;
