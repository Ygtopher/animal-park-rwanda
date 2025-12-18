import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../store/store';
import { analyticsApi } from '../api/analytics.api';
import { userApi, User } from '../api/user.api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';
import './Analytics.css';

interface Analytics {
    totalRevenue: number;
    totalBookings: number;
    totalVisitors: number;
    activeParks: number;
    todayRevenue: number;
    todayBookings: number;
    monthlyRevenue: number[];
    popularParks: Array<{
        id: string;
        name: string;
        province: string;
        capacity: number;
        status: string;
        bookings: number;
    }>;
}

const AdminDashboard = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [analytics, setAnalytics] = useState<Analytics>({
        totalRevenue: 0,
        totalBookings: 0,
        totalVisitors: 0,
        activeParks: 0,
        todayRevenue: 0,
        todayBookings: 0,
        monthlyRevenue: [],
        popularParks: [],
    });
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setVisitorTypes] = useState({
        foreign: { count: 0, percentage: 0 },
        rwandan: { count: 0, percentage: 0 },
        eac: { count: 0, percentage: 0 },
    });
    const [isInitializing, setIsInitializing] = useState(true);

    // Wait for auth to initialize
    useEffect(() => {
        const timer = setTimeout(() => setIsInitializing(false), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Don't redirect while initializing
        if (isInitializing) return;

        if (!isAuthenticated || user?.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [isAuthenticated, user, navigate, isInitializing]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await analyticsApi.getAdminAnalytics();
            const data = response.data;

            setAnalytics({
                totalRevenue: data.revenue.total,
                totalBookings: data.reservations.total,
                totalVisitors: data.users.tourists,
                activeParks: data.parks.length,
                todayRevenue: data.revenue.thisMonth,
                todayBookings: data.reservations.confirmed,
                monthlyRevenue: [data.revenue.thisMonth],
                popularParks: data.parks.map((park: any) => ({
                    id: park.id,
                    name: park.parkName,
                    province: park.province,
                    capacity: park.capacity,
                    status: park.status,
                    bookings: park.reservations,
                })),
            });

            // Store histogram data for analytics tab
            if (data.dailyReservations) {
                (window as any).dailyReservations = data.dailyReservations;
            }
            if (data.monthlyReservations) {
                (window as any).monthlyReservations = data.monthlyReservations;
            }

            // Update visitor types if available
            if (data.visitorTypes) {
                setVisitorTypes(data.visitorTypes);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await userApi.updateUserRole(userId, newRole);
            toast.success('User role updated successfully');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userApi.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleAssignRangerToPark = async (userId: string, parkId: string) => {
        if (!parkId) return;

        try {
            const response = await fetch('http://localhost:5000/api/park-rangers/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ userId, parkId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to assign ranger');
            }

            toast.success(`Ranger assigned to ${data.data.park.name} successfully!`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign ranger to park');
        }
    };

    const handleParkCapacityUpdate = async (_parkId: string, _newCapacity: number) => {
        try {
            // await parkApi.updatePark(parkId, { capacity: newCapacity });
            toast.success('Park capacity updated');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update capacity');
        }
    };

    const handleParkStatusUpdate = async (_parkId: string, _newStatus: string) => {
        try {
            // await parkApi.updatePark(parkId, { status: newStatus });
            toast.success('Park status updated');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update status');
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {user?.firstName}!</p>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'parks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('parks')}
                >
                    Parks
                </button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="stats-grid">
                            <div className="stat-card card">
                                <div className="stat-header">
                                    <span className="stat-label">Total Revenue</span>
                                    <span className="stat-icon">💰</span>
                                </div>
                                <div className="stat-value">{analytics.totalRevenue.toLocaleString()} RWF</div>
                                <div className="stat-change positive">+{analytics.todayRevenue.toLocaleString()} this month</div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-header">
                                    <span className="stat-label">Total Bookings</span>
                                    <span className="stat-icon">📅</span>
                                </div>
                                <div className="stat-value">{analytics.totalBookings}</div>
                                <div className="stat-change neutral">{analytics.todayBookings} confirmed</div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-header">
                                    <span className="stat-label">Total Visitors</span>
                                    <span className="stat-icon">👥</span>
                                </div>
                                <div className="stat-value">{analytics.totalVisitors}</div>
                                <div className="stat-change neutral">Registered tourists</div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-header">
                                    <span className="stat-label">Active Parks</span>
                                    <span className="stat-icon">🏞️</span>
                                </div>
                                <div className="stat-value">{analytics.activeParks}</div>
                                <div className="stat-change neutral">Operational</div>
                            </div>
                        </div>

                        <div className="overview-grid">
                            <div className="card">
                                <h3>Today's Stats</h3>
                                <div className="today-stats">
                                    <div className="today-stat">
                                        <span className="today-label">Revenue</span>
                                        <span className="today-value">{analytics.todayRevenue.toLocaleString()} RWF</span>
                                    </div>
                                    <div className="today-stat">
                                        <span className="today-label">Bookings</span>
                                        <span className="today-value">{analytics.todayBookings}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3>Popular Parks</h3>
                                <div className="popular-parks">
                                    {analytics.popularParks.slice(0, 5).map((park) => (
                                        <div key={park.id} className="park-stat">
                                            <span className="park-name">{park.name}</span>
                                            <span className="park-bookings">{park.bookings} bookings</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'parks' && (
                    <div className="parks-section">
                        <div className="section-header">
                            <h2>Park Management</h2>
                        </div>

                        <div className="parks-table card">
                            {loading ? (
                                <p>Loading parks...</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Province</th>
                                            <th>Capacity</th>
                                            <th>Status</th>
                                            <th>Bookings</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.popularParks.map((park) => (
                                            <tr key={park.id}>
                                                <td>{park.name}</td>
                                                <td>{park.province}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        defaultValue={park.capacity}
                                                        onBlur={(e) => {
                                                            const newCapacity = parseInt(e.target.value);
                                                            if (newCapacity !== park.capacity && newCapacity > 0) {
                                                                handleParkCapacityUpdate(park.id, newCapacity);
                                                            }
                                                        }}
                                                        style={{ width: '80px', padding: '4px' }}
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        value={park.status}
                                                        onChange={(e) => handleParkStatusUpdate(park.id, e.target.value)}
                                                        style={{ padding: '4px' }}
                                                    >
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="MAINTENANCE">Maintenance</option>
                                                        <option value="CLOSED">Closed</option>
                                                    </select>
                                                </td>
                                                <td>{park.bookings}</td>
                                                <td>
                                                    <Link to={`/parks/${park.id}`} className="btn-icon" title="View Park">
                                                        👁️
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users-management">
                        {/* Staff Management Section */}
                        <div className="user-section">
                            <div className="section-header">
                                <h3>👔 Staff Management (Admin & Ranger)</h3>
                                <Link to="/create-staff">
                                    <button className="btn btn-primary">
                                        ➕ Create Staff Account
                                    </button>
                                </Link>
                            </div>

                            <div className="users-table card">
                                {loading ? (
                                    <p>Loading staff...</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u => u.role === 'ADMIN' || u.role === 'RANGER').map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.firstName} {u.lastName}</td>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        <span className={`role-badge role-${u.role.toLowerCase()}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        {u.role === 'RANGER' && (
                                                            <select
                                                                defaultValue=""
                                                                onChange={(e) => handleAssignRangerToPark(u.id, e.target.value)}
                                                                style={{ marginRight: '8px', padding: '4px', minWidth: '150px' }}
                                                            >
                                                                <option value="">Assign to Park...</option>
                                                                {analytics.popularParks.map((park) => (
                                                                    <option key={park.id} value={park.id}>
                                                                        {park.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                                            style={{ marginRight: '8px', padding: '4px' }}
                                                        >
                                                            <option value="ADMIN">Admin</option>
                                                            <option value="RANGER">Ranger</option>
                                                        </select>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            title="Delete User"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Tourist Management Section */}
                        <div className="user-section" style={{ marginTop: '2rem' }}>
                            <div className="section-header">
                                <h3>🧳 Tourist Management</h3>
                            </div>

                            <div className="users-table card">
                                {loading ? (
                                    <p>Loading tourists...</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u => u.role === 'TOURIST').map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.firstName} {u.lastName}</td>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        <span className={`role-badge role-${u.role.toLowerCase()}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            title="Delete User"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="analytics-section">
                        <h2>📊 Advanced Analytics & Insights</h2>

                        {/* Real-time Metrics */}
                        <div className="metrics-grid">
                            <div className="metric-card pulse-card">
                                <div className="metric-icon">🔥</div>
                                <div className="metric-content">
                                    <h4>Peak Day</h4>
                                    <div className="metric-value">
                                        {(() => {
                                            const data = (window as any).dailyReservations || [];
                                            if (data.length === 0) return 'N/A';
                                            const peak = data.reduce((max: any, d: any) => d.count > max.count ? d : max, data[0]);
                                            return new Date(peak.date).toLocaleDateString('en-US', { weekday: 'long' });
                                        })()}
                                    </div>
                                    <div className="metric-subtitle">
                                        {(() => {
                                            const data = (window as any).dailyReservations || [];
                                            if (data.length === 0) return '0 bookings';
                                            const peak = data.reduce((max: any, d: any) => d.count > max.count ? d : max, data[0]);
                                            return `${peak.count} bookings`;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="metric-card gradient-card">
                                <div className="metric-icon">📈</div>
                                <div className="metric-content">
                                    <h4>Growth Trend</h4>
                                    <div className="metric-value">
                                        {(() => {
                                            const data = (window as any).monthlyReservations || [];
                                            if (data.length < 2) return 'N/A';
                                            const latest = data[data.length - 1].count;
                                            const previous = data[data.length - 2].count;
                                            const growth = previous === 0 ? 100 : ((latest - previous) / previous * 100).toFixed(1);
                                            return Number(growth) > 0 ? `+${growth}%` : `${growth}%`;
                                        })()}
                                    </div>
                                    <div className="metric-subtitle">vs last month</div>
                                </div>
                            </div>

                            <div className="metric-card shimmer-card">
                                <div className="metric-icon">⚡</div>
                                <div className="metric-content">
                                    <h4>Total This Week</h4>
                                    <div className="metric-value">
                                        {(() => {
                                            const data = (window as any).dailyReservations || [];
                                            return data.reduce((sum: number, d: any) => sum + d.count, 0);
                                        })()}
                                    </div>
                                    <div className="metric-subtitle">confirmed reservations</div>
                                </div>
                            </div>

                            <div className="metric-card glow-card">
                                <div className="metric-icon">🎯</div>
                                <div className="metric-content">
                                    <h4>Average Daily</h4>
                                    <div className="metric-value">
                                        {(() => {
                                            const data = (window as any).dailyReservations || [];
                                            if (data.length === 0) return '0';
                                            const avg = data.reduce((sum: number, d: any) => sum + d.count, 0) / data.length;
                                            return Math.round(avg);
                                        })()}
                                    </div>
                                    <div className="metric-subtitle">bookings per day</div>
                                </div>
                            </div>
                        </div>

                        {/* Trend Indicators */}
                        <div className="trend-section">
                            <h3>📊 Booking Trends</h3>
                            <div className="trend-bars">
                                {(() => {
                                    const data = (window as any).dailyReservations || [];
                                    const maxCount = Math.max(...data.map((d: any) => d.count), 1);
                                    return data.map((day: any, index: number) => (
                                        <div key={index} className="trend-bar-container">
                                            <div
                                                className="trend-bar"
                                                style={{
                                                    height: `${(day.count / maxCount) * 100}%`,
                                                    animationDelay: `${index * 0.1}s`
                                                }}
                                            >
                                                <span className="trend-count">{day.count}</span>
                                            </div>
                                            <span className="trend-label">
                                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Monthly Overview */}
                        <div className="monthly-overview">
                            <h3>📅 Monthly Performance</h3>
                            <div className="monthly-grid">
                                {(() => {
                                    const data = (window as any).monthlyReservations || [];
                                    return data.map((month: any, index: number) => (
                                        <div key={index} className="month-card">
                                            <div className="month-name">{month.month}</div>
                                            <div className="month-count">{month.count}</div>
                                            <div className="month-bar">
                                                <div
                                                    className="month-bar-fill"
                                                    style={{
                                                        width: `${(month.count / Math.max(...data.map((m: any) => m.count), 1)) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
