import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { reservationApi, Reservation } from '../api/reservation.api';
import { RootState } from '../store/store';
import toast from 'react-hot-toast';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [bookings, setBookings] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await reservationApi.getMyBookings({
                upcoming: filter === 'upcoming',
            });
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await reservationApi.cancelReservation(id);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to cancel booking');
        }
    };

    const handleDownloadTicket = async (booking: Reservation) => {
        try {
            // Create a formatted ticket as text file
            const ticketContent = `
═══════════════════════════════════════════════════════
        🦁 ANIMAL PARK RWANDA - E-TICKET 🦁
═══════════════════════════════════════════════════════

BOOKING REFERENCE: ${booking.bookingReference}

PARK INFORMATION:
  Park Name: ${booking.park.name}
  Location: ${booking.park.location}

VISIT DETAILS:
  Visit Date: ${new Date(booking.visitDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
  Number of Visitors: ${booking.numberOfVisitors}
  
PAYMENT INFORMATION:
  Total Amount Paid: ${booking.totalAmount.toLocaleString()} RWF
  Status: ✅ ${booking.status}
  Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}

${booking.specialRequests ? `SPECIAL REQUESTS:\n  ${booking.specialRequests}\n` : ''}
═══════════════════════════════════════════════════════
                    IMPORTANT INFORMATION
═══════════════════════════════════════════════════════

✓ Please arrive 30 minutes before your scheduled visit
✓ Present this booking reference at the park entrance
✓ Keep this ticket safe until your visit
✓ Contact support for any changes or cancellations

═══════════════════════════════════════════════════════

Thank you for choosing Animal Park Rwanda!

Website: www.animalparkrwanda.rw
Support: support@animalparkrwanda.rw
Phone: +250 XXX XXX XXX

═══════════════════════════════════════════════════════
            `;

            // Create blob and trigger download
            const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `APR-Ticket-${booking.bookingReference}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Ticket downloaded successfully!');
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error('Failed to download ticket');
        }
    };

    const handleViewTicket = (booking: Reservation) => {
        // Create a formatted ticket display
        const ticketHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>E-Ticket - ${booking.bookingReference}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .ticket {
            background: white;
            border: 3px solid #2c5f2d;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #2c5f2d;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #2c5f2d;
            margin: 10px 0;
        }
        .section {
            margin: 20px 0;
        }
        .section-title {
            color: #2c5f2d;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
        }
        .booking-ref {
            font-size: 24px;
            font-weight: bold;
            color: #2c5f2d;
            text-align: center;
            padding: 15px;
            background: #f0f8f0;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #2c5f2d;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            background: #4CAF50;
            color: white;
            border-radius: 20px;
            font-weight: bold;
        }
        @media print {
            body { background: white; }
            .ticket { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1>🦁 ANIMAL PARK RWANDA</h1>
            <h2>E-TICKET</h2>
        </div>
        
        <div class="booking-ref">
            ${booking.bookingReference}
        </div>
        
        <div class="section">
            <div class="section-title">Park Information</div>
            <div class="info-row">
                <span class="label">Park Name:</span>
                <span class="value">${booking.park.name}</span>
            </div>
            <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">${booking.park.location}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Visit Details</div>
            <div class="info-row">
                <span class="label">Visit Date:</span>
                <span class="value">${new Date(booking.visitDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</span>
            </div>
            <div class="info-row">
                <span class="label">Number of Visitors:</span>
                <span class="value">${booking.numberOfVisitors}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="info-row">
                <span class="label">Total Amount:</span>
                <span class="value">${booking.totalAmount.toLocaleString()} RWF</span>
            </div>
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="value"><span class="status">${booking.status}</span></span>
            </div>
            <div class="info-row">
                <span class="label">Booking Date:</span>
                <span class="value">${new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        
        ${booking.specialRequests ? `
        <div class="section">
            <div class="section-title">Special Requests</div>
            <p style="padding: 10px; background: #f9f9f9; border-radius: 5px;">${booking.specialRequests}</p>
        </div>
        ` : ''}
        
        <div class="footer">
            <p><strong>IMPORTANT INFORMATION</strong></p>
            <p>✓ Please arrive 30 minutes before your scheduled visit</p>
            <p>✓ Present this booking reference at the park entrance</p>
            <p>✓ Keep this ticket safe until your visit</p>
            <p style="margin-top: 20px;">
                <strong>Contact Us:</strong><br>
                Website: www.animalparkrwanda.rw<br>
                Email: support@animalparkrwanda.rw
            </p>
        </div>
    </div>
    <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #2c5f2d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            🖨️ Print Ticket
        </button>
    </div>
</body>
</html>
        `;

        // Open in new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(ticketHTML);
            newWindow.document.close();
            toast.success('Ticket opened in new tab!');
        } else {
            toast.error('Please allow popups to view ticket');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusClasses: Record<string, string> = {
            PENDING: 'status-pending',
            CONFIRMED: 'status-confirmed',
            CANCELLED: 'status-cancelled',
            COMPLETED: 'status-completed',
        };

        return (
            <span className={`status-badge ${statusClasses[status] || ''}`}>
                {status}
            </span>
        );
    };

    const canCancel = (booking: Reservation) => {
        const visitDate = new Date(booking.visitDate);
        const today = new Date();
        const daysUntilVisit = Math.ceil(
            (visitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
            booking.status === 'CONFIRMED' &&
            daysUntilVisit > 0
        );
    };

    return (
        <div className="my-bookings-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1>My Bookings</h1>
                        <p>Welcome back, {user?.firstName}!</p>
                    </div>
                    <Link to="/parks" className="btn btn-primary">
                        Book New Visit
                    </Link>
                </div>

                <div className="bookings-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Bookings
                    </button>
                    <button
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past
                    </button>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading your bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="no-bookings card">
                        <h3>No bookings found</h3>
                        <p>You haven't made any reservations yet.</p>
                        <Link to="/parks" className="btn btn-primary">
                            Explore Parks
                        </Link>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="booking-card card">
                                <div className="booking-header">
                                    <div>
                                        <h3>{booking.park.name}</h3>
                                        <p className="booking-location">📍 {booking.park.location}</p>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>

                                <div className="booking-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Booking Reference</span>
                                        <span className="detail-value">{booking.bookingReference}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Visit Date</span>
                                        <span className="detail-value">
                                            {new Date(booking.visitDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Visitors</span>
                                        <span className="detail-value">{booking.numberOfVisitors}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Total Amount</span>
                                        <span className="detail-value detail-amount">
                                            RWF {booking.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {booking.specialRequests && (
                                    <div className="special-requests">
                                        <strong>Special Requests:</strong> {booking.specialRequests}
                                    </div>
                                )}

                                <div className="booking-actions">
                                    {booking.status === 'CONFIRMED' && (
                                        <>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleViewTicket(booking)}
                                            >
                                                👁️ View Ticket
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handleDownloadTicket(booking)}
                                            >
                                                📥 Download
                                            </button>
                                        </>
                                    )}

                                    {canCancel(booking) && (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleCancelBooking(booking.id)}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}

                                    {booking.status === 'PENDING' && (
                                        <Link
                                            to={`/payment/${booking.id}`}
                                            className="btn btn-primary"
                                        >
                                            Complete Payment
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;
