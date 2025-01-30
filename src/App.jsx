import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Bookings from './pages/Bookings/Bookings';
import Dashboard from './pages/Dashboard/Dashboard';

const HomePage = lazy(() => import('./pages/Homepage/HomePage'));
const ExploreFields = lazy(() => import('./pages/ExploreFields/ExploreFields'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'));
const FieldDetails = lazy(() => import('./pages/FieldDetails/FieldDetails'));
const Register = lazy(() => import('./pages/Register/Register'));
const Login = lazy(() => import('./pages/Login/Login'));
const BookingPage = lazy(() => import('./pages/BookingPage/BookingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));

function App() {
  return (
    <Router>
      <div>
        <Header />

        {/* Suspense لتحميل الصفحات بشكل غير متزامن */}
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/field/:id" element={<FieldDetails />} />
            <Route path="/field/:id/booking" element={<BookingPage />} />
            <Route path="/bookings" element={<Bookings/>} /> 
          </Routes>
        </Suspense>

        <footer className="bg-dark text-white text-center py-3">
          <p>&copy; 2025 Football Field Booking. Penalty Kick.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
