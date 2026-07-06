import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookingsApi } from '../../api/bookingApi';
import { getHotelByIdApi } from '../../api/hotelApi';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [hotelNames, setHotelNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { fetchBookings(); }, [pageNumber]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getMyBookingsApi(pageNumber, 5);
      const items = response.data.items;
      setBookings(items);
      setTotalPages(response.data.totalPages);

      const uniqueHotelIds = [...new Set(items.map(b => b.hotelId))];
      const hotelNameMap = {};
      await Promise.all(
        uniqueHotelIds.map(async (hotelId) => {
          try {
            const hotelRes = await getHotelByIdApi(hotelId);
            hotelNameMap[hotelId] = hotelRes.data.name;
          } catch {
            hotelNameMap[hotelId] = `Hotel #${hotelId}`;
          }
        })
      );
      setHotelNames(hotelNameMap);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      Confirmed: 'badge-confirmed',
      Pending: 'badge-pending',
      Cancelled: 'badge-cancelled',
    };
    return map[status] || 'badge-pending';
  };

  const getPaymentClass = (status) => {
    const map = {
      Completed: 'badge-confirmed',
      RefundPending: 'badge-pending',
      Refunded: 'badge-refunded',
      Pending: 'badge-pending',
      Failed: 'badge-cancelled',
    };
    return map[status] || 'badge-pending';
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
      <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
        Loading your bookings...
      </p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h4 className="page-title">My Bookings</h4>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem', margin: 0
          }}>
            Your stay history and upcoming reservations
          </p>
        </div>
        <button className="btn btn-primary"
          onClick={() => navigate('/')}>
          + New Booking
        </button>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da', border: '1px solid #f5c6cb',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem'
        }}>⚠️ {error}</div>
      )}

      {bookings.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
          <h5 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
            No bookings yet
          </h5>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Start exploring hotels and book your first stay.
          </p>
          <button className="btn btn-primary px-4"
            onClick={() => navigate('/')}>
            Explore Hotels
          </button>
        </div>
      ) : (
        <>
          {bookings.map((booking) => (
            <div className="booking-card" key={booking.id}>
              <div className="booking-card-header">
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    width: 36, height: 36, borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.1rem',
                    flexShrink: 0
                  }}>
                    🏨
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {hotelNames[booking.hotelId] || `Hotel #${booking.hotelId}`}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-light)'
                    }}>
                      Booking #{String(booking.id).padStart(6, '0')}
                    </div>
                  </div>
                </div>
                <span className={getStatusClass(booking.status)}>
                  {booking.status}
                </span>
              </div>

              <div style={{ padding: '1rem 1.25rem' }}>
                <div className="row align-items-center">
                  <div className="col-md-7">
                    {/* Date range */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '0.75rem', marginBottom: '0.6rem'
                    }}>
                      <div style={{
                        padding: '0.4rem 0.75rem',
                        background: 'var(--surface-warm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-light)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Check-in</div>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>
                        →
                      </div>
                      <div style={{
                        padding: '0.4rem 0.75rem',
                        background: 'var(--surface-warm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-light)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Check-out</div>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)'
                    }}>
                      👥 {booking.numberOfAdults} adult(s),
                      {' '}{booking.numberOfChildren} child(ren)
                    </div>
                  </div>

                  <div className="col-md-5 text-md-end mt-2 mt-md-0">
                    <div className="price-tag">
                      ₹{booking.totalFare?.toLocaleString()}
                    </div>
                    {booking.payment && (
                      <div className="mt-1 mb-2">
                        <span className={getPaymentClass(booking.payment.status)}>
                          {booking.payment.status}
                        </span>
                      </div>
                    )}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: '0.5rem', marginTop: '1.5rem'
            }}>
              <button className="btn btn-outline-primary btn-sm"
                disabled={pageNumber === 1}
                onClick={() => setPageNumber(p => p - 1)}>
                ← Previous
              </button>
              <span style={{
                padding: '0.375rem 0.75rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                {pageNumber} / {totalPages}
              </span>
              <button className="btn btn-outline-primary btn-sm"
                disabled={pageNumber === totalPages}
                onClick={() => setPageNumber(p => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookingsPage;