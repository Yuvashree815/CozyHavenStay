import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import HotelDetailPage from './pages/public/HotelDetailPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Guest pages
import ProfilePage from './pages/guest/ProfilePage';
import MyBookingsPage from './pages/guest/MyBookingsPage';
import BookingDetailPage from './pages/guest/BookingDetailPage';
import BookingPage from './pages/guest/BookingPage';
import WriteReviewPage from './pages/guest/WriteReviewPage';

// Owner pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import MyHotelsPage from './pages/owner/MyHotelsPage';
import HotelFormPage from './pages/owner/HotelFormPage';
import RoomFormPage from './pages/owner/RoomFormPage';
import HotelBookingsPage from './pages/owner/HotelBookingsPage';
import PendingRefundsPage from './pages/owner/PendingRefundsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AllUsersPage from './pages/admin/AllUsersPage';
import AllHotelsPage from './pages/admin/AllHotelsPage';

function App() {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Guest routes */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
          } />
          <Route path="/bookings/:id" element={
            <ProtectedRoute><BookingDetailPage /></ProtectedRoute>
          } />
          <Route path="/book/:roomId" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="/bookings/:id/review" element={
            <ProtectedRoute><WriteReviewPage /></ProtectedRoute>
          } />

          {/* Owner routes */}
          <Route path="/owner/dashboard" element={
            <RoleRoute allowedRoles={['HotelOwner']}>
              <OwnerDashboardPage />
            </RoleRoute>
          } />
          <Route path="/owner/hotels" element={
            <RoleRoute allowedRoles={['HotelOwner']}>
              <MyHotelsPage />
            </RoleRoute>
          } />
          <Route path="/owner/hotels/new" element={
            <RoleRoute allowedRoles={['HotelOwner']}>
              <HotelFormPage />
            </RoleRoute>
          } />
          <Route path="/owner/hotels/:id/edit" element={
            <RoleRoute allowedRoles={['HotelOwner']}>
              <HotelFormPage />
            </RoleRoute>
          } />
          <Route path="/owner/hotels/:hotelId/rooms/:roomId/edit" element={
            <RoleRoute allowedRoles={['HotelOwner']}>
              <RoomFormPage />
            </RoleRoute>
          } />
          <Route path="/owner/hotels/:hotelId/bookings" element={
            <RoleRoute allowedRoles={['HotelOwner']}>
              <HotelBookingsPage />
            </RoleRoute>
          } />
          <Route path="/owner/refunds" element={
            <RoleRoute allowedRoles={['HotelOwner']}>
              <PendingRefundsPage />
            </RoleRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <RoleRoute allowedRoles={['Admin']}>
              <AdminDashboardPage />
            </RoleRoute>
          } />
          <Route path="/admin/users" element={
            <RoleRoute allowedRoles={['Admin']}>
              <AllUsersPage />
            </RoleRoute>
          } />
          <Route path="/admin/hotels" element={
            <RoleRoute allowedRoles={['Admin']}>
              <AllHotelsPage />
            </RoleRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;