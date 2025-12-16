import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import api from '../api/axios.config';
import toast from 'react-hot-toast';
import './ProfilePage.css';

interface UserStats {
    totalBookings: number;
    upcomingVisits: number;
    completedVisits: number;
}

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<UserStats>({ totalBookings: 0, upcomingVisits: 0, completedVisits: 0 });

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUserStats();
    }, [user, navigate]);

    const fetchUserStats = async () => {
        try {
            const response = await api.get('/api/reservations/my-bookings');
            const bookings = response.data;

            const now = new Date();
            const upcoming = bookings.filter((b: any) => new Date(b.visitDate) > now && b.status === 'CONFIRMED').length;
            const completed = bookings.filter((b: any) => new Date(b.visitDate) < now && b.status === 'CONFIRMED').length;

            setStats({
                totalBookings: bookings.length,
                upcomingVisits: upcoming,
                completedVisits: completed,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put('/auth/profile', formData);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password changed successfully!');
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="profile-info">
                        <h1>{user.firstName} {user.lastName}</h1>
                        <p className="profile-role">{user.role}</p>
                        <p className="profile-email">{user.email}</p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-value">{stats.totalBookings}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.upcomingVisits}</div>
                        <div className="stat-label">Upcoming Visits</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.completedVisits}</div>
                        <div className="stat-label">Completed Visits</div>
                    </div>
                </div>

                <div className="profile-section">
                    <div className="section-header">
                        <h2>Profile Information</h2>
                        {!isEditing && (
                            <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            phone: user.phone,
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details">
                            <div className="detail-item">
                                <span className="detail-label">Name:</span>
                                <span className="detail-value">{user.firstName} {user.lastName}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{user.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Phone:</span>
                                <span className="detail-value">{user.phone}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Role:</span>
                                <span className="detail-value">{user.role}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <div className="section-header">
                        <h2>Security</h2>
                        {!isChangingPassword && (
                            <button className="btn-secondary" onClick={() => setIsChangingPassword(true)}>
                                Change Password
                            </button>
                        )}
                    </div>

                    {isChangingPassword && (
                        <form onSubmit={handleChangePassword} className="profile-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsChangingPassword(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="profile-actions">
                    <button className="btn-secondary" onClick={() => navigate('/my-bookings')}>
                        View My Bookings
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
