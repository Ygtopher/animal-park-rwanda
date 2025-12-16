import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { parkApi, Park } from '../api/park.api';
import './ParksPage.css';

const ParksPage = () => {
    const [parks, setParks] = useState<Park[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        province: '',
        search: '',
    });

    useEffect(() => {
        fetchParks();
    }, [filters]);

    const fetchParks = async () => {
        try {
            setLoading(true);
            const response = await parkApi.getAllParks(filters);
            setParks(response.data);
        } catch (error) {
            console.error('Failed to fetch parks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="parks-page">
            <div className="parks-hero">
                <div className="container">
                    <h1>Explore Rwanda's National Parks</h1>
                    <p>Discover amazing wildlife and breathtaking landscapes</p>
                </div>
            </div>

            <div className="container">
                <div className="parks-filters">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search parks..."
                        className="form-input"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />

                    <select
                        name="province"
                        className="form-input"
                        value={filters.province}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Provinces</option>
                        <option value="KIGALI">Kigali</option>
                        <option value="NORTHERN">Northern</option>
                        <option value="SOUTHERN">Southern</option>
                        <option value="EASTERN">Eastern</option>
                        <option value="WESTERN">Western</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading parks...</p>
                    </div>
                ) : (
                    <div className="parks-grid">
                        {parks.map((park) => (
                            <div key={park.id} className="park-card card">
                                <div className="park-image">
                                    <img
                                        src={park.imageUrls[0] || '/placeholder-park.jpg'}
                                        alt={park.name}
                                    />
                                    <div className="park-badge">{park.province}</div>
                                </div>

                                <div className="park-content">
                                    <h3>{park.name}</h3>
                                    <p className="park-location">📍 {park.location}</p>
                                    <p className="park-description">
                                        {park.description.substring(0, 120)}...
                                    </p>

                                    <div className="park-stats">
                                        <div className="stat">
                                            <span className="stat-label">Rating</span>
                                            <span className="stat-value">
                                                ⭐ {park.averageRating.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Reviews</span>
                                            <span className="stat-value">{park.reviewCount}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">From</span>
                                            <span className="stat-value">
                                                RWF {park.basePrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Link to={`/parks/${park.id}`} className="btn btn-primary">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && parks.length === 0 && (
                    <div className="no-results">
                        <p>No parks found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParksPage;
