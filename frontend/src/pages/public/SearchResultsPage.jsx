import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchHotelsApi, filterHotelsApi } from '../../api/hotelApi';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const location = searchParams.get('location') || '';
  const originalQuery = searchParams.get('originalQuery') || '';
  const hasFreeWifi = searchParams.get('hasFreeWifi') === 'true';
  const hasDining = searchParams.get('hasDining') === 'true';
  const hasParking = searchParams.get('hasParking') === 'true';
  const hasSwimmingPool = searchParams.get('hasSwimmingPool') === 'true';
  const hasFitnessCenter = searchParams.get('hasFitnessCenter') === 'true';
  const hasRoomService = searchParams.get('hasRoomService') === 'true';

  const isFiltered = hasFreeWifi || hasDining || hasParking ||
    hasSwimmingPool || hasFitnessCenter || hasRoomService;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchHotels();
  }, [location, pageNumber, hasFreeWifi, hasDining, hasParking,
    hasSwimmingPool, hasFitnessCenter, hasRoomService]);

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (isFiltered) {
        response = await filterHotelsApi({
          location: location || null,
          hasFreeWifi: hasFreeWifi || null,
          hasDining: hasDining || null,
          hasParking: hasParking || null,
          hasSwimmingPool: hasSwimmingPool || null,
          hasFitnessCenter: hasFitnessCenter || null,
          hasRoomService: hasRoomService || null,
          pageNumber,
          pageSize: 6
        });
      } else {
        response = await searchHotelsApi(location, pageNumber, 6);
      }
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

  const activeFilters = [
    hasFreeWifi && '📶 WiFi',
    hasDining && '🍽️ Dining',
    hasParking && '🚗 Parking',
    hasSwimmingPool && '🏊 Pool',
    hasFitnessCenter && '💪 Gym',
    hasRoomService && '🛎️ Room Service',
  ].filter(Boolean);

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
          {/* Show original query if smart search */}
          {originalQuery && (
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '0.5rem', marginBottom: '0.4rem'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                color: 'white', fontSize: '0.72rem', fontWeight: 600,
                padding: '0.2rem 0.6rem', borderRadius: '20px',
                letterSpacing: '0.5px'
              }}>
                🔍 Smart Search
              </span>
              <span style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                "{originalQuery}"
              </span>
            </div>
          )}

          <h4 className="search-title mb-1">
            {location
              ? <>Hotels in <span className="text-navy">{location}</span></>
              : 'Filtered Hotels'}
          </h4>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem', margin: 0
          }}>
            {totalCount > 0
              ? `${totalCount} hotel${totalCount > 1 ? 's' : ''} found`
              : 'No hotels found'}
          </p>

          {/* Active amenity filter chips */}
          {activeFilters.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mt-2">
              {activeFilters.map(filter => (
                <span key={filter} style={{
                  background: 'rgba(26,60,94,0.08)',
                  border: '1px solid rgba(26,60,94,0.2)',
                  color: 'var(--primary)', fontSize: '0.75rem',
                  fontWeight: 600, padding: '0.2rem 0.6rem',
                  borderRadius: '20px'
                }}>
                  {filter}
                </span>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-outline-primary btn-sm"
          onClick={() => navigate('/')}>
          ← New Search
        </button>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da', border: '1px solid #f5c6cb',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem'
        }}>⚠️ {error}</div>
      )}

      {!loading && !error && hotels.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
          <h4 style={{ fontFamily: 'Playfair Display, serif' }}>
            No hotels found
          </h4>
          <p style={{
            color: 'var(--text-secondary)', marginBottom: '1.5rem'
          }}>
            Try a different location or adjust your search.
          </p>
          <button className="btn btn-primary px-4"
            onClick={() => navigate('/')}>
            Back to Search
          </button>
        </div>
      )}

      {/* Hotel cards */}
      <div className="row">
        {hotels.map((hotel) => (
          <div className="col-md-6 col-lg-4 mb-4" key={hotel.id}>
            <div className="hotel-card">
              <div className="hotel-card-image">
                🏨
                <div style={{
                  position: 'absolute', bottom: '0.75rem',
                  left: '0.75rem', zIndex: 1
                }}>
                  {hotel.isActive && (
                    <span style={{
                      background: 'rgba(45,122,79,0.9)', color: 'white',
                      fontSize: '0.75rem', padding: '0.2rem 0.6rem',
                      borderRadius: '20px', fontWeight: 600
                    }}>
                      ✓ Available
                    </span>
                  )}
                </div>
              </div>

              <div className="hotel-card-body">
                <h5 className="hotel-card-name">{hotel.name}</h5>
                <p className="hotel-card-location">📍 {hotel.location}</p>

                {hotel.description && (
                  <p style={{
                    fontSize: '0.85rem', color: 'var(--text-secondary)',
                    marginBottom: '0.75rem', lineHeight: 1.5
                  }}>
                    {hotel.description.length > 90
                      ? hotel.description.substring(0, 90) + '...'
                      : hotel.description}
                  </p>
                )}

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
                <button className="btn btn-primary w-100"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}>
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
          <button className="btn btn-outline-primary"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(p => p - 1)}>
            ← Previous
          </button>
          <span style={{
            padding: '0.375rem 0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem', color: 'var(--text-secondary)'
          }}>
            {pageNumber} / {totalPages}
          </span>
          <button className="btn btn-outline-primary"
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber(p => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;