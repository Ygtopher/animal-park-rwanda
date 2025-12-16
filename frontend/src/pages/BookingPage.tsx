import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
import { reservationApi } from '../api/reservation.api';
import toast from 'react-hot-toast';
import './BookingPage.css';

const BookingPage = () => {
    const { parkId } = useParams<{ parkId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { park, selectedDate } = location.state || {};

    const [formData, setFormData] = useState({
        visitDate: selectedDate || '',
        numberOfVisitors: 1,
        visitorType: 'FOREIGN_ADULT',
        specialRequests: '',
    });

    const [loading, setLoading] = useState(false);

    const visitorTypes = [
        { value: 'RWANDAN_ADULT', label: 'Rwandan Adult', price: 10000 },
        { value: 'RWANDAN_CHILD', label: 'Rwandan Child', price: 5000 },
        { value: 'EAC_ADULT', label: 'EAC Adult', price: 30000 },
        { value: 'EAC_CHILD', label: 'EAC Child', price: 15000 },
        { value: 'FOREIGN_ADULT', label: 'Foreign Adult', price: 100000 },
        { value: 'FOREIGN_CHILD', label: 'Foreign Child', price: 50000 },
    ];

    const selectedVisitorType = visitorTypes.find(
        (type) => type.value === formData.visitorType
    );

    const estimatedTotal =
        (selectedVisitorType?.price || 0) * formData.numberOfVisitors;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!parkId) {
            toast.error('Park ID is missing');
            return;
        }

        try {
            setLoading(true);

            // Convert date to ISO datetime format (backend expects datetime, not just date)
            const visitDateTime = new Date(formData.visitDate + 'T09:00:00').toISOString();

            const payload = {
                parkId,
                visitDate: visitDateTime,
                numberOfVisitors: Number(formData.numberOfVisitors), // Convert to number
                visitorType: formData.visitorType,
                specialRequests: formData.specialRequests,
            };

            console.log('Creating reservation with payload:', payload);

            const response = await reservationApi.createReservation(payload);

            toast.success('Reservation created successfully!');
            navigate(`/payment/${response.data.id}`);
        } catch (error: any) {
            console.error('Reservation error:', error.response?.data);
            toast.error(error.response?.data?.error || 'Failed to create reservation');
        } finally {
            setLoading(false);
        }
    };

    if (!park) {
        return (
            <div className="container">
                <p>Park information not available. Please go back and try again.</p>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="container">
                <div className="booking-header">
                    <h1>Complete Your Booking</h1>
                    <p>Reserve your visit to {park.name}</p>
                </div>

                <div className="booking-content">
                    <div className="booking-form-container">
                        <form onSubmit={handleSubmit} className="booking-form">
                            <div className="form-section">
                                <h3>Visit Details</h3>

                                <div className="form-group">
                                    <label htmlFor="visitDate" className="form-label">
                                        Visit Date *
                                    </label>
                                    <input
                                        type="date"
                                        id="visitDate"
                                        name="visitDate"
                                        className="form-input"
                                        value={formData.visitDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="numberOfVisitors" className="form-label">
                                        Number of Visitors *
                                    </label>
                                    <input
                                        type="number"
                                        id="numberOfVisitors"
                                        name="numberOfVisitors"
                                        className="form-input"
                                        value={formData.numberOfVisitors}
                                        onChange={handleChange}
                                        min="1"
                                        max="20"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="visitorType" className="form-label">
                                        Visitor Type *
                                    </label>
                                    <select
                                        id="visitorType"
                                        name="visitorType"
                                        className="form-input"
                                        value={formData.visitorType}
                                        onChange={handleChange}
                                        required
                                    >
                                        {visitorTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label} - RWF {type.price.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="specialRequests" className="form-label">
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        id="specialRequests"
                                        name="specialRequests"
                                        className="form-input"
                                        rows={4}
                                        value={formData.specialRequests}
                                        onChange={handleChange}
                                        placeholder="Any special requirements or requests..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </form>
                    </div>

                    <div className="booking-summary">
                        <div className="card">
                            <h3>Booking Summary</h3>

                            <div className="summary-item">
                                <span>Park</span>
                                <strong>{park.name}</strong>
                            </div>

                            <div className="summary-item">
                                <span>Location</span>
                                <span>{park.location}</span>
                            </div>

                            <div className="summary-item">
                                <span>Date</span>
                                <strong>{formData.visitDate || 'Not selected'}</strong>
                            </div>

                            <div className="summary-item">
                                <span>Visitors</span>
                                <strong>{formData.numberOfVisitors}</strong>
                            </div>

                            <div className="summary-item">
                                <span>Type</span>
                                <span>{selectedVisitorType?.label}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-item summary-total">
                                <span>Estimated Total</span>
                                <strong>RWF {estimatedTotal.toLocaleString()}</strong>
                            </div>

                            <div className="summary-note">
                                <p>
                                    <strong>Note:</strong> Final price will be calculated based on
                                    current pricing rules and may vary.
                                </p>
                            </div>
                        </div>

                        <div className="card booking-policies">
                            <h4>Cancellation Policy</h4>
                            <ul>
                                <li>7+ days before: 90% refund</li>
                                <li>3-6 days before: 50% refund</li>
                                <li>Less than 3 days: No refund</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
