import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store/store';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ParksPage from './pages/ParksPage';
import ParkDetailPage from './pages/ParkDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PaymentPage from './pages/PaymentPage';
import RangerDashboard from './pages/RangerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateStaffPage from './pages/CreateStaffPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    // Fetch current user on app load if token exists
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !user) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, user]);

    return (
        <div className="app">
            <Navbar />
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/parks" element={<ParksPage />} />
                <Route path="/parks/:id" element={<ParkDetailPage />} />
                <Route path="/book/:parkId" element={<BookingPage />} />
                <Route path="/payment/:reservationId" element={<PaymentPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/ranger/dashboard" element={<RangerDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/create-staff" element={<CreateStaffPage />} />
            </Routes>
        </div>
    );
}

export default App;
