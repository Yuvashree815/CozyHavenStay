import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelBookingsApi } from '../../api/bookingApi';

const HotelBookingsPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [hotelId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getHotelBookingsApi(hotelId);
      setBookings(response.data || []);
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
      <p className="mt-2">Loading bookings...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Hotel Bookings</h4>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/owner/hotels')}
        >
          ← My Hotels
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">📋</div>
          <h5 className="mt-3">No bookings yet</h5>
          <p className="text-muted">
            Bookings for this hotel will appear here.
          </p>
        </div>
      ) : (
        <>
          <p className="text-muted mb-3">
            {bookings.length} booking(s) found
          </p>
          {bookings.map((booking) => (
            <div className="card shadow-sm mb-3" key={booking.id}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="fw-bold mb-1">
                      Booking #{booking.id}
                    </h6>
                    <p className="text-muted small mb-1">
                      👤 Guest ID: {booking.userId}
                    </p>
                    <p className="text-muted small mb-1">
                      🛏️ Room ID: {booking.roomId}
                    </p>
                    <p className="text-muted small mb-1">
                      📅 {new Date(booking.checkIn).toLocaleDateString('en-IN')}
                      {' → '}
                      {new Date(booking.checkOut).toLocaleDateString('en-IN')}
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
                    <span className={`badge ${getStatusBadge(booking.status)} d-block mb-1`}>
                      {booking.status}
                    </span>
                    {booking.payment && (
                      <span className={`badge ${getPaymentBadge(booking.payment.status)} d-block`}>
                        {booking.payment.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default HotelBookingsPage;