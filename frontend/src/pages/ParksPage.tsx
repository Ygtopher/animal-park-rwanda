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
        <div className="parks-page-immersive">
            <div className="parks-hero-minimal">
                <div className="container">
                    <h1>Discover Rwanda's Wildlife</h1>
                    <p>Explore breathtaking national parks and encounter Africa's magnificent wildlife</p>
                </div>
            </div>

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
                <div className="parks-container">
                    {parks.map((park) => (
                        <div key={park.id} className="park-hero-card">
                            <div className="park-hero-image">
                                <img
                                    src={park.imageUrls[0] || '/placeholder-park.jpg'}
                                    alt={park.name}
                                />
                                <div className="park-overlay-gradient"></div>
                            </div>

                            <div className="park-glass-content">
                                <span className="park-badge-glass">{park.province}</span>
                                <h2>{park.name}</h2>
                                <p className="park-location-icon">📍 {park.location}</p>
                                <p className="park-brief">
                                    {park.description.substring(0, 120)}...
                                </p>
                                <Link to={`/parks/${park.id}`} className="btn-glass">
                                    Explore Park →
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
    );
};

export default ParksPage;
