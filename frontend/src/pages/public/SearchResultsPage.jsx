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
  const navigate = useNavigate();

  useEffect(() => {
    if (location) {
      fetchHotels();
    }
  }, [location, pageNumber]);

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await searchHotelsApi(location, pageNumber, 6);
      setHotels(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAmenities = (hotel) => {
    const amenities = [];
    if (hotel.hasFreeWifi) amenities.push('📶 Free WiFi');
    if (hotel.hasDining) amenities.push('🍽️ Dining');
    if (hotel.hasParking) amenities.push('🚗 Parking');
    if (hotel.hasSwimmingPool) amenities.push('🏊 Pool');
    if (hotel.hasFitnessCenter) amenities.push('💪 Gym');
    if (hotel.hasRoomService) amenities.push('🛎️ Room Service');
    return amenities;
  };

  return (
    <div>
      {/* Search header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">
            Hotels in <span className="text-primary">{location}</span>
          </h4>
          {!loading && (
            <small className="text-muted">
              {hotels.length === 0 ? 'No hotels found' : `Showing page ${pageNumber} of ${totalPages}`}
            </small>
          )}
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/')}
        >
          ← New Search
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Searching hotels...</p>
        </div>
      )}

      {/* Error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* No results */}
      {!loading && !error && hotels.length === 0 && (
        <div className="text-center py-5">
          <div className="fs-1">🏨</div>
          <h5 className="mt-3">No hotels found in {location}</h5>
          <p className="text-muted">Try searching a different city.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Search
          </button>
        </div>
      )}

      {/* Hotel cards */}
      <div className="row">
        {hotels.map((hotel) => (
          <div className="col-md-6 col-lg-4 mb-4" key={hotel.id}>
            <div className="card h-100 shadow-sm">
              {/* Hotel header */}
              <div
                className="card-header text-white"
                style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
              >
                <h5 className="mb-0">{hotel.name}</h5>
                <small>📍 {hotel.location}</small>
              </div>

              <div className="card-body">
                {/* Description */}
                {hotel.description && (
                  <p className="card-text text-muted small mb-3">
                    {hotel.description.length > 100
                      ? hotel.description.substring(0, 100) + '...'
                      : hotel.description}
                  </p>
                )}

                {/* Amenities */}
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {getAmenities(hotel).map((amenity) => (
                    <span
                      key={amenity}
                      className="badge bg-light text-dark border"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-footer bg-white border-0">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  View Rooms & Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            ← Previous
          </button>
          <span className="btn btn-light disabled">
            Page {pageNumber} of {totalPages}
          </span>
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;