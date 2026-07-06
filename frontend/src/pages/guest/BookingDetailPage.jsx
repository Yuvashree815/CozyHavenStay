import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBookingByIdApi, cancelBookingApi, getRefundPolicyApi } from '../../api/bookingApi';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingSuccess = location.state?.bookingSuccess || false;

  const [booking, setBooking] = useState(null);
  const [refundPolicy, setRefundPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await getBookingByIdApi(id);
      setBooking(response.data);
    } catch (err) {
      setError('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowCancelConfirm = async () => {
    setShowCancelConfirm(true);
    setPolicyLoading(true);
    try {
      const response = await getRefundPolicyApi(id);
      setRefundPolicy(response.data);
    } catch (err) {
      // Policy fetch failing doesn't block cancellation
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      await cancelBookingApi(id);
      await fetchBooking();
      setShowCancelConfirm(false);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
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

  const getPaymentStatusBadge = (status) => {
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
      <p className="mt-2">Loading booking details...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!booking) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">

        {/* Success banner */}
        {bookingSuccess && (
          <div className="alert alert-success d-flex align-items-center mb-4">
            <span className="fs-4 me-3">🎉</span>
            <div>
              <strong>Booking Confirmed!</strong> Your room has been reserved
              successfully. Payment has been processed.
            </div>
          </div>
        )}

        {/* Cancel error */}
        {cancelError && (
          <div className="alert alert-danger">{cancelError}</div>
        )}

        {/* Booking header */}
        <div className="card shadow-sm mb-4">
          <div
            className="card-header text-white d-flex justify-content-between align-items-center"
            style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
          >
            <h5 className="mb-0">Booking #{booking.id}</h5>
            <span className={`badge ${getStatusBadge(booking.status)} fs-6`}>
              {booking.status}
            </span>
          </div>

          <div className="card-body">
            {/* Dates */}
            <div className="row mb-3">
              <div className="col-md-6">
                <p className="text-muted small mb-1">Check-in</p>
                <p className="fw-bold mb-0">
                  {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric',
                    month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="col-md-6">
                <p className="text-muted small mb-1">Check-out</p>
                <p className="fw-bold mb-0">
                  {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric',
                    month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <hr />

            {/* Guests */}
            <div className="row mb-3">
              <div className="col-md-4">
                <p className="text-muted small mb-1">Adults</p>
                <p className="fw-bold mb-0">{booking.numberOfAdults}</p>
              </div>
              <div className="col-md-4">
                <p className="text-muted small mb-1">Children</p>
                <p className="fw-bold mb-0">{booking.numberOfChildren}</p>
              </div>
              <div className="col-md-4">
                <p className="text-muted small mb-1">Guest Ages</p>
                <p className="fw-bold mb-0">
                  {booking.guestAges?.join(', ') || '-'}
                </p>
              </div>
            </div>

            <hr />

            {/* Fare breakdown */}
            <div className="row mb-3">
              <div className="col-md-4">
                <p className="text-muted small mb-1">Base Fare</p>
                <p className="fw-bold mb-0">₹{booking.baseFare?.toLocaleString()}</p>
              </div>
              <div className="col-md-4">
                <p className="text-muted small mb-1">Surcharge</p>
                <p className="fw-bold mb-0">₹{booking.surchargeAmount?.toLocaleString()}</p>
              </div>
              <div className="col-md-4">
                <p className="text-muted small mb-1">Total Fare</p>
                <p className="fw-bold text-primary fs-5 mb-0">
                  ₹{booking.totalFare?.toLocaleString()}
                </p>
              </div>
            </div>

            <hr />

            {/* Payment */}
            {booking.payment && (
              <div className="row mb-3">
                <div className="col-md-4">
                  <p className="text-muted small mb-1">Payment Status</p>
                  <span className={`badge ${getPaymentStatusBadge(booking.payment.status)}`}>
                    {booking.payment.status}
                  </span>
                </div>
                <div className="col-md-4">
                  <p className="text-muted small mb-1">Payment Method</p>
                  <p className="fw-bold mb-0">{booking.payment.method}</p>
                </div>
                <div className="col-md-4">
                  <p className="text-muted small mb-1">Transaction Ref</p>
                  <p className="fw-bold mb-0 small">
                    {booking.payment.transactionReference || '-'}
                  </p>
                </div>
                {booking.payment.refundAmount !== null &&
                  booking.payment.refundAmount !== undefined && (
                  <div className="col-md-4 mt-2">
                    <p className="text-muted small mb-1">Refund Amount</p>
                    <p className="fw-bold text-info mb-0">
                      ₹{booking.payment.refundAmount?.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {booking.status === 'Confirmed' && (
            <div className="card-footer bg-white border-0 d-flex gap-2">
              {/* Cancel button */}
              {!showCancelConfirm ? (
                <button
                  className="btn btn-outline-danger"
                  onClick={handleShowCancelConfirm}
                >
                  Cancel Booking
                </button>
              ) : (
                <div className="w-100">
                  {/* Refund policy before confirming cancel */}
                  {policyLoading ? (
                    <p className="text-muted small">Loading refund policy...</p>
                  ) : refundPolicy && (
                    <div className="alert alert-warning small mb-2">
                      <strong>Refund Policy:</strong> {refundPolicy.policy}
                      <br />
                      <strong>You will receive: ₹{refundPolicy.refundAmount?.toLocaleString()}</strong>
                      {' '}({refundPolicy.refundPercentage}% of ₹{refundPolicy.totalFare?.toLocaleString()})
                    </div>
                  )}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-danger"
                      onClick={handleCancel}
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Write review button — only if checkout date passed */}
              {new Date(booking.checkOut) < new Date() && (
                <button
                  className="btn btn-outline-warning"
                  onClick={() => navigate(`/bookings/${id}/review`, {
                    state: { booking }
                  })}
                >
                  ⭐ Write Review
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/my-bookings')}
          >
            ← My Bookings
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;