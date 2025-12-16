import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { parkApi, Park, Animal } from '../api/park.api';
import { RootState } from '../store/store';
import './ParkDetailPage.css';

const ParkDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [park, setPark] = useState<Park | null>(null);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [availability, setAvailability] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchParkDetails();
            fetchAnimals();
        }
    }, [id]);

    const fetchParkDetails = async () => {
        try {
            setLoading(true);
            const response = await parkApi.getParkById(id!);
            setPark(response.data);
        } catch (error) {
            console.error('Failed to fetch park details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnimals = async () => {
        try {
            const response = await parkApi.getAnimals(id!);
            setAnimals(response.data);
        } catch (error) {
            console.error('Failed to fetch animals:', error);
        }
    };

    const checkAvailability = async () => {
        if (!selectedDate) return;

        try {
            const response = await parkApi.checkAvailability(id!, selectedDate);
            setAvailability(response.data);
        } catch (error) {
            console.error('Failed to check availability:', error);
        }
    };

    const handleBookNow = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate(`/book/${id}`, { state: { park, selectedDate } });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading park details...</p>
            </div>
        );
    }

    if (!park) {
        return (
            <div className="container">
                <p>Park not found</p>
                <Link to="/parks" className="btn btn-primary">
                    Back to Parks
                </Link>
            </div>
        );
    }

    return (
        <div className="park-detail-page">
            <div className="park-hero" style={{ backgroundImage: `url(${park.imageUrls[0]})` }}>
                <div className="park-hero-overlay">
                    <div className="container">
                        <h1>{park.name}</h1>
                        <p className="park-location">📍 {park.location}, {park.province}</p>
                        <div className="park-rating">
                            ⭐ {park.averageRating.toFixed(1)} ({park.reviewCount} reviews)
                        </div>
                    </div>
                </div>
            </div>

            <div className="container park-content">
                <div className="park-main">
                    <section className="park-section">
                        <h2>About This Park</h2>
                        <p>{park.description}</p>
                    </section>

                    <section className="park-section">
                        <h2>Park Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Opening Hours</span>
                                <span className="info-value">
                                    {park.openingTime} - {park.closingTime}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Daily Capacity</span>
                                <span className="info-value">{park.capacity} visitors</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Province</span>
                                <span className="info-value">{park.province}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">District</span>
                                <span className="info-value">{park.district}</span>
                            </div>
                        </div>
                    </section>

                    {park.amenities && park.amenities.length > 0 && (
                        <section className="park-section">
                            <h2>Amenities</h2>
                            <div className="amenities-list">
                                {park.amenities.map((amenity, index) => (
                                    <span key={index} className="amenity-badge">
                                        ✓ {amenity}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="park-section">
                        <h2>Wildlife</h2>
                        <div className="animals-grid">
                            {animals.map((animal) => (
                                <div key={animal.id} className="animal-card card">
                                    <img src={animal.imageUrl} alt={animal.name} />
                                    <div className="animal-info">
                                        <h3>{animal.name}</h3>
                                        <p className="animal-species">{animal.species}</p>
                                        <p className="animal-description">{animal.description}</p>
                                        <div className="animal-meta">
                                            <span>Population: ~{animal.count}</span>
                                            {animal.endangered && (
                                                <span className="endangered-badge">Endangered</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="park-sidebar">
                    <div className="booking-card card">
                        <h3>Book Your Visit</h3>
                        <p className="price">
                            From <strong>RWF {park.basePrice.toLocaleString()}</strong> per person
                        </p>

                        <div className="form-group">
                            <label className="form-label">Select Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {selectedDate && (
                            <button
                                className="btn btn-outline"
                                onClick={checkAvailability}
                                style={{ width: '100%', marginBottom: 'var(--spacing-3)' }}
                            >
                                Check Availability
                            </button>
                        )}

                        {availability && (
                            <div className={`availability-info ${availability.available ? 'available' : 'unavailable'}`}>
                                {availability.available ? (
                                    <>
                                        <p className="availability-status">✓ Available</p>
                                        <p className="availability-slots">
                                            {availability.availableSlots} slots remaining
                                        </p>
                                    </>
                                ) : (
                                    <p className="availability-status">✗ Fully Booked</p>
                                )}
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleBookNow}
                            disabled={!selectedDate || (availability && !availability.available)}
                            style={{ width: '100%' }}
                        >
                            {isAuthenticated ? 'Book Now' : 'Login to Book'}
                        </button>
                    </div>

                    <div className="park-tips card">
                        <h4>Visitor Tips</h4>
                        <ul>
                            <li>Arrive early for the best wildlife viewing</li>
                            <li>Bring binoculars and a camera</li>
                            <li>Wear comfortable walking shoes</li>
                            <li>Follow ranger instructions at all times</li>
                            <li>Respect wildlife and maintain safe distances</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkDetailPage;
