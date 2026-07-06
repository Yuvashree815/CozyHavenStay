import { useState, useEffect } from 'react';
import { getAllHotelsAdminApi, deactivateHotelApi } from '../../api/hotelApi';

const AllHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => { fetchHotels(); }, [pageNumber]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await getAllHotelsAdminApi(pageNumber, 10);
      setHotels(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch {
      setError('Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (hotelId) => {
    if (!window.confirm('Deactivate this hotel listing?')) return;
    setDeactivatingId(hotelId);
    try {
      await deactivateHotelApi(hotelId);
      setHotels(hotels.map(h => h.id === hotelId ? { ...h, isActive: false } : h));
    } catch {
      setError('Failed to deactivate hotel.');
    } finally {
      setDeactivatingId(null);
    }
  };

  const filteredHotels = filterStatus === 'All'
    ? hotels
    : hotels.filter(h => filterStatus === 'Active' ? h.isActive : !h.isActive);

  const getAmenityCount = (hotel) => {
    return [
      hotel.hasFreeWifi, hotel.hasDining, hotel.hasParking,
      hotel.hasSwimmingPool, hotel.hasFitnessCenter, hotel.hasRoomService
    ].filter(Boolean).length;
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
      <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
        Loading hotels...
      </p>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h4 className="page-title">Hotel Management</h4>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0
          }}>
            {totalCount} hotel listings on the platform
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da', border: '1px solid #f5c6cb',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem'
        }}>⚠️ {error}</div>
      )}

      <div className="admin-card">
        {/* Header with filters */}
        <div className="admin-card-header">
          <h5>All Hotels</h5>
          <div className="d-flex gap-2">
            {['All', 'Active', 'Inactive'].map(status => (
              <button
                key={status}
                className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status === 'All' ? '🏨' : status === 'Active' ? '✅' : '❌'} {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="pro-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>Hotel</th>
                <th>Location</th>
                <th>Owner ID</th>
                <th>Amenities</th>
                <th>Status</th>
                <th>Listed</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    textAlign: 'center', padding: '3rem',
                    color: 'var(--text-secondary)'
                  }}>
                    No hotels found
                  </td>
                </tr>
              ) : filteredHotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td style={{ paddingLeft: '1.5rem' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="table-avatar" style={{
                        background: '#e8f5e9', color: '#2e7d32',
                        fontSize: '1rem'
                      }}>
                        🏨
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {hotel.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem', color: 'var(--text-light)'
                        }}>
                          #{hotel.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    📍 {hotel.location}
                  </td>
                  <td>
                    <span style={{
                      background: '#e8f0fe', color: '#1a56db',
                      border: '1px solid #c3d4fb',
                      fontSize: '0.75rem', fontWeight: 600,
                      padding: '0.2rem 0.6rem', borderRadius: '20px'
                    }}>
                      Owner #{hotel.ownerId}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      background: 'var(--surface-warm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.78rem', fontWeight: 500,
                      padding: '0.2rem 0.6rem', borderRadius: '20px',
                      color: 'var(--text-secondary)'
                    }}>
                      {getAmenityCount(hotel)} amenities
                    </span>
                  </td>
                  <td>
                    <span className={hotel.isActive ? 'status-active' : 'status-inactive'}>
                      {hotel.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(hotel.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    {hotel.isActive ? (
                      <button
                        className="btn-deactivate"
                        onClick={() => handleDeactivate(hotel.id)}
                        disabled={deactivatingId === hotel.id}
                      >
                        {deactivatingId === hotel.id
                          ? 'Deactivating...'
                          : 'Deactivate'}
                      </button>
                    ) : (
                      <span style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-light)',
                        fontStyle: 'italic'
                      }}>
                        Deactivated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Page {pageNumber} of {totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(p => p - 1)}
              >
                ← Previous
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pageNumber === totalPages}
                onClick={() => setPageNumber(p => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllHotelsPage;