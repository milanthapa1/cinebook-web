import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './shared/components/Navbar';
import { Footer } from './shared/components/Footer';
import { CitySelectModal } from './features/location/CitySelectModal';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { ShowtimesPage } from './pages/ShowtimesPage';
import { BookingSummaryPage } from './pages/BookingSummaryPage';
import { PaymentPage } from './pages/PaymentPage';
import { TicketConfirmationPage } from './pages/TicketConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMoviesPage } from './pages/admin/AdminMoviesPage';
import { AdminHallsPage } from './pages/admin/AdminHallsPage';
import { AdminShowtimesPage } from './pages/admin/AdminShowtimesPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSeatsPage } from './pages/admin/AdminSeatsPage';
import { AdminLocationsPage } from './pages/admin/AdminLocationsPage';

// Public layout - wraps all non-admin pages with Navbar + Footer
const PublicLayout: React.FC = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col selection:bg-[#00a8cc] selection:text-white">
    <Navbar />
    <CitySelectModal />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Admin layout wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminLayout>{children}</AdminLayout>
);

export const App: React.FC = () => {
  return (
    <Routes>
      {/* ── Admin routes (own layout, no Navbar/Footer) ── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/movies" element={<AdminRoute><AdminMoviesPage /></AdminRoute>} />
      <Route path="/admin/halls" element={<AdminRoute><AdminHallsPage /></AdminRoute>} />
      <Route path="/admin/seats" element={<AdminRoute><AdminSeatsPage /></AdminRoute>} />
      <Route path="/admin/locations" element={<AdminRoute><AdminLocationsPage /></AdminRoute>} />
      <Route path="/admin/showtimes" element={<AdminRoute><AdminShowtimesPage /></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />

      {/* ── Public routes (Navbar + Footer via PublicLayout) ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        <Route path="/booking-summary" element={<BookingSummaryPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/ticket-confirmation/:bookingId" element={<TicketConfirmationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
