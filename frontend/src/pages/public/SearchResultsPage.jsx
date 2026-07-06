import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchHotelsApi } from '../../api/hotelApi';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (location) fetchHotels();
  }, [location, pageNumber]);

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await searchHotelsApi(location, pageNumber, 6);
      setHotels(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch {
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAmenities = (hotel) => {
    const list = [];
    if (hotel.hasFreeWifi) list.push('📶 WiFi');
    if (hotel.hasDining) list.push('🍽️ Dining');
    if (hotel.hasParking) list.push('🚗 Parking');
    if (hotel.hasSwimmingPool) list.push('🏊 Pool');
    if (hotel.hasFitnessCenter) list.push('💪 Gym');
    if (hotel.hasRoomService) list.push('🛎️ Room Service');
    return list;
  };

  // Loading skeleton
  if (loading) return (
    <div>
      <div className="search-header">
        <div>
          <div className="skeleton" style={{ width: 220, height: 28, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 140, height: 18 }} />
        </div>
      </div>
      <div className="row">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div className="col-md-6 col-lg-4 mb-4" key={i}>
            <div className="hotel-card">
              <div className="skeleton" style={{ height: 200 }} />
              <div className="hotel-card-body">
                <div className="skeleton" style={{ height: 22, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
                <div className="d-flex gap-1">
                  <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 20 }} />
                  <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 20 }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Search header */}
      <div className="search-header">
        <div>
          <h4 className="search-title mb-1">
            Hotels in <span className="text-navy">{location}</span>
          </h4>
          <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
            {totalCount > 0
              ? `${totalCount} hotel${totalCount > 1 ? 's' : ''} found`
              : 'No hotels found'}
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate('/')}
        >
          ← New Search
        </button>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3">{error}</div>
      )}

      {/* No results */}
      {!loading && !error && hotels.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
          <h4 style={{ fontFamily: 'Playfair Display, serif' }}>
            No hotels found in {location}
          </h4>
          <p className="text-secondary mb-4">
            Try searching a nearby city or check the spelling.
          </p>
          <button className="btn btn-primary px-4" onClick={() => navigate('/')}>
            Back to Search
          </button>
        </div>
      )}

      {/* Hotel cards */}
      <div className="row">
        {hotels.map((hotel) => (
          <div className="col-md-6 col-lg-4 mb-4" key={hotel.id}>
            <div className="hotel-card">
              {/* Image placeholder with gradient */}
              <div className="hotel-card-image">
                🏨
                <div style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  left: '0.75rem',
                  zIndex: 1
                }}>
                  {hotel.isActive ? (
                    <span style={{
                      background: 'rgba(45,122,79,0.9)',
                      color: 'white',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      fontWeight: 600
                    }}>
                      ✓ Available
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="hotel-card-body">
                <h5 className="hotel-card-name">{hotel.name}</h5>
                <p className="hotel-card-location">
                  📍 {hotel.location}
                </p>

                {hotel.description && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.5
                  }}>
                    {hotel.description.length > 90
                      ? hotel.description.substring(0, 90) + '...'
                      : hotel.description}
                  </p>
                )}

                {/* Amenities */}
                <div className="d-flex flex-wrap gap-1">
                  {getAmenities(hotel).slice(0, 4).map((a) => (
                    <span key={a} className="amenity-badge">{a}</span>
                  ))}
                  {getAmenities(hotel).length > 4 && (
                    <span className="amenity-badge">
                      +{getAmenities(hotel).length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="hotel-card-footer">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  View Rooms & Availability →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-2 mb-4">
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(p => p - 1)}
          >
            ← Previous
          </button>
          <span className="btn btn-light disabled">
            {pageNumber} / {totalPages}
          </span>
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;