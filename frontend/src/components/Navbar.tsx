import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    🦁 Animal Park Rwanda
                </Link>

                <div className="navbar-menu">
                    {(!isAuthenticated || user?.role === 'TOURIST') && (
                        <Link to="/" className="navbar-link">Home</Link>
                    )}
                    {(!isAuthenticated || user?.role === 'TOURIST') && (
                        <Link to="/parks" className="navbar-link">Parks</Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            {user?.role === 'TOURIST' && (
                                <Link to="/my-bookings" className="navbar-link">My Bookings</Link>
                            )}

                            {user?.role === 'RANGER' && (
                                <Link to="/ranger/dashboard" className="navbar-link">Ranger Dashboard</Link>
                            )}

                            {user?.role === 'ADMIN' && (
                                <Link to="/admin/dashboard" className="navbar-link">Admin Dashboard</Link>
                            )}

                            <div className="navbar-user">
                                <Link to="/profile" className="navbar-link navbar-profile">
                                    👤 {user?.firstName}
                                </Link>
                                <button onClick={handleLogout} className="btn-logout">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="navbar-auth">
                            <Link to="/login" className="navbar-link">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Sign Up
                            </Link>
                        </div>
                    )}

                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
