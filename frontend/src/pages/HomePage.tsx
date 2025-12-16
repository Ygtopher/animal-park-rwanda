import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <header className="hero">
                <div className="theme-toggle-container">
                    <ThemeToggle />
                </div>
                <div className="container">
                    <h1 className="hero-title animate-fade-in">
                        Discover Rwanda's Wildlife
                    </h1>
                    <p className="hero-subtitle animate-fade-in">
                        Book your adventure in Rwanda's magnificent national parks
                    </p>
                    <div className="hero-actions animate-fade-in">
                        <Link to="/parks" className="btn btn-primary btn-lg">
                            Explore Parks
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg">
                            Login
                        </Link>
                    </div>
                </div>
            </header>

            <section className="features">
                <div className="container">
                    <h2 className="text-center">Why Choose Animal Park Rwanda?</h2>
                    <div className="grid grid-cols-3">
                        <div className="card text-center">
                            <div className="feature-icon">🦁</div>
                            <h3>Amazing Wildlife</h3>
                            <p>Experience the Big Five and rare mountain gorillas</p>
                        </div>
                        <div className="card text-center">
                            <div className="feature-icon">📱</div>
                            <h3>Easy Booking</h3>
                            <p>Book online with instant confirmation and e-tickets</p>
                        </div>
                        <div className="card text-center">
                            <div className="feature-icon">💳</div>
                            <h3>Secure Payment</h3>
                            <p>Pay safely with Mobile Money or card</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="parks-preview">
                <div className="container">
                    <h2 className="text-center">Featured Parks</h2>
                    <p className="text-center text-secondary">
                        Explore Rwanda's most popular national parks
                    </p>
                    <div className="grid grid-cols-2">
                        <div className="card">
                            <h3>Akagera National Park</h3>
                            <p>Home to the Big Five in Rwanda's only savannah park</p>
                            <Link to="/parks" className="btn btn-primary">View Details</Link>
                        </div>
                        <div className="card">
                            <h3>Volcanoes National Park</h3>
                            <p>Trek to see endangered mountain gorillas</p>
                            <Link to="/parks" className="btn btn-primary">View Details</Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container text-center">
                    <p>&copy; 2024 Animal Park Rwanda. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
