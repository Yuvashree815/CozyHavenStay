import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div
        className="text-white text-center py-5 mb-4 rounded"
        style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
      >
        <h1 className="display-4 fw-bold mb-3">
          🏨 Find Your Perfect Stay
        </h1>
        <p className="lead mb-4">
          Discover and book hotels across India — simple, fast, and reliable.
        </p>

        {/* Search bar */}
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search by city or location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-warning btn-lg fw-bold px-4"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="row text-center mb-5">
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-0 shadow-sm p-3">
            <div className="card-body">
              <div className="fs-1 mb-3">🔍</div>
              <h5 className="card-title">Easy Search</h5>
              <p className="card-text text-muted">
                Search hotels by location and find available rooms instantly.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-0 shadow-sm p-3">
            <div className="card-body">
              <div className="fs-1 mb-3">💳</div>
              <h5 className="card-title">Instant Booking</h5>
              <p className="card-text text-muted">
                Book your room in seconds with transparent pricing and no hidden fees.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-0 shadow-sm p-3">
            <div className="card-body">
              <div className="fs-1 mb-3">⭐</div>
              <h5 className="card-title">Verified Reviews</h5>
              <p className="card-text text-muted">
                Read reviews from guests who have actually stayed — no fake reviews.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular locations */}
      <h4 className="mb-3">Popular Destinations</h4>
      <div className="row">
        {['Chennai', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Kolkata'].map((city) => (
          <div className="col-md-2 col-4 mb-3" key={city}>
            <button
              className="btn btn-outline-primary w-100"
              onClick={() => navigate(`/search?location=${city}`)}
            >
              {city}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;