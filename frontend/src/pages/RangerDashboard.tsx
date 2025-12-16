import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { analyticsApi } from '../api/analytics.api';
import apiClient from '../api/axios.config';
import toast from 'react-hot-toast';
import './RangerDashboard.css';

interface DailyStats {
    totalVisitors: number;
    scannedTickets: number;
    pendingTickets: number;
    capacity: number;
}

interface Ticket {
    id: string;
    bookingReference: string;
    visitDate: string;
    numberOfVisitors: number;
    scannedAt: string | null;
    reservation: {
        user: {
            firstName: string;
            lastName: string;
            phone: string;
        };
        park: {
            name: string;
        };
    };
}

const RangerDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState<DailyStats>({
        totalVisitors: 0,
        scannedTickets: 0,
        pendingTickets: 0,
        capacity: 500,
    });
    const [parkName, setParkName] = useState<string>('');
    const [todayTickets, setTodayTickets] = useState<Ticket[]>([]);
    const [scanMode, setScanMode] = useState(false);
    const [scanInput, setScanInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Wait for auth to initialize
    useEffect(() => {
        const timer = setTimeout(() => setIsInitializing(false), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Don't redirect while initializing
        if (isInitializing) return;

        if (!isAuthenticated || (user?.role !== 'RANGER' && user?.role !== 'ADMIN')) {
            navigate('/login');
            return;
        }

        // Initial fetch
        fetchDashboardData();

        // Set up auto-refresh every 30 seconds
        const refreshInterval = setInterval(() => {
            fetchDashboardData();
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(refreshInterval);
    }, [isAuthenticated, user, navigate, isInitializing]);

    const fetchDashboardData = async () => {
        try {
            // Fetch real analytics data from backend
            const response = await analyticsApi.getRangerAnalytics();
            const data = response.data;

            // Set park name
            if (data.park) {
                setParkName(data.park.name);
            }

            // Update stats with real data
            setStats({
                totalVisitors: data.stats.todayVisitors || 0,
                scannedTickets: data.stats.scannedTickets || 0,
                pendingTickets: data.stats.pendingCheckIns || 0,
                capacity: data.park?.capacity || 500,
            });

            // Set upcoming bookings as today's tickets
            setTodayTickets(data.upcomingBookings || []);
        } catch (error: any) {
            console.error('Failed to fetch dashboard data:', error);
            const errorMsg = error.response?.data?.error || 'Failed to load dashboard data';
            toast.error(errorMsg.includes('not found') || errorMsg.includes('assignment')
                ? 'You are not assigned to any park. Please contact an administrator.'
                : errorMsg
            );
        }
    };

    const handleScanTicket = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!scanInput.trim()) {
            toast.error('Please enter a booking reference');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/api/tickets/scan', {
                bookingReference: scanInput.trim(),
            });

            toast.success(`Ticket validated! ${response.data.numberOfVisitors} visitors checked in`);
            setScanInput('');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to validate ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleValidateTicket = async (bookingReference: string) => {
        try {
            setLoading(true);
            const response = await apiClient.post('/api/tickets/scan', {
                bookingReference: bookingReference.trim(),
            });

            toast.success(`Ticket validated! ${response.data.numberOfVisitors} visitors checked in`);
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to validate ticket');
        } finally {
            setLoading(false);
        }
    };

    const capacityPercentage = (stats.totalVisitors / stats.capacity) * 100;

    return (
        <div className="ranger-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Ranger Dashboard</h1>
                    <p>Welcome back, {user?.firstName}!</p>
                    {parkName && <p className="park-name">📍 {parkName}</p>}
                </div>
                <button
                    className={`btn ${scanMode ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => setScanMode(!scanMode)}
                >
                    {scanMode ? 'View Dashboard' : '🎫 Check In Visitor'}
                </button>
            </div>

            {scanMode ? (
                <div className="scan-mode">
                    <div className="scan-card card">
                        <h2>🎫 Validate Ticket</h2>
                        <p>Enter the booking reference to check in visitors</p>

                        <form onSubmit={handleScanTicket} className="scan-form">
                            <input
                                type="text"
                                className="form-input scan-input"
                                placeholder="Enter booking reference (e.g., APR-MJ6A4NUJ-67W58Z)"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                                autoFocus
                            />

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                {loading ? 'Validating...' : '✅ Validate & Check In'}
                            </button>
                        </form>

                        <div className="scan-instructions">
                            <h4>Instructions:</h4>
                            <ul>
                                <li>Ask visitor for their booking reference</li>
                                <li>Type the reference code exactly as shown on their ticket</li>
                                <li>System will validate and mark the ticket as checked-in</li>
                                <li>Visitor count will be updated automatically</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="dashboard-content">
                    <div className="stats-grid">
                        <div className="stat-card card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>{stats.totalVisitors}</h3>
                                <p>Today's Reservations</p>
                            </div>
                        </div>

                        <div className="stat-card card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>{stats.scannedTickets}</h3>
                                <p>Checked In</p>
                            </div>
                        </div>

                        <div className="stat-card card">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info">
                                <h3>{stats.pendingTickets}</h3>
                                <p>Pending Check-ins</p>
                            </div>
                        </div>

                        <div className="stat-card card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <h3>{capacityPercentage.toFixed(0)}%</h3>
                                <p>Capacity Used</p>
                            </div>
                        </div>
                    </div>

                    <div className="capacity-bar">
                        <div className="capacity-label">
                            <span>Park Capacity</span>
                            <span>{stats.totalVisitors} / {stats.capacity}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(capacityPercentage, 100)}%`,
                                    backgroundColor:
                                        capacityPercentage > 90
                                            ? 'var(--color-error)'
                                            : capacityPercentage > 70
                                                ? 'var(--color-warning)'
                                                : 'var(--color-success)',
                                }}
                            />
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                            {capacityPercentage.toFixed(1)}% occupied
                        </p>
                    </div>

                    <div className="tickets-section">
                        <h2>Today's Reservations</h2>

                        {todayTickets.length === 0 ? (
                            <div className="no-tickets card">
                                <p>No reservations for today</p>
                            </div>
                        ) : (
                            <div className="tickets-list">
                                {todayTickets.map((reservation: any) => (
                                    <div key={reservation.id} className="ticket-item card">
                                        <div className="ticket-info">
                                            <h3>{reservation.user?.firstName || 'Unknown'} {reservation.user?.lastName || ''}</h3>
                                            <p className="ticket-ref">{reservation.bookingReference || 'N/A'}</p>
                                            <p className="ticket-details">
                                                {reservation.numberOfVisitors || 0} visitors • {new Date(reservation.visitDate).toLocaleDateString()}
                                            </p>
                                            <p className="ticket-phone">{reservation.user?.phone || 'N/A'}</p>
                                        </div>

                                        <div className="ticket-actions">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleValidateTicket(reservation.bookingReference)}
                                                disabled={loading}
                                            >
                                                {loading ? 'Processing...' : '✅ Check In'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="quick-actions">
                        <h3>Quick Actions</h3>
                        <div className="actions-grid">
                            <button className="action-btn card">
                                <span className="action-icon">📋</span>
                                <span>Report Incident</span>
                            </button>
                            <button className="action-btn card">
                                <span className="action-icon">📊</span>
                                <span>View Analytics</span>
                            </button>
                            <button className="action-btn card">
                                <span className="action-icon">🦁</span>
                                <span>Wildlife Sighting</span>
                            </button>
                            <button className="action-btn card">
                                <span className="action-icon">⚠️</span>
                                <span>Emergency Alert</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RangerDashboard;
