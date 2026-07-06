import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'Find the perfect hotel by location, amenities, and availability in seconds.'
  },
  {
    icon: '💳',
    title: 'Instant Booking',
    desc: 'Book your room instantly with transparent pricing and no hidden charges.'
  },
  {
    icon: '⭐',
    title: 'Verified Reviews',
    desc: 'Every review comes from a guest who actually completed their stay.'
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    desc: 'Your payment information is always protected with bank-level security.'
  },
];

const cities = [
  { name: 'Chennai', emoji: '🌊' },
  { name: 'Mumbai', emoji: '🏙️' },
  { name: 'Bangalore', emoji: '🌿' },
  { name: 'Delhi', emoji: '🏛️' },
  { name: 'Hyderabad', emoji: '💎' },
  { name: 'Kolkata', emoji: '🎭' },
];

const HomePage = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (location.trim()) {
      navigate(`/search?location=${encodeURIComponent(location.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <p style={{
                color: 'var(--accent)',
                fontWeight: 600,
                letterSpacing: '2px',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                ✦ Premium Hotel Booking
              </p>
              <h1 className="hero-title">
                Find Your Perfect <span>Stay</span>
              </h1>
              <p className="hero-subtitle">
                Discover handpicked hotels across India — from cozy boutique stays
                to luxury resorts. Book with confidence.
              </p>

              {/* Search box */}
              <form onSubmit={handleSearch}>
                <div className="hero-search-box mx-auto">
                  <input
                    type="text"
                    className="form-control hero-search-input"
                    placeholder="Where do you want to stay? (e.g. Chennai, Mumbai...)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                  <button type="submit" className="hero-search-btn">
                    🔍 Search
                  </button>
                </div>
              </form>

              {/* Quick stats */}
              <div className="d-flex justify-content-center gap-4 mt-4">
                {[
                  { num: '500+', label: 'Hotels' },
                  { num: '50K+', label: 'Happy Guests' },
                  { num: '100+', label: 'Cities' },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      fontFamily: 'Playfair Display, serif'
                    }}>
                      {num}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="mb-5">
        <h4 className="section-title">Popular Destinations</h4>
        <div className="d-flex flex-wrap gap-2 mt-3">
          {cities.map(({ name, emoji }) => (
            <button
              key={name}
              className="city-pill"
              onClick={() => navigate(`/search?location=${name}`)}
            >
              {emoji} {name}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-5">
        <h4 className="section-title">Why CozyHavenStay?</h4>
        <div className="row mt-3">
          {features.map(({ icon, title, desc }) => (
            <div className="col-md-3 col-sm-6 mb-3" key={title}>
              <div className="feature-card">
                <div className="feature-icon">{icon}</div>
                <div className="feature-title">{title}</div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        textAlign: 'center',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>
          Ready to find your perfect stay?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
          Join thousands of travelers who book with CozyHavenStay every day.
        </p>
        <button
          className="btn-gold px-4 py-2"
          style={{ borderRadius: 'var(--radius-sm)', fontSize: '1rem' }}
          onClick={() => navigate('/register')}
        >
          Get Started — It's Free
        </button>
      </div>
    </div>
  );
};

export default HomePage;