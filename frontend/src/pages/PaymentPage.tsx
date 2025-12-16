import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationApi, Reservation } from '../api/reservation.api';
import { paymentApi } from '../api/payment.api';
import toast from 'react-hot-toast';
import './PaymentPage.css';

const PaymentPage = () => {
    const { reservationId } = useParams<{ reservationId: string }>();
    const navigate = useNavigate();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CARD');

    useEffect(() => {
        if (reservationId) {
            fetchReservation();
        }
    }, [reservationId]);

    const fetchReservation = async () => {
        try {
            const response = await reservationApi.getReservationById(reservationId!);
            setReservation(response.data);
        } catch (error) {
            toast.error('Failed to load reservation');
            navigate('/my-bookings');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!reservation) return;

        try {
            setProcessing(true);

            // Step 1: Initiate payment
            toast.loading('Initiating payment...');
            const paymentResponse = await paymentApi.initiatePayment({
                reservationId: reservation.id,
                method: paymentMethod,
            });

            const transactionId = paymentResponse.data.payment.transactionId;

            // Step 2: Simulate payment (this sends the ticket email)
            toast.loading('Processing payment...');
            const simulateResponse = await paymentApi.simulatePayment(transactionId);

            if (simulateResponse.success) {
                toast.dismiss();
                toast.success(simulateResponse.message || 'Payment successful! Ticket sent to your email.');

                // Wait a moment then redirect
                setTimeout(() => {
                    navigate('/my-bookings');
                }, 2000);
            } else {
                toast.dismiss();
                toast.error(simulateResponse.message || 'Payment failed');
            }
        } catch (error: any) {
            toast.dismiss();
            console.error('Payment error:', error);
            toast.error(error.response?.data?.error || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-page">
                <div className="container">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading payment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!reservation) {
        return null;
    }

    return (
        <div className="payment-page">
            <div className="container">
                <div className="payment-container">
                    <h1>Complete Payment</h1>

                    <div className="reservation-summary card">
                        <h2>Booking Summary</h2>
                        <div className="summary-details">
                            <div className="detail-row">
                                <span>Park:</span>
                                <strong>{reservation.park.name}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Booking Reference:</span>
                                <strong>{reservation.bookingReference}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Visit Date:</span>
                                <strong>
                                    {new Date(reservation.visitDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </strong>
                            </div>
                            <div className="detail-row">
                                <span>Number of Visitors:</span>
                                <strong>{reservation.numberOfVisitors}</strong>
                            </div>
                            <div className="detail-row total">
                                <span>Total Amount:</span>
                                <strong>RWF {reservation.totalAmount.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="payment-method card">
                        <h2>Payment Method</h2>
                        <div className="payment-options">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="CARD"
                                    checked={paymentMethod === 'CARD'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>💳 Credit/Debit Card</span>
                            </label>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="MOBILE_MONEY_MTN"
                                    checked={paymentMethod === 'MOBILE_MONEY_MTN'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>📱 MTN Mobile Money</span>
                            </label>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="MOBILE_MONEY_AIRTEL"
                                    checked={paymentMethod === 'MOBILE_MONEY_AIRTEL'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>📱 Airtel Money</span>
                            </label>
                        </div>
                    </div>

                    <div className="payment-actions">
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/my-bookings')}
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handlePayment}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : `Pay RWF ${reservation.totalAmount.toLocaleString()}`}
                        </button>
                    </div>

                    <div className="payment-note">
                        <p>
                            <strong>📧 Note:</strong> Your ticket will be sent to your email address immediately after payment confirmation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
