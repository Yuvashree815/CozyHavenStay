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

  useEffect(() => {
    fetchBookings();
  }, [pageNumber]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getMyBookingsApi(pageNumber, 5);
      const items = response.data.items;
      setBookings(items);
      setTotalPages(response.data.totalPages);

      // Fetch hotel names for all unique hotel IDs in this page
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
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Confirmed: 'bg-success',
      Pending: 'bg-warning text-dark',
      Cancelled: 'bg-danger',
    };
    return map[status] || 'bg-secondary';
  };

  const getPaymentBadge = (status) => {
    const map = {
      Completed: 'bg-success',
      RefundPending: 'bg-warning text-dark',
      Refunded: 'bg-info',
      Pending: 'bg-secondary',
      Failed: 'bg-danger',
    };
    return map[status] || 'bg-secondary';
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading your bookings...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">My Bookings</h4>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          + New Booking
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">🏨</div>
          <h5 className="mt-3">No bookings yet</h5>
          <p className="text-muted">
            Start exploring hotels and book your first stay.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Explore Hotels
          </button>
        </div>
      ) : (
        <>
          {bookings.map((booking) => (
            <div className="card shadow-sm mb-3" key={booking.id}>
              <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{ background: '#f8f9fa' }}
              >
                <div>
                  <span className="fw-bold">
                    🏨 {hotelNames[booking.hotelId] || `Hotel #${booking.hotelId}`}
                  </span>
                  <small className="text-muted ms-2">
                    Booking #{booking.id}
                  </small>
                </div>
                <span className={`badge ${getStatusBadge(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">
                      📅 {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                      {' → '}
                      {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                    <p className="text-muted small mb-1">
                      👥 {booking.numberOfAdults} adult(s),
                      {' '}{booking.numberOfChildren} child(ren)
                    </p>
                    <p className="fw-bold text-primary mb-0">
                      ₹{booking.totalFare?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-end">
                    {booking.payment && (
                      <span className={`badge ${getPaymentBadge(booking.payment.status)} d-block mb-2`}>
                        {booking.payment.status}
                      </span>
                    )}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

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
        </>
      )}
    </div>
  );
};

export default MyBookingsPage;